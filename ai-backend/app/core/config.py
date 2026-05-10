import os
import logging
from pydantic_settings import BaseSettings
from typing import Any, List, Dict, Optional
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    LLM_PROVIDER: str = "openrouter"
    TAVILY_API_KEY: str = ""
    DATABASE_URL: str = ""
    N8N_GMAIL_WEBHOOK: str = ""
    JWT_SECRET: str = ""
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    RESEND_API_KEY: str = ""
    RESEND_SENDER_EMAIL: str = ""
    ENCRYPTION_KEY: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX: str = "execra-memory1"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# ── Model Routing Architecture ────────────────────────────────────────────────

# Map roles to model tiers (smart vs fast)
# 'fast' = optimized for latency/cost (e.g., 4o-mini, Flash)
# 'smart' = optimized for reasoning/quality (e.g., 4o, Pro)
MODEL_TIERS = {
    "planner": "fast",
    "research": "smart",
    "email": "smart",
    "critic": "fast"
}

def get_llm(role: str) -> Any:
    """
    Returns a configured LLM based on the provider and the required tier.
    Includes built-in retry logic and timeout protection.
    """
    provider = settings.LLM_PROVIDER.lower()
    tier = MODEL_TIERS.get(role, "fast")
    
    # Standard configuration for production reliability
    common_params = {
        "max_retries": 3,
        "request_timeout": 60 if tier == "fast" else 120,
    }

    if provider == "openrouter":
        base_url = "https://openrouter.ai/api/v1"
        api_key = settings.OPENROUTER_API_KEY
        # Use tiered models if available, else fallback to free auto-router
        model = "openrouter/free" 
        if tier == "smart":
            model = "openai/gpt-4o"
        return ChatOpenAI(model=model, api_key=api_key, base_url=base_url, **common_params)

    elif provider == "openai":
        api_key = settings.OPENAI_API_KEY
        model = "gpt-4o-mini" if tier == "fast" else "gpt-4o"
        return ChatOpenAI(model=model, api_key=api_key, **common_params)

    elif provider == "gemini":
        model = "gemini-1.5-flash" if tier == "fast" else "gemini-1.5-pro"
        return ChatGoogleGenerativeAI(model=model, google_api_key=settings.GEMINI_API_KEY)

    elif provider == "groq":
        model = "llama-3.1-8b-instant" if tier == "fast" else "llama-3.3-70b-versatile"
        return ChatGroq(model=model, api_key=settings.GROQ_API_KEY)
    
    elif provider == "deepseek":
        model = "deepseek-chat"
        return ChatOpenAI(model=model, api_key=settings.DEEPSEEK_API_KEY, base_url="https://api.deepseek.com", **common_params)

    else:
        logger.error(f"Unknown LLM_PROVIDER: {provider}. Falling back to default.")
        return ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)
