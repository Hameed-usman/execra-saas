import asyncio
from sentence_transformers import SentenceTransformer
from typing import List

# Load model once at module level to avoid reloading on every request
# Model "all-mpnet-base-v2" produces 768-dimensional vectors
# Dimensions must match Pinecone index configuration (768)
model = SentenceTransformer("all-mpnet-base-v2")

async def get_embedding(text: str) -> List[float]:
    """
    Converts a string of text into a vector embedding.
    Uses sentence-transformers locally.
    """
    loop = asyncio.get_running_loop()
    
    # SentenceTransformer.encode is synchronous, so we run it in an executor
    # to avoid blocking the main event loop.
    # We convert the resulting numpy array to a plain list of floats.
    embedding = await loop.run_in_executor(
        None, 
        lambda: model.encode(text).tolist()
    )
    
    return embedding
