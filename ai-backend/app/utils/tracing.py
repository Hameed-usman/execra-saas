import time
import functools
import logging
from typing import Any, Callable, Dict
from app.graph.state import AgentState

logger = logging.getLogger(__name__)

def trace_node(node_name: str):
    """
    Decorator to trace LangGraph node execution.
    Tracks latency and ensures metadata is updated in the state.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(state: AgentState, *args, **kwargs) -> AgentState:
            start_time = time.time()
            
            # Ensure execution_metadata exists
            if "execution_metadata" not in state:
                state["execution_metadata"] = {}
            
            logger.info(f"[EXECRA TRACE] Node '{node_name}' started.")
            
            try:
                # Execute the actual node function
                result_state = await func(state, *args, **kwargs)
                
                # Calculate latency
                latency = time.time() - start_time
                
                # Update metadata for this node
                node_meta = result_state["execution_metadata"].get(node_name, {})
                node_meta["latency_seconds"] = round(latency, 3)
                node_meta["status"] = "success"
                
                result_state["execution_metadata"][node_name] = node_meta
                
                logger.info(f"[EXECRA TRACE] Node '{node_name}' completed in {latency:.2f}s.")
                return result_state
                
            except Exception as e:
                latency = time.time() - start_time
                logger.error(f"[EXECRA TRACE] Node '{node_name}' failed after {latency:.2f}s: {str(e)}")
                
                # Track failure in metadata
                if "execution_metadata" not in state:
                    state["execution_metadata"] = {}
                
                state["execution_metadata"][node_name] = {
                    "latency_seconds": round(latency, 3),
                    "status": "failed",
                    "error": str(e)
                }
                
                # Re-raise to let the graph handle the failure
                raise e
                
        return wrapper
    return decorator
