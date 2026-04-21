from typing import TypedDict, List, Dict, Any, Literal

class AgentState(TypedDict):
    goal: str
    tenant_id: str
    sub_tasks: List[dict]
    current_agent: str
    agent_outputs: Dict[str, Any]
    critic_feedback: str
    retry_count: int
    final_output: str
    status: Literal['running', 'approved', 'retry', 'failed']
