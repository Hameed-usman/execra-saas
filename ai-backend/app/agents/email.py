import asyncio
from app.graph.state import AgentState
from app.core.config import get_llm
from app.models.schemas import EmailOutput, DraftedEmail
from langchain_core.messages import SystemMessage, HumanMessage
from app.utils.tracing import trace_node
from app.utils.security import sanitize_output

@trace_node("email")
async def email_agent(state: AgentState) -> AgentState:
    step_log = list(state.get("step_log", []))
    
    intent = state.get("intent", "general_outreach")
    entity_type = state.get("entity_type", "entity")
    goal = state.get("goal", "")
    
    state["current_agent"] = "email"
    step_log.append("✍️ Email Agent: Drafting context-aware communications...")
    state["step_log"] = step_log

    llm = get_llm("bd").with_structured_output(EmailOutput)
    
    entities = state.get("extracted_entities", [])
    
    # If no entities were extracted (e.g. planner skipped research because emails were provided in the goal)
    # we pass the goal itself to the LLM to extract targets and draft.
    target_context = ""
    if entities:
        target_context = f"Target Entities from Research:\n{entities}"
    else:
        target_context = f"No research data. Extract targets directly from the User Goal:\n{goal}"

    system_prompt = (
        "You are an expert AI Communication Agent. Your job is to draft highly contextual, human-sounding emails.\n"
        f"Intent: {intent}\n"
        f"Entity Type: {entity_type}\n"
        "Your task is to draft a high-quality, professional email based on the user's goal. "
        "IMPORTANT RULES:\n"
        "1. NEVER use brackets like [Name], [Company], or [Date]. If you don't know a name, use a generic greeting like 'Hi there,' or 'Hey,'.\n"
        "2. Avoid robotic clichés (e.g. 'I hope this finds you well', 'Delve', 'Unlock', 'Harness', 'As an AI').\n"
        "3. Match the tone specified in the intent (e.g. casual for friends, professional for investors).\n"
        "4. Be concise and human."
        "5. If no email address is available for a target, set 'to' to 'research-needed@placeholder.com'.\n"
    )

    if state.get("critic_feedback"):
        system_prompt += (
            f"\n\nCRITICAL FIX REQUIRED: Your previous draft was REJECTED by the Critic.\n"
            f"Feedback: {state['critic_feedback']}\n"
            "You MUST fix these exact issues in this new draft."
        )

    try:
        response: EmailOutput = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=target_context)
        ])

        # Phase 2: Observability - Track tokens
        if hasattr(response, "usage_metadata"):
            state["execution_metadata"]["email"]["tokens"] = response.usage_metadata

        drafted_emails = []
        for email in response.emails:
            sanitized_body = sanitize_output(email.body)
            email_dict = email.dict()
            email_dict["body"] = sanitized_body
            drafted_emails.append(email_dict)

        if not drafted_emails:
            state["status"] = "failed"
            state["final_output"] = "Email Agent failed to generate any drafts."
            step_log.append("❌ Email Agent: No drafts generated.")
            state["step_log"] = step_log
            return state

        # Separate real addresses from placeholders
        real_emails = [e for e in drafted_emails if e.get("to") != "research-needed@placeholder.com"]
        placeholder_emails = [e for e in drafted_emails if e.get("to") == "research-needed@placeholder.com"]

        state["drafted_emails"] = drafted_emails
        
        # Legacy support
        state["agent_outputs"]["bd_agent"] = drafted_emails

        if not real_emails and placeholder_emails:
            state["status"] = "waiting_for_input"
            state["user_prompt"] = (
                f"No email addresses were found for {len(placeholder_emails)} draft(s). "
                "Please provide them manually in the Approvals panel."
            )
            step_log.append("⚠️ Email Agent: Missing email addresses. Human input required.")
        else:
            state["status"] = "running"
            step_log.append(f"✅ Email Agent: {len(real_emails)} draft(s) ready. Forwarding to Critic...")
            
        state["step_log"] = step_log
        print(f"[EXECRA EMAIL] Generated {len(drafted_emails)} drafts.")

    except Exception as e:
        print(f"[EXECRA EMAIL] Exception: {str(e)}")
        state["status"] = "failed"
        state["final_output"] = f"Email Agent error: {str(e)}"
        step_log.append(f"❌ Email Agent error: {str(e)[:100]}")
        state["step_log"] = step_log

    return state
