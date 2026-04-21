from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List, Dict, Any
from sqlalchemy.orm.attributes import flag_modified
from app.core.database import get_db
from app.models.task import AgentTask
from app.tools.email_tool import send_email

router = APIRouter(prefix="/tasks", tags=["Tasks"])

class TaskResponse(BaseModel):
    id: str
    tenantId: str
    goal: str
    agentType: str
    status: str
    output: Optional[Dict[str, Any]] = None
    criticFeedback: Optional[str] = None
    retryCount: int

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
            message="No emails to send — agent found no investors"
        )

    emails = task.output["bd_agent"]
    results = []
    
    # Gmail sending added in Chunk 5 — n8n replaced with direct SMTP (using Resend instead of SMTP per updated plan)
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
            send_result = await send_email(to, subject, body)
            results.append(send_result)

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
