# from sqlalchemy import Column, String, Integer, DateTime, JSON, text
# from sqlalchemy.orm import declarative_base
# from datetime import datetime

# Base = declarative_base()

# class AgentTask(Base):
#     __tablename__ = "agent_tasks"
    
#     id = Column(String, primary_key=True, server_default=text("gen_random_uuid()"))
#     tenantId = Column(String, nullable=False)
#     goal = Column(String, nullable=False)
#     agentType = Column(String, nullable=False)
#     status = Column(String, nullable=False)
#     output = Column(JSON, nullable=True)
#     criticFeedback = Column(String, nullable=True)
#     retryCount = Column(Integer, default=0, nullable=False)
#     createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
#     updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

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