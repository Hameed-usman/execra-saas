import json
from app.graph.state import AgentState
from app.core.config import get_llm
from app.models.schemas import CriticEvaluation
from langchain_core.messages import SystemMessage, HumanMessage
from app.utils.tracing import trace_node

MAX_RETRIES = 2

@trace_node("critic")
async def critic(state: AgentState) -> AgentState:
    step_log = list(state.get("step_log", []))
    step_log.append("🔎 Critic Agent: Performing rigorous Quality Assurance on drafts...")
    state["step_log"] = step_log

    print("[EXECRA CRITIC] Running evaluation...")

    llm = get_llm("critic").with_structured_output(CriticEvaluation)

    drafts = state.get("drafted_emails", [])
    real_drafts = [d for d in drafts if d.get("to") != "research-needed@placeholder.com"]

    if not real_drafts:
        print("[EXECRA CRITIC] No real drafts to evaluate — approving.")
        state["status"] = "approved"
        state["final_output"] = json.dumps(state.get("drafted_emails", {}))
        step_log.append("✅ Critic: No emails with addresses found to evaluate.")
        state["step_log"] = step_log
        return state

    drafts_json = json.dumps(real_drafts)
    goal = state.get("goal", "")
    intent = state.get("intent", "")

    system_prompt = (
        "You are the Senior Quality Assurance Reviewer for EXECRA AI. "
        "Your job is to ruthlessly evaluate the generated emails to ensure they are production-ready. "
        "Evaluate based on these strict heuristics:\n"
        "1. Hallucinations: Does the email invent facts not present in the goal or research?\n"
        "2. Robotic Tone: Does it sound like an AI? (e.g. 'I hope this finds you well', 'Delve', 'As an AI').\n"
        "3. Relevance: Does the tone perfectly match the specified intent?\n"
        "4. Formatting: Are there literal placeholder brackets like [Name]?\n"
        "If the email is highly professional and human-like, approve it. If not, reject and provide exact heuristic failures."
    )

    user_prompt = f"Intent: {intent}\nOriginal Goal: {goal}\n\nDrafts to review:\n{drafts_json}"

    try:
        response: CriticEvaluation = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ])

        if "critic_evaluations" not in state:
            state["critic_evaluations"] = []
        state["critic_evaluations"].append(response.dict())

        if response.decision == "APPROVED":
            print("[EXECRA CRITIC] Decision: APPROVED")
            state["status"] = "approved"
            state["final_output"] = json.dumps(state.get("drafted_emails", {}))
            step_log.append(f"✅ Critic: {len(real_drafts)} email(s) approved. Score: {response.score}/10.")
            state["step_log"] = step_log

        else:
            current_retries = state.get("retry_count", 0)
            print(f"[EXECRA CRITIC] Decision: REJECTED. Score: {response.score}. Failed: {response.failed_heuristics}")

            if current_retries >= MAX_RETRIES:
                print("[EXECRA CRITIC] Max retries reached. Force-approving to prevent loop.")
                state["status"] = "approved"
                state["final_output"] = json.dumps(state.get("drafted_emails", {}))
                state["critic_feedback"] = response.feedback
                step_log.append(f"⚠️ Critic: Max retries ({MAX_RETRIES + 1}) reached. Approving best available drafts.")
                state["step_log"] = step_log
            else:
                state["status"] = "retry"
                state["retry_count"] = current_retries + 1
                state["critic_feedback"] = response.feedback
                step_log.append(
                    f"🔄 Critic: Rejected (attempt {current_retries + 1}/{MAX_RETRIES + 1}). "
                    f"Failed on: {', '.join(response.failed_heuristics)}. Email Agent retrying..."
                )
                state["step_log"] = step_log
                print(f"[EXECRA CRITIC] Retry {state['retry_count']}/{MAX_RETRIES + 1}")

    except Exception as e:
        print(f"[EXECRA CRITIC] Exception: {str(e)}")
        state["status"] = "approved"
        state["critic_feedback"] = f"Critic error (auto-approved): {str(e)[:200]}"
        step_log.append("⚠️ Critic: Evaluation error — emails auto-approved for manual review.")
        state["step_log"] = step_log

    return state
