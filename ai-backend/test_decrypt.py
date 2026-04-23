import asyncio
import base64
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.task import ConnectedTool
from app.core.encryption import decrypt_token

async def test_decryption():
    tenant_id = "4235a8b0-b45d-489b-8c11-4cd3da9d2506"
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ConnectedTool).where(
                ConnectedTool.tenantId == tenant_id,
                ConnectedTool.toolName == "gmail"
            )
        )
        tool = result.scalars().first()
        if not tool:
            print("Gmail tool not found.")
            return

        print(f"Raw encrypted token (snippet): {tool.accessToken[:30]}...")
        
        try:
            decrypted = decrypt_token(tool.accessToken)
            print(f"Decryption success! Length: {len(decrypted)}")
            print(f"Token snippet: {decrypted[:10]}...{decrypted[-10:]}")
            
            if tool.refreshToken:
                decrypted_refresh = decrypt_token(tool.refreshToken)
                print(f"Refresh Token Decryption success! Length: {len(decrypted_refresh)}")
        except Exception as e:
            print(f"Decryption failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_decryption())
