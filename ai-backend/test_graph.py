import asyncio
import json
from app.graph.graph import compiled_graph

async def main():
    initial_state = {
        "goal": "Find 5 fintech investors in the UAE who back early-stage B2B SaaS",
        "tenant_id": "test-execra-tenant",
        "sub_tasks": [],
        "current_agent": "",
        "agent_outputs": {},
        "critic_feedback": "",
        "retry_count": 0,
        "final_output": "",
        "status": "running"
    }
    
    print("--- STARTING GRAPH EXECUTION ---")
    
    final_state = await compiled_graph.ainvoke(initial_state)
    
    print("\n--- FINAL STATE ---")
    print(json.dumps(final_state, indent=2))
    
    # Extract number of emails if available
    emails_count = 0
    bd_results = final_state.get("agent_outputs", {}).get("bd_agent", [])
    if isinstance(bd_results, list):
        emails_count = len(bd_results)
        
    print(f"\nRESULT: {final_state.get('status')} — {emails_count} emails drafted")
    
    if emails_count > 0:
        print("\n--- DRAFTED EMAILS PREVIEW ---")
        for idx, email in enumerate(bd_results, 1):
            subject = email.get("subject", "No Subject")
            body_words = len(email.get("body", "").split())
            print(f"{idx}. Subject: {subject} | Word Count: {body_words}")

if __name__ == "__main__":
    asyncio.run(main())
