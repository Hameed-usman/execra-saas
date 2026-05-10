from pydantic import BaseModel, Field
from typing import List, Literal, Optional

# ── Planner Models ─────────────────────────────────────────────────────────────

class PlannerOutput(BaseModel):
    intent: str = Field(description="The primary intent of the user (e.g., 'investor_outreach', 'b2b_sales', 'casual_email', 'restaurant_search')")
    entity_type: str = Field(description="The specific type of entity being targeted (e.g., 'investor', 'startup founder', 'teacher', 'restaurant owner', 'friend')")
    workflow_steps: List[str] = Field(description="Ordered list of agent steps to execute. Valid steps: 'research', 'email'. Example: ['research', 'email'] or just ['email'] if no research is needed.")
    confidence_score: int = Field(description="Score from 0 to 10 on how certain we are about the detected intent.", ge=0, le=10)
    uncertainty_notes: Optional[str] = Field(description="Notes if the goal is vague or ambiguous.", default=None)

# ── Research Models ────────────────────────────────────────────────────────────

class ExtractedEntity(BaseModel):
    name: str = Field(description="The name of the individual or entity. If unknown, use 'Unknown'.")
    organization: str = Field(description="The company, firm, or organization they belong to. If unknown, use 'Unknown'.")
    context: str = Field(description="A brief, 1-2 sentence summary of why this entity is relevant to the user's goal.")
    relevance_score: int = Field(description="Score from 1 to 10 indicating how perfectly this matches the user's criteria.")
    confidence_score: int = Field(description="Score from 0 to 10 on the accuracy of the extracted data.", ge=0, le=10)
    is_contactable: bool = Field(description="True if we should attempt to draft an email for them, False if they are just informational.")

class ResearchOutput(BaseModel):
    entities: List[ExtractedEntity] = Field(description="List of extracted and enriched entities from the research data.")

# ── Email Models ───────────────────────────────────────────────────────────────

class DraftedEmail(BaseModel):
    to: str = Field(description="The email address, or 'research-needed@placeholder.com' if not found.")
    subject: str = Field(description="A catchy, highly relevant subject line.")
    body: str = Field(description="The full email body text. NEVER use placeholder brackets like [Name] or [Company].")
    confidence_score: int = Field(description="Score from 0 to 10 on how well this email matches the goal.", ge=0, le=10)

class EmailOutput(BaseModel):
    emails: List[DraftedEmail] = Field(description="The drafted emails corresponding to the requested entities.")

# ── Critic Models ──────────────────────────────────────────────────────────────

class CriticEvaluation(BaseModel):
    decision: Literal["APPROVED", "REJECTED"] = Field(description="APPROVED if the email is high quality and meets all heuristics. REJECTED otherwise.")
    score: int = Field(description="Overall quality score from 1 to 10.")
    feedback: str = Field(description="Detailed feedback on what needs to be fixed. Empty if APPROVED.")
    failed_heuristics: List[str] = Field(description="List of specific heuristic rules broken (e.g., 'robotic tone', 'hallucination', 'bad formatting'). Empty if APPROVED.")
