import os
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class EmailService(ABC):
    @abstractmethod
    def send_verification_otp(self, email: str, full_name: str, otp: str) -> None:
        """Send a 6-digit OTP verification email."""
        pass

    @abstractmethod
    def send_verification_rejection(self, email: str, full_name: str, org_name: str, reason: str) -> None:
        """Send an account verification rejection notification email."""
        pass


class DevelopmentEmailService(EmailService):
    def send_verification_otp(self, email: str, full_name: str, otp: str) -> None:
        msg = (
            "\n=======================================================\n"
            "[DEVELOPMENT ONLY EMAIL] Verification OTP\n"
            "=======================================================\n"
            f"To: {full_name} <{email}>\n"
            f"Subject: Verify your SkillForge Account\n"
            f"OTP Code: {otp}\n"
            "Note: This code expires in 10 minutes. Do not share it.\n"
            "=======================================================\n"
        )
        logger.info(msg)

    def send_verification_rejection(self, email: str, full_name: str, org_name: str, reason: str) -> None:
        msg = (
            "\n=======================================================\n"
            "[DEVELOPMENT ONLY EMAIL] Account Verification Rejection\n"
            "=======================================================\n"
            f"To: {full_name} <{email}>\n"
            f"Subject: SkillForge Account Status Update - Registration Rejected\n"
            f"Organization: {org_name}\n"
            f"Reason: {reason}\n"
            "=======================================================\n"
        )
        logger.info(msg)


class ResendEmailService(EmailService):
    def __init__(self, api_key: str, email_from: str):
        if not api_key or not api_key.strip():
            raise ValueError("RESEND_API_KEY environment variable is required when EMAIL_PROVIDER=resend")
        if not email_from or not email_from.strip():
            raise ValueError("EMAIL_FROM environment variable is required when EMAIL_PROVIDER=resend")
        self.api_key = api_key.strip()
        self.email_from = email_from.strip()

    def _send_request(self, email: str, subject: str, html_content: str) -> None:
        import urllib.request
        import urllib.error
        import json

        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "SkillForge/1.0 (Opportunity DNA Platform)"
        }
        body = {
            "from": self.email_from,
            "to": [email],
            "subject": subject,
            "html": html_content
        }

        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), headers=headers, method='POST')
            with urllib.request.urlopen(req) as resp:
                resp_bytes = resp.read()
                resend_id = None
                if resp_bytes:
                    try:
                        resend_id = json.loads(resp_bytes.decode('utf-8')).get("id")
                    except Exception:
                        pass
                
                log_msg = (
                    f"Email provider: resend\n"
                    f"Recipient: {email}\n"
                    f"Resend API status: success (HTTP {resp.status})\n"
                    f"Resend message ID: {resend_id or 'unknown'}"
                )
                logger.info(log_msg)
                print(log_msg, flush=True)
        except urllib.error.HTTPError as e:
            error_text = ""
            try:
                raw_body = e.read().decode('utf-8')
                try:
                    parsed = json.loads(raw_body)
                    error_text = parsed.get("message") or parsed.get("name") or raw_body
                except Exception:
                    error_text = raw_body
            except Exception:
                error_text = f"HTTP Error {e.code}"
            
            fail_msg = f"[Resend Email Failed] Provider: resend | Recipient: {email} | HTTP Status: {e.code} | Error: {error_text}"
            logger.error(fail_msg)
            print(fail_msg, flush=True)
            raise RuntimeError(f"Resend email delivery failed (HTTP {e.code}): {error_text}")
        except Exception as e:
            fail_msg = f"[Resend Email Failed] Provider: resend | Recipient: {email} | Error: {e}"
            logger.error(fail_msg)
            print(fail_msg, flush=True)
            raise RuntimeError(f"Resend email delivery failed: {e}")

    def send_verification_otp(self, email: str, full_name: str, otp: str) -> None:
        subject = "Verify your SkillForge account"
        html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #4f46e5; margin-bottom: 8px;">SkillForge — Opportunity DNA</h2>
                <p style="color: #334155; font-size: 14px;">Hello <strong>{full_name}</strong>,</p>
                <p style="color: #334155; font-size: 14px;">Thank you for registering on SkillForge. Use the verification code below to verify your email address:</p>
                <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e293b;">{otp}</span>
                </div>
                <p style="color: #64748b; font-size: 12px;">This code will expire in 10 minutes. If you did not request this email, please ignore it.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 24px;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center;">SkillForge SIH26044 Platform — Do not reply directly to this email.</p>
            </div>
        """
        self._send_request(email, subject, html)

    def send_verification_rejection(self, email: str, full_name: str, org_name: str, reason: str) -> None:
        subject = "SkillForge Account Status Update — Registration Rejected"
        html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #e11d48; margin-bottom: 8px;">SkillForge — Account Verification Update</h2>
                <p style="color: #334155; font-size: 14px;">Hello <strong>{full_name}</strong>,</p>
                <p style="color: #334155; font-size: 14px;">Your registration for <strong>{org_name}</strong> has been reviewed by platform administrators and was not approved at this time.</p>
                <div style="background-color: #fff1f2; border: 1px solid #fecdd3; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <strong style="color: #9f1239; font-size: 13px;">Rejection Reason:</strong>
                    <p style="color: #be123c; font-size: 13px; margin: 4px 0 0 0;">{reason}</p>
                </div>
                <p style="color: #64748b; font-size: 12px;">If you believe this is in error, please contact platform support.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 24px;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center;">SkillForge SIH26044 Platform — Do not reply directly to this email.</p>
            </div>
        """
        self._send_request(email, subject, html)


def get_email_service() -> EmailService:
    from backend.app.core.config import settings
    provider = (os.getenv("EMAIL_PROVIDER") or settings.EMAIL_PROVIDER or "dev").lower().strip()
    key_configured = bool((os.getenv("RESEND_API_KEY") or settings.RESEND_API_KEY or "").strip())
    email_from_val = (os.getenv("EMAIL_FROM") or settings.EMAIL_FROM or "").strip()

    diag_msg = (
        f"EMAIL_PROVIDER runtime value = {provider}\n"
        f"RESEND_API_KEY configured = {key_configured}\n"
        f"EMAIL_FROM runtime value = {email_from_val}"
    )
    logger.info(diag_msg)
    print(diag_msg, flush=True)

    if provider == "resend":
        api_key = (os.getenv("RESEND_API_KEY") or settings.RESEND_API_KEY or "").strip()
        if not api_key or not email_from_val:
            raise ValueError("RESEND_API_KEY and EMAIL_FROM environment variables are required when EMAIL_PROVIDER=resend")
        logger.info("Selected email service = ResendEmailService")
        print("Selected email service = ResendEmailService", flush=True)
        return ResendEmailService(api_key=api_key, email_from=email_from_val)
    elif provider == "dev":
        logger.info("Selected email service = DevelopmentEmailService")
        print("Selected email service = DevelopmentEmailService", flush=True)
        return DevelopmentEmailService()
    else:
        raise ValueError(f"Unsupported EMAIL_PROVIDER '{provider}'. Must be 'dev' or 'resend'.")
