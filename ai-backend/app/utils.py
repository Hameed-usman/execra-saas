import re

def clean_llm_json(raw: str) -> str:
    """
    Robustly extracts the first valid JSON object from a string using a brace-depth walker.
    Removes markdown code blocks and ignores trailing junk text.
    """
    # Remove markdown code blocks
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    
    start_idx = cleaned.find('{')
    if start_idx == -1:
        return cleaned
    
    depth = 0
    for i in range(start_idx, len(cleaned)):
        if cleaned[i] == '{':
            depth += 1
        elif cleaned[i] == '}':
            depth -= 1
            if depth == 0:
                # Return exactly the first balanced JSON object found
                return cleaned[start_idx:i+1]
                
    return cleaned[start_idx:]
