import json
from app.utils import clean_llm_json
from app.graph.state import AgentState
from app.core.config import get_llm
from langchain_core.messages import SystemMessage, HumanMessage

MAX_RETRIES = 2  # 3 total attempts (0-indexed)


async def critic(state: AgentState) -> AgentState:
    step_log = list(state.get("step_log", []))
    step_log.append("🔎 Critic Agent: Reviewing draft email quality...")
    state["step_log"] = step_log

    print("[EXECRA CRITIC] Running evaluation...")

    llm = get_llm("critic")

    # Only evaluate real emails — skip placeholders and already-skipped
    all_drafts = state.get("agent_outputs", {}).get("bd_agent", [])
    real_drafts = [
        d for d in all_drafts
        if d.get("to") not in ("research-needed@placeholder.com", "skipped@execra.ai")
        and not d.get("skipped", False)
    ]

    if not real_drafts:
        # No real emails to review — nothing to critique; approve as-is (placeholders
        # will be handled by the Approvals UI's edit flow).
        print("[EXECRA CRITIC] No real drafts to evaluate — approving with note.")
        state["status"] = "approved"
        state["final_output"] = json.dumps(state.get("agent_outputs", {}))
        step_log.append(
            "✅ Critic: No emails with addresses found to evaluate. "
            "Approvals panel will request manual input."
        )
        state["step_log"] = step_log
        return state

    drafts_json = json.dumps(real_drafts)

    system_prompt = (
        "You are the Critic Agent for EXECRA. Your job is to approve high-quality cold emails. "
        "Approve emails UNLESS they have one of these deal-breaking issues:\n"
        "1. Empty body text (no content at all)\n"
        "2. Contains literal bracket placeholders like '[Name]' or '[Your Name]'\n"
        "3. Exceeds 200 words in body length\n"
        "Otherwise, if the email is readable and professional, set decision to 'APPROVED'. "
        "Do not be overly pedantic about style or minor differences.\n"
        "Return ONLY a strict JSON object. "
        'Format: {"decision": "APPROVED" or "REJECTED", '
        '"feedback": "specific reason if rejected, empty string if approved"}.'
    )

    user_prompt = f"Evaluate these {len(real_drafts)} drafted email(s):\n{drafts_json}"

    try:
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ])

        cleaned = clean_llm_json(response.content)
        evaluation = json.loads(cleaned)

        decision = evaluation.get("decision", "REJECTED").upper()
        feedback = evaluation.get("feedback", "")

        if decision == "APPROVED":
            print("[EXECRA CRITIC] Decision: APPROVED")
            state["status"] = "approved"
            state["final_output"] = json.dumps(state.get("agent_outputs", {}))
            step_log.append(
                f"✅ Critic: {len(real_drafts)} email(s) approved. Ready for your review."
            )
            state["step_log"] = step_log

        else:
            current_retries = state.get("retry_count", 0)
            print(f"[EXECRA CRITIC] Decision: REJECTED. Feedback: {feedback}")

            if current_retries >= MAX_RETRIES:
                # Max retries reached — force approval to prevent infinite loops.
                # Better to show imperfect emails than to loop forever.
                print("[EXECRA CRITIC] Max retries reached. Force-approving to prevent loop.")
                state["status"] = "approved"
                state["final_output"] = json.dumps(state.get("agent_outputs", {}))
                state["critic_feedback"] = feedback
                step_log.append(
                    f"⚠️ Critic: Max retries ({MAX_RETRIES + 1}) reached. "
                    "Approving best available drafts — review carefully before sending."
                )
                state["step_log"] = step_log
            else:
                state["status"] = "retry"
                state["retry_count"] = current_retries + 1
                state["critic_feedback"] = feedback
                step_log.append(
                    f"🔄 Critic: Rejected (attempt {current_retries + 1}/{MAX_RETRIES + 1}). "
                    f"Reason: {feedback[:100]}. BD Agent retrying..."
                )
                state["step_log"] = step_log
                print(f"[EXECRA CRITIC] Retry {state['retry_count']}/{MAX_RETRIES + 1}")

    except Exception as e:
        print(f"[EXECRA CRITIC] Exception: {str(e)}")
        # On critic failure, approve anyway — emails go to human review
        state["status"] = "approved"
        state["critic_feedback"] = f"Critic error (auto-approved): {str(e)[:200]}"
        step_log.append("⚠️ Critic: Evaluation error — emails auto-approved for manual review.")
        state["step_log"] = step_log

    return state
