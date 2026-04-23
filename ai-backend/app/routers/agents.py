from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
from app.core.database import get_db
from app.models.task import AgentTask
from app.graph.graph import compiled_graph
from datetime import datetime
from fastapi import BackgroundTasks
from sqlalchemy.future import select

router = APIRouter(prefix="/agent", tags=["Agents"])

class RunAgentRequest(BaseModel):
    goal: str = Field(min_length=10, max_length=500)
    tenant_id: str

class RunAgentResponse(BaseModel):
    task_id: str
    status: str
    output: Optional[Dict[str, Any]] = None
    critic_feedback: Optional[str] = None

@router.post("/run", response_model=RunAgentResponse)
async def run_agent(request: RunAgentRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    # 1. Insert a new AgentTask row
    new_task = AgentTask(
        tenantId=request.tenant_id,
        goal=request.goal,
        agentType="bd_agent",
        status="pending",
        retryCount=0
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    
    task_id = str(new_task.id)

    # 3. Call compiled_graph.ainvoke in background
    initial_state = {
        "goal": request.goal,
        "tenant_id": request.tenant_id,
        "sub_tasks": [],
        "current_agent": "",
        "agent_outputs": {},
        "critic_feedback": "",
        "retry_count": 0,
        "final_output": "",
        "status": "running"
    }

    background_tasks.add_task(process_agent_graph, task_id, initial_state)

    return RunAgentResponse(
        task_id=task_id,
        status="running"
    )

async def process_agent_graph(task_id: str, initial_state: dict):
    print(f"[EXECRA BACKGROUND] Starting graph for task {task_id}")
    print(f"[EXECRA BACKGROUND] Initial state: {initial_state}")
    
    from app.core.database import AsyncSessionLocal
    
    # Pre-emptively set status to running
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(AgentTask).where(AgentTask.id == task_id))
        task = result.scalars().first()
        if task:
            task.status = "running"
            await session.commit()
            
    try:
        final_state = await compiled_graph.ainvoke(initial_state)
        print(f"[EXECRA BACKGROUND] Graph completed. Final state status: {final_state.get('status')}")
    except Exception as e:
        print(f"[EXECRA BACKGROUND] Graph failed: {str(e)}")
        final_state = {"status": "failed", "agent_outputs": {}, "critic_feedback": str(e)}

    # Save final results to db
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(AgentTask).where(AgentTask.id == task_id))
        task = result.scalars().first()
        if task:
            task.status = final_state.get("status", "failed")
            bd_outputs = final_state.get("agent_outputs", {})
            task.output = bd_outputs if bd_outputs else None
            task.criticFeedback = final_state.get("critic_feedback", "")
            task.retryCount = final_state.get("retry_count", 0)
            task.updatedAt = datetime.utcnow()
            await session.commit()
            print(f"[EXECRA BACKGROUND] Task {task_id} completed with status {task.status}")
