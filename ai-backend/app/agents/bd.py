# # Updated bd agent incorporating Tavily Search and LangChain model iteration.
# # If you want to change providers later, only change LLM_PROVIDER in .env.
# import json
# import time
# from app.utils import clean_llm_json
# from app.graph.state import AgentState
# from app.core.config import settings, get_llm
# from langchain_tavily import TavilySearch
# from langchain_core.messages import SystemMessage, HumanMessage

# async def bd_agent(state: AgentState) -> AgentState:
#     start_time = time.time()
    
#     task_desc = state['sub_tasks'][0]['task'] if state.get('sub_tasks') else state.get('goal', '')
#     print(f"[EXECRA BD AGENT] Task: {task_desc}")
    
#     if 'agent_outputs' not in state or state['agent_outputs'] is None:
#         state['agent_outputs'] = {}
        
#     state['current_agent'] = 'bd_agent'
    
#     # Initialize Tavily search
#     try:
#         search_tool = TavilySearch(max_results=10, tavily_api_key=settings.TAVILY_API_KEY)
#         search_results = search_tool.invoke({"query": task_desc})
#     except Exception as e:
#         print(f"[EXECRA BD AGENT] Tavily search failed: {str(e)}")
#         state['status'] = 'failed'
#         return state
        
#     # Get LLM instance dynamically inside the node    
#     llm = get_llm("bd")
    
#     drafted_emails = []
    
#     # Take up to top 5 valid search results
#     valid_results = search_results[:5] if isinstance(search_results, list) else []
    
#     for investor in valid_results:
#         system_prompt = (
#             "You are an expert cold email writer for startup founders. You write emails that feel personal, "
#             "specific, and human. Never sound like a sales tool. Always reference something specific about "
#             "the investor. Keep emails under 150 words. End with a soft ask for a 20-minute call — never demand a response."
#         )
        
#         user_prompt = f"Investor Context:\n{investor}\n\nTask Goal Context:\n{task_desc}\n\n"
        
#         if state.get('critic_feedback'):
#             user_prompt += f"Previous attempt was rejected for this reason: {state['critic_feedback']}. Fix these specific issues in this new version.\n"
            
#         user_prompt += (
#             "Return ONLY a strict JSON object. Format strictly as:\n"
#             "{\"to\": \"...\", \"subject\": \"...\", \"body\": \"...\"}\n"
#             "If no email address is visible in the search result, set \"to\" to \"research-needed@placeholder.com\" and add a \"note\" field with \"Email not found — manual research needed\".\n"
#             "Do not return markdown, backticks, or any explanation."
#         )
        
#         try:
#             response = await llm.ainvoke([
#                 SystemMessage(content=system_prompt),
#                 HumanMessage(content=user_prompt)
#             ])
#             cleaned = clean_llm_json(response.content)
#             parsed_email = json.loads(cleaned)
#             drafted_emails.append(parsed_email)
#         except Exception as e:
#             print(f"[EXECRA BD AGENT] Email drafting error for an investor skipped: {str(e)}")
#             continue

#     state['agent_outputs']['bd_agent'] = drafted_emails
    
#     total_time = time.time() - start_time
#     print(f"[EXECRA BD AGENT] Finished in {total_time:.2f} seconds. Drafted {len(drafted_emails)} emails.")

#     return state














import asyncio
import json
import time
from app.utils import clean_llm_json
from app.graph.state import AgentState
from app.core.config import settings, get_llm
from langchain_tavily import TavilySearch
from langchain_core.messages import SystemMessage, HumanMessage

async def bd_agent(state: AgentState) -> AgentState:
    start_time = time.time()
    
    task_desc = state['sub_tasks'][0]['task'] if state.get('sub_tasks') else state.get('goal', '')
    print(f"[EXECRA BD AGENT] Task: {task_desc}")
    
    if 'agent_outputs' not in state or state['agent_outputs'] is None:
        state['agent_outputs'] = {}
        
    state['current_agent'] = 'bd_agent'
    
    # Initialize Tavily search
    try:
        search_tool = TavilySearch(max_results=10, tavily_api_key=settings.TAVILY_API_KEY)
        search_response = await search_tool.ainvoke({"query": task_desc})
        
        # FIX: Tavily returns a dict with a "results" key, not a plain list
        if isinstance(search_response, dict):
            raw_results = search_response.get("results", [])
        elif isinstance(search_response, list):
            raw_results = search_response
        else:
            raw_results = []
        
        print(f"[EXECRA BD AGENT] Tavily returned {len(raw_results)} results.")
        
        if not raw_results:
            print("[EXECRA BD AGENT] No results found. Setting status to failed.")
            state['status'] = 'failed'
            state['final_output'] = 'No investors found for this search criteria. Try a broader goal.'
            state['agent_outputs']['bd_agent'] = []
            return state
            
    except Exception as e:
        print(f"[EXECRA BD AGENT] Tavily search failed: {str(e)}")
        state['status'] = 'failed'
        return state
        
    llm = get_llm("bd")
    
    drafted_emails = []
    valid_results = raw_results[:3]
    
    for investor in valid_results:
        system_prompt = (
            "You are an expert cold email writer for startup founders. You write emails that feel personal, "
            "specific, and human. Never sound like a sales tool. Always reference something specific about "
            "the investor. Keep emails under 150 words. End with a soft ask for a 20-minute call — never demand a response."
        )
        
        user_prompt = f"Investor Context:\n{json.dumps(investor)}\n\nTask Goal Context:\n{task_desc}\n\n"
        
        if state.get('critic_feedback'):
            user_prompt += (
                f"Previous attempt was rejected for this reason: {state['critic_feedback']}. "
                f"Fix these specific issues in this new version.\n"
            )
            
        user_prompt += (
            "Return ONLY a strict JSON object. Format strictly as:\n"
            "{\"to\": \"...\", \"subject\": \"...\", \"body\": \"...\"}\n"
            "If no email address is visible in the search result, set \"to\" to "
            "\"research-needed@placeholder.com\" and add a \"note\" field: "
            "\"Email not found — manual research needed\".\n"
            "Do not return markdown, backticks, or any explanation."
        )
        
        try:
            response = await llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ])
            
            # Debug: show raw response snippet
            raw = response.content
            print(f"[EXECRA BD AGENT] Raw LLM snippet: {raw[:120]}")
            
            cleaned = clean_llm_json(raw)
            parsed_email = json.loads(cleaned)
            drafted_emails.append(parsed_email)
            print(f"[EXECRA BD AGENT] Email drafted — Subject: {parsed_email.get('subject', 'N/A')}")
            
            # Rate limit mitigation: short delay to avoid OpenRouter/Free 429 errors
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"[EXECRA BD AGENT] Skipping investor — error: {str(e)}")
            continue

    state['agent_outputs']['bd_agent'] = drafted_emails
    
    total_time = time.time() - start_time
    print(f"[EXECRA BD AGENT] Finished in {total_time:.2f} seconds. Drafted {len(drafted_emails)} emails.")

    return state