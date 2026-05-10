from app.graph.state import AgentState
from app.core.config import get_llm
from app.models.schemas import PlannerOutput
from langchain_core.messages import SystemMessage, HumanMessage
from app.utils.tracing import trace_node
from app.utils.memory import get_recent_task_history
from app.utils.security import is_potential_injection

@trace_node("planner")
async def planner(state: AgentState) -> AgentState:
    step_log = list(state.get("step_log", []))
    
    # Phase 2: Security Guard
    if is_potential_injection(state["goal"]):
        state["status"] = "failed"
        state["final_output"] = "Suspicious input detected. Task terminated for security reasons."
        step_log.append("🛑 Planner: Potential prompt injection detected. Safety guard triggered.")
        state["step_log"] = step_log
        return state

    step_log.append("🧠 Planner Agent: Analyzing goal and orchestrating dynamic workflow...")
    state["step_log"] = step_log

    print(f"[EXECRA PLANNER] Goal received: {state['goal']}")
    
    # Phase 2: Context Recall
    history = await get_recent_task_history(state["tenant_id"])
    print(f"[EXECRA PLANNER] History retrieved: {len(history)} chars")

    llm = get_llm("planner").with_structured_output(PlannerOutput)

    system_prompt = (
        "You are the Chief Orchestration Agent for EXECRA AI. "
        "Your job is to analyze the user's goal, detect the underlying intent, "
        "identify the specific entity type being targeted, and generate the optimal workflow steps.\n\n"
        f"RECENT TASK HISTORY FOR THIS USER:\n{history}\n\n"
        "Workflow routing rules:\n"
        "1. If the user wants to discover, find, or research people/companies, include 'research'.\n"
        "2. If the user wants to draft or send communications, include 'email'.\n"
        "3. If the user provided a list of specific email addresses and just wants to send to them, "
        "SKIP 'research' and ONLY include 'email'.\n"
        "Valid steps: 'research', 'email'.\n"
        "Return the intent, entity_type, and ordered workflow_steps."
    )

    try:
        response: PlannerOutput = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=state["goal"])
        ])

        # Phase 2: Observability - Track tokens
        if hasattr(response, "usage_metadata"):
            if "planner" not in state["execution_metadata"]:
                state["execution_metadata"]["planner"] = {}
            state["execution_metadata"]["planner"]["tokens"] = response.usage_metadata

        state["intent"] = response.intent
        state["entity_type"] = response.entity_type
        state["workflow_steps"] = response.workflow_steps
        
        # Phase 2: Confidence & Uncertainty Handling
        if response.confidence_score < 6:
            state["status"] = "waiting_for_input"
            state["user_prompt"] = (
                f"I'm a bit unsure about your goal: '{response.uncertainty_notes or 'Goal is too vague'}' "
                "Could you provide more details so I can help you better?"
            )
            step_log.append(f"⚠️ Planner: Low confidence ({response.confidence_score}/10). Requesting clarification.")
            state["step_log"] = step_log
            return state

        # Determine the first agent to run
        if not state["workflow_steps"]:
            state["status"] = "failed"
            state["final_output"] = "Planner generated 0 steps — goal unsupported."
            step_log.append("❌ Planner: No valid steps generated. Terminating pipeline.")
            state["step_log"] = step_log
            print("[EXECRA PLANNER] ERROR: 0 steps returned.")
            return state

        state["current_agent"] = state["workflow_steps"][0]
        state["status"] = "running"
        
        step_log.append(
            f"✅ Planner: Intent detected as '{state['intent']}' targeting '{state['entity_type']}'. "
            f"Orchestrated steps: {', '.join(state['workflow_steps'])}"
        )
        state["step_log"] = step_log
        
        # Initialize the arrays for legacy and new state formats
        state["agent_outputs"] = {}
        state["extracted_entities"] = []
        state["drafted_emails"] = []
        state["critic_evaluations"] = []

        print(f"[EXECRA PLANNER] Orchestration complete. Steps: {state['workflow_steps']}")

    except Exception as e:
        error_msg = str(e)
        if "402" in error_msg:
            error_msg = "Insufficient LLM credits. Check your API key balance."
        print(f"[EXECRA PLANNER] Error: {error_msg}")
        state["status"] = "failed"
        state["final_output"] = error_msg
        step_log.append(f"❌ Planner error: {error_msg[:120]}")
        state["step_log"] = step_log

    return state
