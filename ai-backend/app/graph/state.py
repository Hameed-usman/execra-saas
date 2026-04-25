from typing import TypedDict, List, Dict, Any, Literal, Optional

class AgentState(TypedDict):
    # Core inputs
    goal: str
    tenant_id: str
    task_id: str  # DB row ID — used for mid-run DB updates

    # Planning
    sub_tasks: List[dict]
    current_agent: str

    # Agent outputs
    agent_outputs: Dict[str, Any]
    critic_feedback: str
    retry_count: int
    final_output: str

    # Termination contract
    # ─────────────────────────────────────────────────────────────────
    # 'running'           → pipeline is active
    # 'approved'          → critic signed off; emails ready to send
    # 'retry'             → critic rejected; bd_agent will be re-run
    # 'waiting_for_input' → no investor emails found; user must supply
    # 'failed'            → unrecoverable error; pipeline terminated
    # 'sent'              → emails dispatched (set by approval endpoint)
    # 'partial'           → some emails sent, some failed
    # ─────────────────────────────────────────────────────────────────
    status: Literal['running', 'approved', 'retry', 'waiting_for_input', 'failed', 'sent', 'partial']

    # Real-time step log — stored in output.step_log for frontend polling
    step_log: List[str]

    # Human-in-the-loop: message shown to user when waiting_for_input
    user_prompt: Optional[str]
