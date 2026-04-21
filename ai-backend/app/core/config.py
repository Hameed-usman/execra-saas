# config.py
# This file loads environment variables and provides a settings singleton instance.

from pydantic_settings import BaseSettings
from typing import Any

from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    LLM_PROVIDER: str = "openrouter"
    TAVILY_API_KEY: str = ""
    # Points to the existing execra PostgreSQL — same DB Prisma uses
    DATABASE_URL: str = ""
    N8N_GMAIL_WEBHOOK: str = ""
    # Must match the AUTH_SECRET/NEXTAUTH_SECRET in Next.js
    JWT_SECRET: str = ""
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    # We still keep these around just in case
    RESEND_API_KEY: str = ""
    RESEND_SENDER_EMAIL: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore" # Ignore extra variables in .env

settings = Settings()

# To switch LLM providers for the entire platform, change LLM_PROVIDER in .env. No agent files need to change.
def get_llm(role: str) -> Any:
    provider = settings.LLM_PROVIDER.lower()
    
    if provider == "openrouter":
        base_url = "https://openrouter.ai/api/v1"
        api_key = settings.OPENROUTER_API_KEY
        # Using openrouter/free auto-router — avoids hardcoded model deprecation issues on free tier
        model_map = {
            "planner": "openrouter/free",
            "bd": "openrouter/free",
            "critic": "openrouter/free"
        }
        model = model_map.get(role, "openrouter/free")
        return ChatOpenAI(model=model, api_key=api_key, base_url=base_url, max_retries=3, request_timeout=60)

    elif provider == "openai":
        base_url = None
        api_key = settings.OPENAI_API_KEY
        model_map = {
            "planner": "gpt-4o-mini",
            "bd": "gpt-4o",
            "critic": "gpt-4o-mini"
        }
        model = model_map.get(role, "gpt-4o-mini")
        return ChatOpenAI(model=model, api_key=api_key, base_url=base_url)

    elif provider == "gemini":
        model_map = {
            "planner": "gemini-1.5-flash",
            "bd": "gemini-1.5-pro",
            "critic": "gemini-1.5-flash"
        }
        model = model_map.get(role, "gemini-1.5-flash")
        # convert_system_message_to_human converts system prompts transparently if needed
        return ChatGoogleGenerativeAI(model=model, google_api_key=settings.GEMINI_API_KEY)

    elif provider == "groq":
        model_map = {
            "planner": "llama-3.1-8b-instant",
            "bd": "llama-3.3-70b-versatile",
            "critic": "llama-3.1-8b-instant"
        }
        model = model_map.get(role, "llama-3.1-8b-instant")
        return ChatGroq(model=model, api_key=settings.GROQ_API_KEY)

    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {provider}")
