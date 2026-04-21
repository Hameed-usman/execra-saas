# database.py
# This file sets up the async SQLAlchemy engine and session factory to connect to the existing PostgreSQL database.
# Prisma completely owns the schema. We NEVER use Base.metadata.create_all() or define models to create tables here.
# Prisma models managed externally include: Tenant, User, StartupProfile, connected_tools, and tasks.

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text
from app.core.config import settings

# SQLAlchemy asyncpg requires postgresql+asyncpg instead of just postgresql connection string
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create the async engine
engine = create_async_engine(db_url, echo=False)

# Create the async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db():
    """Dependency for providing database sessions to FastAPI routes."""
    async with AsyncSessionLocal() as session:
        yield session

async def test_connection() -> bool:
    """Runs a simple SELECT 1 to verify database connectivity without modifying the schema."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        raise e
