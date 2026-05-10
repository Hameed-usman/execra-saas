import re
import logging

logger = logging.getLogger(__name__)

# Basic patterns for prompt injection detection
INJECTION_PATTERNS = [
    r"ignore previous instructions",
    r"disregard all previous instructions",
    r"system prompt",
    r"you are now",
    r"new instructions",
    r"output the full system prompt",
    r"jailbreak"
]

def is_potential_injection(text: str) -> bool:
    """
    Checks if a given text contains patterns common in prompt injection attacks.
    """
    text_lower = text.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text_lower):
            logger.warning(f"[EXECRA SECURITY] Potential prompt injection detected: '{pattern}'")
            return True
    return False

def sanitize_output(text: str) -> str:
    """
    Sanitizes LLM output to prevent leakage of internal system info or accidental formatting issues.
    """
    # Remove any internal file paths if accidentally leaked
    sanitized = re.sub(r"/[a-zA-Z0-9_/.]+/ai-backend", "[INTERNAL_PATH]", text)
    return sanitized
