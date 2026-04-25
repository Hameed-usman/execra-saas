import asyncio
from pinecone import Pinecone
from app.core.config import settings
from app.memory.embeddings import get_embedding
from uuid import uuid4
from typing import List, Dict, Any

# Initialize Pinecone client
# The settings.PINECONE_API_KEY and settings.PINECONE_INDEX are loaded from .env
pc = Pinecone(api_key=settings.PINECONE_API_KEY)
index = pc.Index(settings.PINECONE_INDEX)

async def store_memory(tenant_id: str, content: str, metadata: Dict[str, Any] = None):
    """
    Stores a memory in Pinecone.
    
    Args:
        tenant_id: The ID of the tenant (startup). Used for namespace isolation.
        content: The text content of the memory.
        metadata: Additional metadata to store with the memory.
    """
    if metadata is None:
        metadata = {}
    
    # Generate embedding for the content
    vector = await get_embedding(content)
    
    # Prepare metadata payload
    # Always include 'content' and 'tenant_id' for easier filtering/display
    full_metadata = {
        **metadata,
        "content": content,
        "tenant_id": tenant_id
    }
    
    # Create a unique ID for the memory
    memory_id = f"{tenant_id}_{uuid4()}"
    
    # Upsert to Pinecone with the tenant_id as the namespace
    # This is critical for tenant isolation.
    # index.upsert is synchronous, but Pinecone client handles it efficiently.
    # We wrap it in a thread pool to avoid blocking the main thread if needed,
    # but typically Pinecone calls are fast enough or handled by the client.
    # For consistency with the embedding call, we'll use the executor.
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(
        None,
        lambda: index.upsert(
            vectors=[(memory_id, vector, full_metadata)],
            namespace=tenant_id
        )
    )

async def retrieve_memory(tenant_id: str, query: str, top_k: int = 5, score_threshold: float = 0.75) -> List[Dict[str, Any]]:
    """
    Retrieves relevant memories from Pinecone for a specific tenant.
    
    Args:
        tenant_id: The ID of the tenant (startup). Used for namespace isolation.
        query: The search query.
        top_k: Number of results to return.
        
    Returns:
        A list of metadata dictionaries for matches with score > 0.75.
    """
    # Generate embedding for the query
    query_vector = await get_embedding(query)
    
    # Query Pinecone within the tenant's namespace
    loop = asyncio.get_running_loop()
    response = await loop.run_in_executor(
        None,
        lambda: index.query(
            vector=query_vector,
            top_k=top_k,
            namespace=tenant_id,
            include_metadata=True
        )
    )
    
    # Filter matches by confidence score (> 0.75)
    # response['matches'] is the legacy access, in v3 it's an object with .matches
    results = []
    for match in response.matches:
        if match.score > score_threshold:
            results.append(match.metadata)
            
    return results
