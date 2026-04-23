# Updated planner agent incorporating LLM calls based on provider config.
# If you want to change providers later, only change LLM_PROVIDER in .env.
import json
from app.utils import clean_llm_json
from app.graph.state import AgentState
from app.core.config import get_llm
from langchain_core.messages import SystemMessage, HumanMessage

async def planner(state: AgentState) -> AgentState:
    print(f"[EXECRA PLANNER] Goal received: {state['goal']}")
    
    # Instantiate inside the node so changes directly resolve dynamically without server restart
    llm = get_llm("planner")
    
    system_prompt = (
        "You are the Planner Agent for EXECRA. Your job is to break down a founder's goal "
        "into specific actionable tasks and assign each to the right specialist agent. "
        "Be precise — vague tasks produce bad results.\n"
        "IMPORTANT: You may ONLY assign tasks to these exact agent names: bd_agent. No other agent names are valid. Every task in your output must have agent set to bd_agent exactly.\n"
        "Return exactly 1 task only. Not 2, not 5. Exactly 1 task assigned to bd_agent.\n"
        "Return ONLY a raw JSON object. No markdown, no backticks, no explanation. "
        "Format: {\"tasks\": [{\"agent\": \"bd_agent\", \"task\": \"specific task description\"}]} — the agent field must always be bd_agent"
    )
    
    try:
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=state['goal'])
        ])
        
        # Strip markdown syntax securely prior to parse
        cleaned = clean_llm_json(response.content)
        parsed_data = json.loads(cleaned)
        
        state['sub_tasks'] = parsed_data.get("tasks", [])
        
        # Guard: if no tasks were parsed, fail immediately
        if not state['sub_tasks']:
            print(f"[EXECRA PLANNER] ERROR: LLM returned 0 tasks. Failing immediately.")
            state['status'] = 'failed'
            state['final_output'] = 'Planner generated 0 tasks — goal may be too vague'
            return state
        
        state['current_agent'] = 'bd_agent'
        state['status'] = 'running'
        print(f"[EXECRA PLANNER] Generated {len(state['sub_tasks'])} tasks.")
        
    except Exception as e:
        error_msg = str(e)
        if "402" in error_msg:
            error_msg = "LLM Provider Error: Insufficient Balance. Please check your DeepSeek API credits."
        print(f"[EXECRA PLANNER] Error: {error_msg}")
        state['status'] = 'failed'
        state['final_output'] = error_msg
        
    return state
