import asyncio
import json
import time
from app.utils import clean_llm_json
from app.graph.state import AgentState
from app.core.config import settings, get_llm
from langchain_tavily import TavilySearch
from langchain_core.messages import SystemMessage, HumanMessage
from app.memory.retriever import retrieve_memory

# Minimum Pinecone score to consider an investor already contacted.
# 0.88 is intentionally high — we only skip on near-exact name+firm matches.
MEMORY_DUPLICATE_THRESHOLD = 0.88


async def bd_agent(state: AgentState) -> AgentState:
    start_time = time.time()
    step_log = list(state.get("step_log", []))

    task_desc = (
        state["sub_tasks"][0]["task"]
        if state.get("sub_tasks")
        else state.get("goal", "")
    )
    print(f"[EXECRA BD AGENT] Task: {task_desc}")

    if not state.get("agent_outputs"):
        state["agent_outputs"] = {}

    state["current_agent"] = "bd_agent"
    step_log.append(f"🔍 BD Agent: Searching for investors — '{task_desc[:80]}...'")
    state["step_log"] = step_log

    # ── Tavily search ──────────────────────────────────────────────────────────
    try:
        search_tool = TavilySearch(max_results=10, tavily_api_key=settings.TAVILY_API_KEY)
        search_response = await search_tool.ainvoke({"query": task_desc})

        if isinstance(search_response, dict):
            raw_results = search_response.get("results", [])
        elif isinstance(search_response, list):
            raw_results = search_response
        else:
            raw_results = []

        print(f"[EXECRA BD AGENT] Tavily returned {len(raw_results)} results.")
        step_log.append(f"📡 BD Agent: Found {len(raw_results)} search results from the web.")
        state["step_log"] = step_log

        if not raw_results:
            state["status"] = "failed"
            state["final_output"] = "No investors found. Try a more specific goal."
            state["agent_outputs"]["bd_agent"] = []
            step_log.append("❌ BD Agent: No results returned. Terminating pipeline.")
            state["step_log"] = step_log
            return state

    except Exception as e:
        error_msg = str(e)
        if "402" in error_msg:
            error_msg = "Tavily API error: insufficient credits."
        print(f"[EXECRA BD AGENT] Search error: {error_msg}")
        state["status"] = "failed"
        state["final_output"] = error_msg
        step_log.append(f"❌ BD Agent: Search failed — {error_msg[:100]}")
        state["step_log"] = step_log
        return state

    # ── Draft emails ───────────────────────────────────────────────────────────
    llm = get_llm("bd")
    drafted_emails = []
    valid_results = raw_results[:3]

    for idx, investor in enumerate(valid_results):
        investor_name = investor.get("title", "Unknown Investor")
        firm = investor.get("firm", "Unknown Firm")

        # Normalise name/firm from compound titles like "John Smith at Accel"
        if firm == "Unknown Firm" and " at " in investor_name:
            parts = investor_name.split(" at ", 1)
            investor_name = parts[0].strip()
            firm = parts[1].strip()

        step_log.append(f"👤 BD Agent: Processing investor {idx + 1}/{len(valid_results)} — {investor_name}")
        state["step_log"] = step_log

        # ── Pinecone duplicate check ───────────────────────────────────────────
        # We query by name+firm and only skip if score exceeds MEMORY_DUPLICATE_THRESHOLD
        # AND the metadata investor_name matches closely.
        already_contacted = False
        try:
            memory_query = f"{investor_name} {firm}"
            existing_memories = await retrieve_memory(
                tenant_id=state.get("tenant_id"),
                query=memory_query,
                top_k=3,
                score_threshold=MEMORY_DUPLICATE_THRESHOLD,
            )

            # Secondary check: metadata must contain the investor name (not just semantic similarity)
            for mem in existing_memories:
                stored_name = mem.get("investor_name", "").lower()
                if stored_name and investor_name.lower() in stored_name:
                    already_contacted = True
                    break

        except Exception as me:
            # Fail-open: Pinecone errors must never block the pipeline
            print(f"[EXECRA BD AGENT] Memory check failed (proceeding): {me}")

        if already_contacted:
            print(f"[EXECRA BD AGENT] Duplicate: {investor_name} already contacted. Skipping.")
            step_log.append(
                f"🔁 BD Agent: Skipped {investor_name} — already contacted (memory match)."
            )
            state["step_log"] = step_log
            drafted_emails.append({
                "to": "skipped@execra.ai",
                "subject": "Skipped: Previously Contacted",
                "body": (
                    f"We have already contacted {investor_name} at {firm}. "
                    "Skipping to avoid duplicate outreach."
                ),
                "investor_name": investor_name,
                "firm": firm,
                "skipped": True,
            })
            continue

        # ── LLM email drafting ─────────────────────────────────────────────────
        system_prompt = (
            "You are an expert cold email writer for startup founders. Write emails that "
            "feel personal, specific, and human. Never sound like a sales tool. Always "
            "reference something specific about the investor. Keep emails under 150 words. "
            "End with a soft ask for a 20-minute call."
        )

        user_prompt = (
            f"Investor Context:\n{json.dumps(investor)}\n\n"
            f"Task Goal Context:\n{task_desc}\n\n"
        )

        if state.get("critic_feedback"):
            user_prompt += (
                f"Previous attempt was rejected: {state['critic_feedback']}. "
                "Fix those exact issues in this new version.\n\n"
            )

        user_prompt += (
            "Return ONLY a strict JSON object. Format:\n"
            '{"to": "...", "subject": "...", "body": "..."}\n'
            "CRITICAL RULES:\n"
            "1. NEVER use placeholder brackets like [Name], [Your Name], [Company].\n"
            "2. If investor name is unknown, start with 'Hi there,'.\n"
            "3. If your name is needed, use 'The Execra Team'.\n"
            "4. If no email is visible in the search result, set 'to' to "
            "'research-needed@placeholder.com' and add a 'note' field: "
            "'Email not found — please provide manually'.\n"
            "Do not return markdown, backticks, or any explanation."
        )

        try:
            response = await llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            cleaned = clean_llm_json(response.content)
            parsed_email = json.loads(cleaned)

            # Post-process: strip any leftover bracket placeholders
            body = parsed_email.get("body", "")
            for placeholder in ["[Name]", "[investor name]", "[Your Name]", "[Company]"]:
                body = body.replace(placeholder, "")
            parsed_email["body"] = body.strip()
            parsed_email["investor_name"] = investor_name
            parsed_email["firm"] = firm

            drafted_emails.append(parsed_email)
            recipient = parsed_email.get("to", "unknown")
            step_log.append(
                f"✉️ BD Agent: Draft ready for {investor_name} → {recipient}"
            )
            state["step_log"] = step_log
            print(f"[EXECRA BD AGENT] Draft — Subject: {parsed_email.get('subject', 'N/A')}")

            # Rate-limit mitigation
            await asyncio.sleep(1.5)

        except Exception as e:
            print(f"[EXECRA BD AGENT] Skipping investor — error: {str(e)}")
            step_log.append(f"⚠️ BD Agent: Draft failed for {investor_name} — skipped.")
            state["step_log"] = step_log
            continue

    # ── Termination contract ───────────────────────────────────────────────────
    if not drafted_emails:
        # Zero drafts — total failure
        state["status"] = "failed"
        state["final_output"] = "BD Agent could not draft any emails."
        state["agent_outputs"]["bd_agent"] = []
        step_log.append("❌ BD Agent: No emails drafted. Pipeline failed.")
        state["step_log"] = step_log
        return state

    # Separate real addresses from placeholders
    real_emails = [
        e for e in drafted_emails
        if e.get("to") not in ("research-needed@placeholder.com", "skipped@execra.ai")
        and not e.get("skipped", False)
    ]
    placeholder_emails = [
        e for e in drafted_emails
        if e.get("to") == "research-needed@placeholder.com"
    ]

    state["agent_outputs"]["bd_agent"] = drafted_emails

    total_time = time.time() - start_time
    print(
        f"[EXECRA BD AGENT] Done in {total_time:.1f}s. "
        f"Real: {len(real_emails)}, Placeholders: {len(placeholder_emails)}, "
        f"Skipped: {len(drafted_emails) - len(real_emails) - len(placeholder_emails)}"
    )

    if not real_emails and placeholder_emails:
        # ALL drafted emails need manual input — pause pipeline and ask user
        state["status"] = "waiting_for_input"
        state["user_prompt"] = (
            f"No investor email addresses were found automatically for {len(placeholder_emails)} "
            "draft(s). Please provide the email addresses manually in the Approvals panel, "
            "then click 'Approve & Send'."
        )
        step_log.append(
            "⚠️ BD Agent: No email addresses found. "
            "Human input required — please add emails in the Approvals panel."
        )
        state["step_log"] = step_log
        print("[EXECRA BD AGENT] All placeholders — setting status to waiting_for_input.")
    else:
        # At least some real emails — pass to critic for quality review
        state["status"] = "running"
        step_log.append(
            f"✅ BD Agent: {len(real_emails)} draft(s) ready with real addresses. "
            "Sending to Critic Agent for review..."
        )
        state["step_log"] = step_log
        print(f"[EXECRA BD AGENT] {len(real_emails)} real email(s) → critic.")

    return state