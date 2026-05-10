import asyncio
import time
from app.graph.state import AgentState
from app.core.config import settings, get_llm
from app.models.schemas import ResearchOutput
from langchain_tavily import TavilySearch
from langchain_core.messages import SystemMessage, HumanMessage
from app.memory.retriever import retrieve_memory
from app.utils.tracing import trace_node

# Minimum Pinecone score to consider an entity already contacted.
MEMORY_DUPLICATE_THRESHOLD = 0.88

@trace_node("research")
async def research_agent(state: AgentState) -> AgentState:
    start_time = time.time()
    step_log = list(state.get("step_log", []))

    intent = state.get("intent", "general_research")
    entity_type = state.get("entity_type", "entity")
    goal = state.get("goal", "")

    print(f"[EXECRA RESEARCH] Goal: {goal} | Intent: {intent} | Entity: {entity_type}")

    state["current_agent"] = "research"
    step_log.append(f"🔍 Research Agent: Searching for {entity_type}s based on your goal...")
    state["step_log"] = step_log

    # ── Tavily search ──────────────────────────────────────────────────────────
    try:
        search_tool = TavilySearch(max_results=10, tavily_api_key=settings.TAVILY_API_KEY)
        search_query = f"Find {entity_type} matching: {goal}"
        search_response = await search_tool.ainvoke({"query": search_query})

        if isinstance(search_response, dict):
            raw_results = search_response.get("results", [])
        elif isinstance(search_response, list):
            raw_results = search_response
        else:
            raw_results = []

        print(f"[EXECRA RESEARCH] Tavily returned {len(raw_results)} results.")
        step_log.append(f"📡 Research Agent: Retrieved {len(raw_results)} raw search results.")
        state["step_log"] = step_log

        if not raw_results:
            state["status"] = "failed"
            state["final_output"] = f"No {entity_type}s found. Try a more specific goal."
            step_log.append("❌ Research Agent: No results returned. Terminating pipeline.")
            state["step_log"] = step_log
            return state

    except Exception as e:
        error_msg = str(e)
        if "402" in error_msg:
            error_msg = "Tavily API error: insufficient credits."
        print(f"[EXECRA RESEARCH] Search error: {error_msg}")
        state["status"] = "failed"
        state["final_output"] = error_msg
        step_log.append(f"❌ Research Agent: Search failed — {error_msg[:100]}")
        state["step_log"] = step_log
        return state

    # ── Entity Extraction ──────────────────────────────────────────────────────
    llm = get_llm("bd").with_structured_output(ResearchOutput)
    extracted_entities = []

    # Batch process top 5 results for efficiency
    top_results = raw_results[:5]

    system_prompt = (
        "You are an expert Business Intelligence Agent. Your job is to extract highly structured "
        f"information about '{entity_type}' from the provided search results.\n"
        f"The user's goal intent is: {intent}.\n"
        "Rules:\n"
        "1. Extract the specific name and organization.\n"
        "2. Score the relevance from 1-10 based on how well they match the goal.\n"
        "3. Provide a brief 1-2 sentence context summary.\n"
        "4. Set is_contactable=True if they seem like a valid target for outreach/communication."
    )

    try:
        response: ResearchOutput = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Search Results:\n{top_results}\n\nUser Goal:\n{goal}")
        ])
        
        # Phase 2: Observability - Track tokens
        if hasattr(response, "usage_metadata"):
            state["execution_metadata"]["research"]["tokens"] = response.usage_metadata

        extracted = response.entities
        
        # Deduplication check against Pinecone Memory
        for entity in extracted:
            already_contacted = False
            try:
                memory_query = f"{entity.name} {entity.organization}"
                existing_memories = await retrieve_memory(
                    tenant_id=state.get("tenant_id"),
                    query=memory_query,
                    top_k=3,
                    score_threshold=MEMORY_DUPLICATE_THRESHOLD,
                )

                for mem in existing_memories:
                    stored_name = mem.get("investor_name", "").lower() # legacy field check
                    if stored_name and entity.name.lower() in stored_name:
                        already_contacted = True
                        break

            except Exception as me:
                print(f"[EXECRA RESEARCH] Memory check failed (proceeding): {me}")

            if already_contacted:
                print(f"[EXECRA RESEARCH] Duplicate: {entity.name} already contacted. Skipping.")
                step_log.append(f"🔁 Research Agent: Skipped {entity.name} — already contacted.")
                state["step_log"] = step_log
            else:
                extracted_entities.append(entity.dict())
                
    except Exception as e:
        print(f"[EXECRA RESEARCH] Extraction error: {str(e)}")
        state["status"] = "failed"
        state["final_output"] = f"Extraction failed: {str(e)}"
        step_log.append(f"❌ Research Agent: Extraction failed — {str(e)[:100]}")
        state["step_log"] = step_log
        return state

    if not extracted_entities:
        state["status"] = "failed"
        state["final_output"] = "Research Agent could not extract any valid new entities."
        step_log.append("❌ Research Agent: No valid entities extracted.")
        state["step_log"] = step_log
        return state

    # Save to state
    state["extracted_entities"] = extracted_entities
    
    total_time = time.time() - start_time
    print(f"[EXECRA RESEARCH] Done in {total_time:.1f}s. Extracted {len(extracted_entities)} entities.")
    
    step_log.append(f"✅ Research Agent: Successfully extracted {len(extracted_entities)} {entity_type}(s).")
    state["step_log"] = step_log
    
    return state
