import httpx
import os
from typing import List

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

async def get_embedding(text: str) -> List[float]:
    """
    Converts text to embedding using Groq API.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/embeddings",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "nomic-embed-text-v1.5",
                "input": text
            }
        )
        data = response.json()
        return data["data"][0]["embedding"]