from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List, Dict, Any
from sqlalchemy.orm.attributes import flag_modified
from app.core.database import get_db
from app.models.task import AgentTask
from app.tools.email_tool import send_email
from app.core.config import settings
from app.memory.retriever import store_memory
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/tasks", tags=["Tasks"])

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    task_id: str = Field(validation_alias='id')
    tenantId: str
    goal: str
    agentType: str
    status: str
    output: Optional[Dict[str, Any]] = None
    critic_feedback: Optional[str] = Field(None, alias='criticFeedback')
    retryCount: int

class UpdateTaskRequest(BaseModel):
    output: Dict[str, Any]


class ApproveResponse(BaseModel):
    total: int
    sent: int
    failed: int
    skipped: int
    results: List[Dict[str, Any]]
    task_id: str
    message: Optional[str] = None

@router.get("", response_model=List[TaskResponse])
async def list_tasks(tenant_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AgentTask)
        .where(AgentTask.tenantId == tenant_id)
        .order_by(AgentTask.createdAt.desc())
        .limit(50)
    )
    tasks = result.scalars().all()
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AgentTask).where(AgentTask.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.patch("/{task_id}/approve", response_model=ApproveResponse)
async def approve_task(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AgentTask).where(AgentTask.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    # Idempotency check: don't double send if already sent or partial
    if task.status in ["sent", "partial"]:
        results = task.output.get("send_results", []) if task.output else []
        sent = sum(1 for r in results if r.get("success", False))
        failed = sum(1 for r in results if not r.get("success", False) and r.get("error") != "skipped_placeholder")
        skipped = sum(1 for r in results if r.get("error") == "skipped_placeholder")
        return ApproveResponse(
            total=sent + failed,
            sent=sent,
            failed=failed,
            skipped=skipped,
            results=results,
            task_id=task_id
        )

    # Empty task gracefully returned without an error
    if not task.output or not task.output.get("bd_agent"):
        return ApproveResponse(
            total=0,
            sent=0,
            failed=0,
            skipped=0,
            results=[],
            task_id=task_id,
            message="No emails to send — agent generated no drafts"
        )

    emails = task.output["bd_agent"]
    results = []
    
    # Fetch Gmail token for this tenant
    from app.models.task import ConnectedTool
    from app.core.encryption import decrypt_token
    
    tool_result = await db.execute(
        select(ConnectedTool).where(
            ConnectedTool.tenantId == task.tenantId,
            ConnectedTool.toolName == "gmail"
        )
    )
    connected_tool = tool_result.scalars().first()
    
    token = None
    if connected_tool:
        try:
            token = decrypt_token(connected_tool.accessToken)
            
            # Refresh token logic
            if connected_tool.refreshToken and connected_tool.expiresAt:
                # Convert expiresAt to UTC if it's naive
                expires_at = connected_tool.expiresAt
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                
                if expires_at < datetime.now(timezone.utc):
                    print(f"[EXECRA GMAIL] Token expired, attempting refresh for tenant {task.tenantId}")
                    try:
                        import httpx
                        refresh_url = "https://oauth2.googleapis.com/token"
                        refresh_data = {
                            "client_id": settings.GOOGLE_CLIENT_ID,
                            "client_secret": settings.GOOGLE_CLIENT_SECRET,
                            "refresh_token": decrypt_token(connected_tool.refreshToken),
                            "grant_type": "refresh_token",
                        }
                        async with httpx.AsyncClient() as client:
                            refresh_res = await client.post(refresh_url, data=refresh_data)
                            if refresh_res.status_code == 200:
                                new_data = refresh_res.json()
                                token = new_data["access_token"]
                                # Update DB with new token
                                from app.core.encryption import encrypt_token
                                connected_tool.accessToken = encrypt_token(token)
                                if "expires_in" in new_data:
                                    connected_tool.expiresAt = datetime.utcnow() + timedelta(seconds=new_data["expires_in"])
                                await db.commit()
                                print(f"[EXECRA GMAIL] Token refreshed successfully")
                            else:
                                print(f"[EXECRA GMAIL] Token refresh failed: {refresh_res.text}")
                    except Exception as re:
                        print(f"[EXECRA GMAIL] Error during token refresh: {re}")
        except Exception as e:
            print(f"[EXECRA GMAIL] Token processing failed: {e}")

    # Gmail sending updated to use OAuth token if available
    for email in emails:
        to = email.get("to")
        subject = email.get("subject", "No Subject")
        body = email.get("body", "")
        
        if to == "research-needed@placeholder.com":
            print(f"[EXECRA GMAIL] Skipping placeholder — {subject}")
            results.append({
                "to": to,
                "success": False,
                "error": "skipped_placeholder"
            })
        else:
            # Pass token to send_email so it can choose OAuth or SMTP
            send_result = await send_email(to, subject, body, token=token)
            results.append(send_result)

            # CHANGE 2 — Memory Save After Email is Sent
            if send_result.get("success", False):
                try:
                    investor_name = email.get("investor_name", "Unknown Investor")
                    firm = email.get("firm", "Unknown Firm")
                    
                    content = (
                        f"Contacted {investor_name} at {firm} via email on "
                        f"{datetime.utcnow().isoformat()}. Subject: {subject}."
                    )
                    
                    metadata = {
                        "type": "investor_outreach",
                        "investor_name": investor_name,
                        "firm": firm,
                        "email_address": to,
                        "date": datetime.utcnow().isoformat(),
                        "subject": subject
                    }
                    
                    # Offload memory storage to background or await it? 
                    # User said "immediately call store_memory". 
                    # We'll await it but wrap in try/except as requested.
                    await store_memory(
                        tenant_id=task.tenantId,
                        content=content,
                        metadata=metadata
                    )
                    print(f"[EXECRA MEMORY] Interaction saved for {investor_name}")
                except Exception as me:
                    # CHANGE 3 — Graceful Failure Handling: log but do not crash
                    print(f"[EXECRA MEMORY] Failed to save interaction: {me}")

    sent = sum(1 for r in results if r.get("success", False))
    failed = sum(1 for r in results if not r.get("success", False) and r.get("error") != "skipped_placeholder")
    skipped = sum(1 for r in results if r.get("error") == "skipped_placeholder")
    total = sent + failed

    # Determine status
    if total == 0:
        task.status = "approved"
    elif sent > 0 and failed == 0:
        task.status = "sent"
    elif sent > 0 and failed > 0:
        task.status = "partial"
    else: # sent == 0 and failed > 0
        task.status = "approved"
    
    # Add send results
    task.output["send_results"] = results
    flag_modified(task, "output")
    
    await db.commit()
    
    return ApproveResponse(
        total=total,
        sent=sent,
        failed=failed,
        skipped=skipped,
        results=results,
        task_id=task_id
    )

@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, request: UpdateTaskRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AgentTask).where(AgentTask.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.output = request.output
    flag_modified(task, "output")
    await db.commit()
    await db.refresh(task)
    return task

