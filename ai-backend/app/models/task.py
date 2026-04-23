import uuid
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class AgentTask(Base):
    __tablename__ = "agent_tasks"

    id             = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenantId       = Column("tenantId", String, nullable=False)
    goal           = Column(String, nullable=False)
    agentType      = Column("agentType", String, nullable=False)
    status         = Column(String, nullable=False, default="pending")
    output         = Column(JSONB, nullable=True)
    criticFeedback = Column("criticFeedback", String, nullable=True)
    retryCount     = Column("retryCount", Integer, default=0)
    createdAt      = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt      = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ConnectedTool(Base):
    __tablename__ = "connected_tools"

    id           = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenantId     = Column("tenantId", String, nullable=False)
    toolName     = Column("toolName", String, nullable=False)
    accessToken  = Column("accessToken", Text, nullable=False)
    refreshToken = Column("refreshToken", Text, nullable=True)
    expiresAt    = Column("expiresAt", DateTime, nullable=True)
    createdAt    = Column("createdAt", DateTime, default=datetime.utcnow)