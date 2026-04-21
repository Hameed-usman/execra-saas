from langgraph.graph import StateGraph, END
from app.graph.state import AgentState
from app.agents.planner import planner
from app.agents.bd import bd_agent
from app.agents.critic import critic

def route_planner(state: AgentState) -> str:
    sub_tasks = state.get("sub_tasks", [])
    if sub_tasks:
        next_agent = sub_tasks[0].get("agent")
        if next_agent == "bd_agent":
            return "bd_agent"
    return END

def route_critic(state: AgentState) -> str:
    status = state.get('status')
    if status in ['approved', 'failed']:
        return END
    
    retry_count = state.get('retry_count', 0)
    if retry_count < 3:
        return "bd_agent"
    
    return END

def route_bd(state: AgentState) -> str:
    if state.get("status") == "failed":
        return END
    return "critic"

# Build the StateGraph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("planner", planner)
workflow.add_node("bd_agent", bd_agent)
workflow.add_node("critic", critic)

# Add edges
workflow.set_entry_point("planner")

# After planner: conditional edge - reads state['sub_tasks'][0]['agent'] and routes there
workflow.add_conditional_edges(
    "planner",
    route_planner
)

# After bd_agent: conditional edge -> critic or END if failed
workflow.add_conditional_edges("bd_agent", route_bd)

# After critic: conditional edge
workflow.add_conditional_edges(
    "critic",
    route_critic
)

# Compile and export
compiled_graph = workflow.compile()
print("[EXECRA Graph] Compiled graph loaded successfully:", compiled_graph.nodes.keys())
