"""
EXECRA LangGraph Workflow
Termination Contract
────────────────────
Every node MUST leave state['status'] in exactly one of these terminals:
  - 'approved'          → critic approved; go to END; emails await human approval
  - 'waiting_for_input' → missing emails; human must supply; go to END
  - 'failed'            → unrecoverable error; go to END
  - 'retry'             → critic rejected but retries remain; loop back to email_agent

No node may leave status as 'running' when it returns.
Max retries is enforced in critic.py (retry_count >= 2 → force 'approved').
"""

from langgraph.graph import StateGraph, END
from app.graph.state import AgentState
from app.agents.planner import planner
from app.agents.research import research_agent
from app.agents.email import email_agent
from app.agents.critic import critic

# ── Routing functions ──────────────────────────────────────────────────────────

def route_planner(state: AgentState) -> str:
    """After planner: route based on dynamically generated workflow_steps."""
    if state.get("status") in ("failed", "waiting_for_input"):
        return END

    steps = state.get("workflow_steps", [])
    if not steps:
        return END

    if "research" in steps:
        return "research_agent"
    elif "email" in steps:
        return "email_agent"

    return END

def route_research(state: AgentState) -> str:
    """
    After research_agent:
      - failed            → END
      - waiting_for_input → END
      - anything else     → email_agent (if in steps) or END
    """
    if state.get("status") in ("failed", "waiting_for_input"):
        return END

    steps = state.get("workflow_steps", [])
    if "email" in steps:
        return "email_agent"
    
    return END

def route_email(state: AgentState) -> str:
    """
    After email_agent:
      - failed            → END
      - waiting_for_input → END
      - anything else     → critic
    """
    status = state.get("status")
    if status in ("failed", "waiting_for_input"):
        return END
    return "critic"

def route_critic(state: AgentState) -> str:
    """
    After critic:
      - approved          → END
      - retry             → email_agent (refine and re-draft)
      - failed            → END
    """
    status = state.get("status")
    if status == "retry":
        return "email_agent"
    return END

# ── Build graph ────────────────────────────────────────────────────────────────

workflow = StateGraph(AgentState)

workflow.add_node("planner",  planner)
workflow.add_node("research_agent", research_agent)
workflow.add_node("email_agent", email_agent)
workflow.add_node("critic",   critic)

workflow.set_entry_point("planner")

workflow.add_conditional_edges("planner",  route_planner)
workflow.add_conditional_edges("research_agent", route_research)
workflow.add_conditional_edges("email_agent", route_email)
workflow.add_conditional_edges("critic",   route_critic)

compiled_graph = workflow.compile()
print("[EXECRA Graph] Compiled graph loaded:", list(compiled_graph.nodes.keys()))
