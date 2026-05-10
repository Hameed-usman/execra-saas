import logging
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.task import AgentTask

logger = logging.getLogger(__name__)

async def get_recent_task_history(tenant_id: str, limit: int = 3) -> str:
    """
    Fetches the most recent successful tasks for a tenant to provide context.
    Returns a formatted string summary.
    """
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(AgentTask)
                .where(AgentTask.tenantId == tenant_id)
                .where(AgentTask.status == "approved")
                .order_by(AgentTask.createdAt.desc())
                .limit(limit)
            )
            tasks = result.scalars().all()
            
            if not tasks:
                return "No previous task history found."
            
            history = []
            for t in tasks:
                history.append(f"- Goal: {t.goal}\n  Status: {t.status}\n  Date: {t.createdAt.date()}")
            
            return "\n".join(history)
            
    except Exception as e:
        logger.error(f"[EXECRA MEMORY] Failed to fetch task history: {e}")
        return "Error fetching task history."
