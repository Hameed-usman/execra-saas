"""
EXECRA LangGraph Workflow
Termination Contract
────────────────────
Every node MUST leave state['status'] in exactly one of these terminals:
  - 'approved'          → critic approved; go to END; emails await human approval
  - 'waiting_for_input' → bd_agent found no emails; human must supply; go to END
  - 'failed'            → unrecoverable error; go to END
  - 'retry'             → critic rejected but retries remain; loop back to bd_agent

No node may leave status as 'running' when it returns — that is illegal.
Max retries is enforced in critic.py (retry_count >= 2 → force 'failed').
"""

from langgraph.graph import StateGraph, END
from app.graph.state import AgentState
from app.agents.planner import planner
from app.agents.bd import bd_agent
from app.agents.critic import critic


# ── Routing functions ──────────────────────────────────────────────────────────

def route_planner(state: AgentState) -> str:
    """After planner: route to first assigned agent or terminate on failure."""
    if state.get("status") in ("failed", "waiting_for_input"):
        return END

    sub_tasks = state.get("sub_tasks", [])
    if not sub_tasks:
        return END

    next_agent = sub_tasks[0].get("agent")
    if next_agent == "bd_agent":
        return "bd_agent"

    # Unknown agent assigned — fail gracefully
    return END


def route_bd(state: AgentState) -> str:
    """
    After bd_agent:
      - failed            → END (unrecoverable)
      - waiting_for_input → END (human must supply email)
      - anything else     → critic (to review drafted emails)
    """
    status = state.get("status")
    if status in ("failed", "waiting_for_input"):
        return END
    return "critic"


def route_critic(state: AgentState) -> str:
    """
    After critic:
      - approved          → END (emails ready for human approval)
      - retry             → bd_agent (refine and re-draft)
      - failed            → END (max retries exhausted)
      - anything else     → END (safety net)
    """
    status = state.get("status")
    if status == "retry":
        return "bd_agent"
    return END


# ── Build graph ────────────────────────────────────────────────────────────────

workflow = StateGraph(AgentState)

workflow.add_node("planner",  planner)
workflow.add_node("bd_agent", bd_agent)
workflow.add_node("critic",   critic)

workflow.set_entry_point("planner")

workflow.add_conditional_edges("planner",  route_planner)
workflow.add_conditional_edges("bd_agent", route_bd)
workflow.add_conditional_edges("critic",   route_critic)

compiled_graph = workflow.compile()
print("[EXECRA Graph] Compiled graph loaded:", list(compiled_graph.nodes.keys()))
