import os
import asyncio
import uuid

# Load dotenv to get API keys
from dotenv import load_dotenv
load_dotenv(dotenv_path="./ai-backend/.env")

# Must set the correct python path to import app correctly
import sys
sys.path.append(os.path.abspath('./ai-backend'))

from app.graph.graph import compiled_graph

async def main():
    initial_state = {
        "goal": "Find 3 Y Combinator backed startups in the healthcare space",
        "tenant_id": str(uuid.uuid4()),
        "sub_tasks": [],
        "current_agent": "",
        "agent_outputs": {},
        "critic_feedback": "",
        "retry_count": 0,
        "final_output": "",
        "status": "running"
    }
    
    try:
        final_state = await compiled_graph.ainvoke(initial_state)
        print("Success!")
        print("Final Status:", final_state.get("status"))
    except Exception as e:
        print("Failed!")
        print(repr(e))

asyncio.run(main())
