import asyncio
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.task import ConnectedTool

async def check_tools():
    tenant_id = "4235a8b0-b45d-489b-8c11-4cd3da9d2506"
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ConnectedTool).where(ConnectedTool.tenantId == tenant_id)
        )
        tools = result.scalars().all()
        print(f"Tools for tenant {tenant_id}:")
        for tool in tools:
            print(f"- {tool.toolName} (Created: {tool.createdAt})")
        if not tools:
            print("No tools connected.")

if __name__ == "__main__":
    asyncio.run(check_tools())
