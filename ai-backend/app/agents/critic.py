# Updated critic agent incorporating LLM evaluations and strict loop conditioning.
# If you want to change providers later, only change LLM_PROVIDER in .env.
import json
from app.utils import clean_llm_json
from app.graph.state import AgentState
from app.core.config import get_llm
from langchain_core.messages import SystemMessage, HumanMessage

async def critic(state: AgentState) -> AgentState:
    print("[EXECRA CRITIC] Running text evaluation...")
    
    llm = get_llm("critic")
    
    # Input data
    drafts_json = json.dumps(state.get('agent_outputs', {}).get('bd_agent', []))
    
    system_prompt = (
        "You are the Critic Agent for EXECRA. Your job is to protect the founder's reputation. "
        "Reject any output that sounds templated, has hallucinated facts, exceeds 150 words, "
        "or fails to reference the investor specifically.\n"
        "Return ONLY a strict JSON object. Format: {\"decision\": \"APPROVED\" or \"REJECTED\", "
        "\"feedback\": \"specific actionable issue if rejected, empty string if approved\"}."
    )
    
    user_prompt = f"Evaluate these drafted emails:\n{drafts_json}"
    
    try:
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ])
        
        cleaned = clean_llm_json(response.content)
        evaluation = json.loads(cleaned)
        
        decision = evaluation.get("decision", "REJECTED")
        feedback = evaluation.get("feedback", "")
        
        if decision == "APPROVED":
            print("[EXECRA CRITIC] Decision: APPROVED")
            state['status'] = 'approved'
            state['final_output'] = json.dumps(state.get('agent_outputs', {}))
        else:
            print(f"[EXECRA CRITIC] Decision: REJECTED. Feedback: {feedback}")
            current_retries = state.get('retry_count', 0)
            
            if current_retries >= 3:
                print("[EXECRA CRITIC] Max retries reached. Failing out.")
                state['status'] = 'failed'
                state['final_output'] = f"Max retries reached. Last feedback: {feedback}"
            else:
                state['status'] = 'retry'
                state['retry_count'] = current_retries + 1
                state['critic_feedback'] = feedback
                
    except Exception as e:
        print(f"[EXECRA CRITIC] Agent Exception: {str(e)}")
        state['status'] = 'failed'
    
    return state
