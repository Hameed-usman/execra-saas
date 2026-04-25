import json
from app.utils import clean_llm_json
from app.graph.state import AgentState
from app.core.config import get_llm
from langchain_core.messages import SystemMessage, HumanMessage

async def planner(state: AgentState) -> AgentState:
    step_log = list(state.get("step_log", []))
    step_log.append("🧠 Planner Agent: Analysing your goal and breaking it into tasks...")
    state["step_log"] = step_log

    print(f"[EXECRA PLANNER] Goal received: {state['goal']}")

    llm = get_llm("planner")

    system_prompt = (
        "You are the Planner Agent for EXECRA. Your job is to break down a founder's goal "
        "into specific actionable tasks and assign each to the right specialist agent. "
        "Be precise — vague tasks produce bad results.\n"
        "IMPORTANT: You may ONLY assign tasks to these exact agent names: bd_agent.\n"
        "Return exactly 1 task only. Not 2, not 5. Exactly 1 task assigned to bd_agent.\n"
        "Return ONLY a raw JSON object. No markdown, no backticks, no explanation. "
        'Format: {"tasks": [{"agent": "bd_agent", "task": "specific task description"}]}'
    )

    try:
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=state["goal"])
        ])

        cleaned = clean_llm_json(response.content)
        parsed_data = json.loads(cleaned)

        state["sub_tasks"] = parsed_data.get("tasks", [])

        if not state["sub_tasks"]:
            state["status"] = "failed"
            state["final_output"] = "Planner generated 0 tasks — goal may be too vague."
            step_log.append("❌ Planner: No tasks generated. Goal may be too vague.")
            state["step_log"] = step_log
            print("[EXECRA PLANNER] ERROR: 0 tasks returned.")
            return state

        state["current_agent"] = "bd_agent"
        state["status"] = "running"
        step_log.append(
            f"✅ Planner: Created {len(state['sub_tasks'])} task(s). "
            f"Dispatching to BD Agent..."
        )
        state["step_log"] = step_log
        print(f"[EXECRA PLANNER] Generated {len(state['sub_tasks'])} task(s).")

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
