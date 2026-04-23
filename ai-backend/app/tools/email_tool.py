import asyncio
import smtplib
import base64
from email.message import EmailMessage
from app.core.config import settings
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

def sync_send_email_smtp(to: str, subject: str, body: str) -> dict:
    """Fallback - Sends email via legacy SMTP"""
    try:
        if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
            return {"success": False, "error": "SMTP_CREDENTIALS_MISSING", "to": to}

        msg = EmailMessage()
        msg.set_content("This email requires HTML support.")
        msg.add_alternative(body, subtype='html')
        
        msg['Subject'] = subject
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = to
        
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return {"success": True, "to": to, "subject": subject}
    except Exception as e:
        return {"success": False, "error": f"SMTP Error: {str(e)}", "to": to}

def sync_send_email_gmail_api(to: str, subject: str, body: str, token: str) -> dict:
    """Professional - Sends email via Gmail API using OAuth token"""
    try:
        creds = Credentials(token=token)
        service = build('gmail', 'v1', credentials=creds)
        
        message = EmailMessage()
        message.set_content("This email requires HTML support.")
        message.add_alternative(body, subtype='html')
        message['To'] = to
        message['Subject'] = subject
        
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        create_message = {'raw': encoded_message}
        
        service.users().messages().send(userId="me", body=create_message).execute()
        
        return {"success": True, "to": to, "subject": subject}
    except Exception as e:
        import traceback
        error_msg = f"Gmail API Error: {str(e)}"
        print(f"[EXECRA GMAIL] {error_msg}")
        return {"success": False, "error": error_msg, "to": to}

async def send_email(to: str, subject: str, body: str, token: str = None) -> dict:
    """
    Orchestrates email sending. Prioritizes Gmail API if token is provided,
    falls back to SMTP if no token or API fails.
    """
    loop = asyncio.get_running_loop()
    
    if token:
        print(f"[EXECRA GMAIL] Attempting Gmail API send to {to}")
        result = await loop.run_in_executor(None, sync_send_email_gmail_api, to, subject, body, token)
        if result["success"]:
            return result
        print(f"[EXECRA GMAIL] Gmail API failed, checking SMTP fallback: {result.get('error')}")

    # Fallback to SMTP
    print(f"[EXECRA GMAIL] Using SMTP fallback for {to}")
    result = await loop.run_in_executor(None, sync_send_email_smtp, to, subject, body)
    
    return result
