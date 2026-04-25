import logging
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm.attributes import flag_modified
from typing import Optional, Dict, Any
from app.core.database import get_db, AsyncSessionLocal
from app.models.task import AgentTask
from app.graph.graph import compiled_graph
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["Agents"])


# ── Request / Response models ──────────────────────────────────────────────────

class RunAgentRequest(BaseModel):
    goal: str = Field(min_length=10, max_length=500)
    tenant_id: str


class RunAgentResponse(BaseModel):
    task_id: str
    status: str
    message: str
    requires_user_input: bool = False
    current_step: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


# ── DB helper ──────────────────────────────────────────────────────────────────

async def _update_task(
    task_id: str,
    status: str,
    output: dict,
    critic_feedback: str = "",
    retry_count: int = 0,
):
    """Persist task state mid-run or at termination."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(AgentTask).where(AgentTask.id == task_id)
        )
        task = result.scalars().first()
        if not task:
            logger.warning(f"[EXECRA] Task {task_id} not found during DB update.")
            return

        task.status = status
        # Merge: keep all existing keys; incoming output keys take precedence
        existing = task.output or {}
        merged = {**existing, **output}
        task.output = merged
        task.criticFeedback = critic_feedback or task.criticFeedback
        task.retryCount = retry_count
        task.updatedAt = datetime.utcnow()
        flag_modified(task, "output")
        await session.commit()


# ── Endpoint ───────────────────────────────────────────────────────────────────

@router.post("/run", response_model=RunAgentResponse)
async def run_agent(
    request: RunAgentRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    # ── 1. Execution guard — prevent concurrent runs per tenant ────────────────
    # Look back 30 minutes to catch stale "running" tasks too.
    # MUST use utcnow() (naive) — DB stores TIMESTAMP WITHOUT TIME ZONE.
    # Using datetime.now(timezone.utc) causes asyncpg DataError.
    cutoff = datetime.utcnow() - timedelta(minutes=30)
    existing_q = await db.execute(
        select(AgentTask).where(
            AgentTask.tenantId == request.tenant_id,
            AgentTask.status.in_(["pending", "running"]),
            AgentTask.createdAt >= cutoff,
        )
    )
    active_task = existing_q.scalars().first()

    if active_task:
        logger.info(
            f"[EXECRA] Tenant {request.tenant_id} attempted to start a run, but task "
            f"{active_task.id} is already in state: {active_task.status}"
        )
        raise HTTPException(
            status_code=409,
            detail={
                "error": "An agent run is already in progress.",
                "task_id": str(active_task.id),
                "status": active_task.status,
                "code": "TASK_ALREADY_RUNNING",
                "goal": active_task.goal
            },
        )

    # ── 2. Create DB record ────────────────────────────────────────────────────
    new_task = AgentTask(
        tenantId=request.tenant_id,
        goal=request.goal,
        agentType="bd_agent",
        status="pending",
        output={"step_log": ["⏳ Task queued. Pipeline starting shortly..."]},
        retryCount=0,
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    task_id = str(new_task.id)

    # ── 3. Build initial state ─────────────────────────────────────────────────
    initial_state = {
        "goal": request.goal,
        "tenant_id": request.tenant_id,
        "task_id": task_id,
        "sub_tasks": [],
        "current_agent": "",
        "agent_outputs": {},
        "critic_feedback": "",
        "retry_count": 0,
        "final_output": "",
        "status": "running",
        "step_log": ["⏳ Task queued. Pipeline starting shortly..."],
        "user_prompt": None,
    }

    # ── 4. Kick off background pipeline ───────────────────────────────────────
    background_tasks.add_task(process_agent_graph, task_id, initial_state)

    return RunAgentResponse(
        task_id=task_id,
        status="pending",
        message="Agent pipeline started. Poll /tasks for real-time progress.",
        current_step="queued",
    )


# ── Background pipeline ────────────────────────────────────────────────────────

async def process_agent_graph(task_id: str, initial_state: dict):
    """
    Streams the LangGraph execution node-by-node.
    After each node completes, the DB is updated with the latest step_log.
    This gives the frontend real-time progress without SSE.
    """
    logger.info(f"[EXECRA] Pipeline starting for task {task_id}")

    # Mark as running immediately
    logger.info(f"[EXECRA] Marking task {task_id} as 'running' in DB.")
    await _update_task(
        task_id,
        "running",
        {"step_log": ["🚀 Pipeline started. Planner Agent activating..."]},
    )

    final_state: dict = initial_state

    try:
        # astream yields {node_name: state_after_node} for each completed node
        async for chunk in compiled_graph.astream(initial_state):
            node_name, node_state = list(chunk.items())[0]
            final_state = node_state

            # Build the output payload for this mid-run update
            agent_outputs = node_state.get("agent_outputs", {})
            current_output = {
                **agent_outputs,
                "step_log": node_state.get("step_log", []),
            }

            current_status = node_state.get("status", "running")
            # During a retry cycle the status briefly comes back as "retry" —
            # keep DB as "running" during mid-cycle so frontend shows spinner
            db_status = "running" if current_status == "retry" else current_status

            await _update_task(
                task_id,
                db_status,
                current_output,
                node_state.get("critic_feedback", ""),
                node_state.get("retry_count", 0),
            )

            logger.info(
                f"[EXECRA] Node '{node_name}' done. "
                f"Status: {current_status} | "
                f"Steps logged: {len(node_state.get('step_log', []))}"
            )

    except Exception as exc:
        error_msg = str(exc)
        logger.error(f"[EXECRA] Pipeline error for task {task_id}: {error_msg}")
        await _update_task(
            task_id,
            "failed",
            {"step_log": [f"❌ Pipeline error: {error_msg[:300]}"]},
            error_msg[:500],
        )
        return

    # ── Final write ────────────────────────────────────────────────────────────
    terminal_status = final_state.get("status", "failed")
    agent_outputs = final_state.get("agent_outputs", {})
    final_output = {
        **agent_outputs,
        "step_log": final_state.get("step_log", []),
    }

    if final_state.get("user_prompt"):
        final_output["user_prompt"] = final_state["user_prompt"]

    await _update_task(
        task_id,
        terminal_status,
        final_output,
        final_state.get("critic_feedback", ""),
        final_state.get("retry_count", 0),
    )

    logger.info(f"[EXECRA] Task {task_id} terminated → status: {terminal_status}")

    if terminal_status == "waiting_for_input":
        logger.info(
            f"[EXECRA] Human input required: {final_state.get('user_prompt', '')}"
        )
