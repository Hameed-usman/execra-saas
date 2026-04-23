import asyncio
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.task import ConnectedTool

async def check_expiry():
    tenant_id = "4235a8b0-b45d-489b-8c11-4cd3da9d2506"
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ConnectedTool).where(
                ConnectedTool.tenantId == tenant_id,
                ConnectedTool.toolName == "gmail"
            )
        )
        tool = result.scalars().first()
        if tool:
            print(f"Gmail tool for {tenant_id}:")
            print(f"  Expires At: {tool.expiresAt}")
            from datetime import datetime, timezone
            now = datetime.utcnow()
            print(f"  Current UTC: {now}")
            if tool.expiresAt:
                print(f"  Expired? {tool.expiresAt < now}")
        else:
            print("No tool found.")

if __name__ == "__main__":
    asyncio.run(check_expiry())
