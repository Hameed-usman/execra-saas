import asyncio
import json
from app.graph.graph import compiled_graph

async def main():
    initial_state = {
        "goal": "Find 3 fintech investors in the UAE who back early-stage B2B SaaS",
        "tenant_id": "test-execra-tenant",
        "task_id": "test-task-123",
        "intent": "",
        "entity_type": "",
        "workflow_steps": [],
        "current_agent": "",
        "extracted_entities": [],
        "drafted_emails": [],
        "agent_outputs": {},
        "critic_evaluations": [],
        "critic_feedback": "",
        "retry_count": 0,
        "final_output": "",
        "status": "running",
        "step_log": [],
        "user_prompt": None
    }
    
    print("--- STARTING GRAPH EXECUTION ---")
    
    final_state = await compiled_graph.ainvoke(initial_state)
    
    print("\n--- FINAL STATE ---")
    print(json.dumps(final_state, indent=2))
    
    # Extract number of emails if available
    drafts = final_state.get("drafted_emails", [])
    emails_count = len(drafts)
        
    print(f"\nRESULT: {final_state.get('status')} — {emails_count} emails drafted")
    
    if emails_count > 0:
        print("\n--- DRAFTED EMAILS PREVIEW ---")
        for idx, email in enumerate(drafts, 1):
            subject = email.get("subject", "No Subject")
            body_words = len(email.get("body", "").split())
            print(f"{idx}. Subject: {subject} | Word Count: {body_words}")

if __name__ == "__main__":
    asyncio.run(main())
