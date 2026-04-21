import asyncio
import smtplib
from email.message import EmailMessage
from app.core.config import settings

def sync_send_email(to: str, subject: str, body: str) -> dict:
    try:
        # Require credentials before attempting to send
        if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
            return {"success": False, "error": "SMTP_CREDENTIALS_MISSING", "to": to}

        msg = EmailMessage()
        msg.set_content("This email requires HTML support.")
        msg.add_alternative(body, subtype='html')
        
        msg['Subject'] = subject
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = to
        
        # Connect to Gmail SMTP server
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return {
            "success": True,
            "to": to,
            "subject": subject
        }
    except smtplib.SMTPAuthenticationError:
        return {"success": False, "error": "gmail_auth_failed", "to": to}
    except Exception as e:
        error_msg = str(e)
        if "timeout" in error_msg.lower():
            return {"success": False, "error": "smtp_timeout", "to": to}
        return {"success": False, "error": str(e), "to": to}

async def send_email(to: str, subject: str, body: str) -> dict:
    """
    Sends an email using standard SMTP (Gmail) wrapped in run_in_executor 
    to avoid blocking the async event loop.
    Implements a single automatic retry on failure.
    Must never raise an exception.
    """
    loop = asyncio.get_running_loop()
    
    # First attempt
    print(f"[EXECRA GMAIL] Sending to {to} — attempt 1")
    result = await loop.run_in_executor(None, sync_send_email, to, subject, body)
    
    if result["success"]:
        return result
        
    # Retry once on failure
    print(f"[EXECRA GMAIL] Sending to {to} — attempt 2")
    await asyncio.sleep(2)
    result = await loop.run_in_executor(None, sync_send_email, to, subject, body)
    
    return result
