import re

def clean_llm_json(raw: str) -> str:
    # Remove markdown code blocks
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    # Extract only the first valid JSON object using regex
    match = re.search(r'\{.*\}', cleaned, re.DOTALL)
    if match:
        return match.group(0)
    return cleaned
