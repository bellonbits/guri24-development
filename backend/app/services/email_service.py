import re
import logging
import asyncio
from app.config import settings
from app.models.user import User
import resend

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # Email configuration from settings
        self.from_email = settings.EMAIL_FROM
        self.from_name = settings.EMAIL_FROM_NAME
        self.support_email = settings.SUPPORT_EMAIL
        self.company_name = settings.COMPANY_NAME
        self.company_address = settings.COMPANY_ADDRESS
        self.company_phone = settings.COMPANY_PHONE

    def _strip_html(self, html: str) -> str:
        """Remove HTML tags for plain text fallback"""
        text = re.sub(r'<style.*?</style>', '', html, flags=re.DOTALL)
        text = re.sub(r'<[^<]+?>', '', text)
        return re.sub(r'\s+', ' ', text).strip()

    def _get_social_icons_html(self) -> str:
        """Render clean, high-compatibility social link icons"""
        return f"""
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 14px auto 0;">
            <tr>
                <td style="padding: 0 8px;">
                    <a href="https://facebook.com/guri24" target="_blank" style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; border-radius: 50%; background-color: #f1f5f9; color: #64748b; font-size: 12px; font-weight: 700; text-decoration: none; font-family: sans-serif;">f</a>
                </td>
                <td style="padding: 0 8px;">
                    <a href="https://twitter.com/guri24" target="_blank" style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; border-radius: 50%; background-color: #f1f5f9; color: #64748b; font-size: 12px; font-weight: 700; text-decoration: none; font-family: sans-serif;">𝕏</a>
                </td>
                <td style="padding: 0 8px;">
                    <a href="https://linkedin.com/company/guri24" target="_blank" style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; border-radius: 50%; background-color: #f1f5f9; color: #64748b; font-size: 12px; font-weight: 700; text-decoration: none; font-family: sans-serif;">in</a>
                </td>
                <td style="padding: 0 8px;">
                    <a href="https://instagram.com/guri24" target="_blank" style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; border-radius: 50%; background-color: #f1f5f9; color: #64748b; font-size: 12px; font-weight: 700; text-decoration: none; font-family: sans-serif;">ig</a>
                </td>
            </tr>
        </table>
        """

    def _create_gusto_template(
        self,
        headline: str,
        illustration_svg: str,
        inset_content: str,
        preheader: str = "",
        to_email: str = "",
        unsubscribe_url: str = None
    ) -> str:
        """
        Creates an editorial card-based email template matching the Gusto design:
        - Outer framing: Rich brand teal (#0c6759)
        - Inner white card: 560px max width, 16px rounded corners
        - Centered brand logo + bold headline
        - Artistic celebratory vector illustration
        - Inset bordered content box with details & bold CTA button
        - 'Have questions?' support section
        - Full company address and social footer
        """
        website_url = settings.FRONTEND_URL.rstrip('/')
        logo_url = f"{website_url}/logo.png"
        unsub_link = ""
        if unsubscribe_url:
            unsub_link = f'<p style="margin: 8px 0 0;"><a href="{unsubscribe_url}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe from these emails</a></p>'

        return f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>{headline} - {self.company_name}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td, h1, h2, h3, p, a, span {{ font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif !important; }}
    </style>
    <![endif]-->
    <style type="text/css">
        @media only screen and (max-width: 600px) {{
            .email-outer-td {{ padding: 16px 8px !important; }}
            .email-card-td {{ padding: 32px 20px 28px !important; }}
            .email-inset-box {{ padding: 22px 16px !important; }}
            .email-headline {{ font-size: 22px !important; }}
        }}
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0c6759; -webkit-font-smoothing: antialiased; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <!-- Preheader snippet -->
    <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #0c6759;">
        {preheader} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>

    <!-- Outer frame (Rich Brand Teal) -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c6759; margin: 0; padding: 0;">
        <tr>
            <td align="center" class="email-outer-td" style="padding: 44px 16px;">
                <!-- Main White Card -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18); overflow: hidden;">
                    <tr>
                        <td class="email-card-td" style="padding: 44px 40px 36px; text-align: center;">

                            <!-- Brand Logo -->
                            <div style="text-align: center; margin-bottom: 16px;">
                                <a href="{website_url}" target="_blank" style="text-decoration: none; display: inline-block;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                        <tr>
                                            <td align="center">
                                                <img src="{logo_url}" alt="{self.company_name}" height="38" style="height: 38px; max-height: 38px; display: block; border: 0; outline: none; margin: 0 auto;" onerror="this.style.display='none';" />
                                                <!-- Fallback styled text logo -->
                                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #0c6759;">
                                                    <span style="color: #e05638;">guri</span>24
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </a>
                            </div>

                            <!-- Centered Welcome Headline -->
                            <h1 class="email-headline" style="margin: 12px 0 24px; color: #1e293b; font-size: 25px; font-weight: 700; letter-spacing: -0.4px; line-height: 1.25;">
                                {headline}
                            </h1>

                            <!-- Hero Illustration -->
                            <div style="text-align: center; margin: 0 auto 28px; max-width: 320px;">
                                {illustration_svg}
                            </div>

                            <!-- Inset Bordered Content Box -->
                            <div class="email-inset-box" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px 26px; text-align: left; margin-bottom: 32px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                                {inset_content}
                            </div>

                            <!-- Have Questions? Section -->
                            <div style="text-align: center; margin: 8px 0 28px;">
                                <h3 style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #1e293b; letter-spacing: -0.2px;">
                                    Have questions?
                                </h3>
                                <p style="margin: 0 0 6px; font-size: 14px; line-height: 1.5;">
                                    <a href="{website_url}/login" style="color: #0c6759; font-weight: 600; text-decoration: underline;">
                                        Sign in to Guri24
                                    </a>
                                    &nbsp;&bull;&nbsp;
                                    <a href="mailto:{self.support_email}" style="color: #0c6759; font-weight: 600; text-decoration: underline;">
                                        Contact Support
                                    </a>
                                </p>
                                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                                    Our customer support team is standing by and ready to help.
                                </p>
                            </div>

                            <!-- Footer Section -->
                            <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                                <p style="margin: 0 0 4px; font-weight: 700; color: #475569; font-size: 13px;">
                                    {self.company_name}
                                </p>
                                <p style="margin: 0 0 4px; color: #64748b;">
                                    {self.company_address}
                                </p>
                                <p style="margin: 0 0 12px;">
                                    <a href="{website_url}" target="_blank" style="color: #0c6759; text-decoration: underline; font-weight: 600;">
                                        guri24.com
                                    </a>
                                </p>

                                <!-- Social links -->
                                {self._get_social_icons_html()}

                                {unsub_link}

                                <p style="margin: 16px 0 0; font-size: 11px; color: #94a3b8;">
                                    This email was sent to {to_email}. If you did not create an account or request this, please disregard.
                                </p>
                            </div>

                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        """

    def _get_celebration_illustration(self) -> str:
        """Returns inline SVG illustration resembling Gusto's festive banner & team celebration"""
        return """
        <svg width="280" height="150" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
            <!-- Ground baseline -->
            <line x1="20" y1="140" x2="260" y2="140" stroke="#E2E8F0" stroke-width="2" stroke-linecap="round"/>
            
            <!-- Festive pennant banner string -->
            <path d="M 30 40 Q 140 75 250 40" stroke="#CBD5E1" stroke-width="2" fill="none" stroke-dasharray="3 3"/>
            
            <!-- Pennant flags -->
            <polygon points="50,44 65,47 57,68" fill="#E05638" />
            <polygon points="85,52 100,55 92,76" fill="#0C6759" />
            <polygon points="120,57 135,58 127,79" fill="#F59E0B" />
            <polygon points="155,57 170,55 162,78" fill="#0C6759" />
            <polygon points="190,52 205,48 198,72" fill="#E05638" />
            <polygon points="225,44 240,40 233,63" fill="#F59E0B" />
            
            <!-- House / Real Estate Icon in Gusto editorial line-art style -->
            <g transform="translate(105, 70)">
                <!-- House base -->
                <rect x="15" y="25" width="40" height="42" rx="4" fill="#F8FAFC" stroke="#0C6759" stroke-width="2.5"/>
                <!-- Roof -->
                <polygon points="35,5 10,25 60,25" fill="#0C6759" stroke="#0C6759" stroke-width="2"/>
                <!-- Chimney -->
                <rect x="44" y="10" width="8" height="12" fill="#E05638"/>
                <!-- Door with keyhole -->
                <rect x="29" y="43" width="12" height="24" rx="2" fill="#0C6759"/>
                <circle cx="37" cy="55" r="1.5" fill="#FFFFFF"/>
                <!-- Window -->
                <rect x="21" y="29" width="10" height="10" rx="1.5" fill="#F59E0B"/>
                <rect x="39" y="29" width="10" height="10" rx="1.5" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
            </g>

            <!-- Friendly celebratory character on the left -->
            <g transform="translate(45, 75)">
                <!-- Body -->
                <circle cx="20" cy="18" r="8" fill="#FCD34D" stroke="#1E293B" stroke-width="2"/>
                <path d="M 12 30 C 12 25, 28 25, 28 30 L 30 50 L 10 50 Z" fill="#0C6759"/>
                <line x1="15" y1="50" x2="15" y2="65" stroke="#1E293B" stroke-width="2"/>
                <line x1="25" y1="50" x2="25" y2="65" stroke="#1E293B" stroke-width="2"/>
                <!-- Arm waving -->
                <path d="M 28 33 Q 38 20 40 12" stroke="#1E293B" stroke-width="2" stroke-linecap="round" fill="none"/>
            </g>

            <!-- Friendly celebratory character on the right -->
            <g transform="translate(195, 72)">
                <!-- Body -->
                <circle cx="20" cy="18" r="8" fill="#FED7AA" stroke="#1E293B" stroke-width="2"/>
                <path d="M 12 30 C 12 25, 28 25, 28 30 L 30 52 L 10 52 Z" fill="#E05638"/>
                <line x1="15" y1="52" x2="15" y2="68" stroke="#1E293B" stroke-width="2"/>
                <line x1="25" y1="52" x2="25" y2="68" stroke="#1E293B" stroke-width="2"/>
                <!-- Arm holding banner -->
                <path d="M 12 33 Q 2 20 0 10" stroke="#1E293B" stroke-width="2" stroke-linecap="round" fill="none"/>
            </g>

            <!-- Sparkles / Confetti -->
            <circle cx="80" cy="30" r="2.5" fill="#F59E0B"/>
            <circle cx="190" cy="28" r="2.5" fill="#E05638"/>
            <circle cx="140" cy="20" r="3" fill="#0C6759"/>
            <rect x="235" y="85" width="4" height="4" fill="#0C6759" transform="rotate(45 235 85)"/>
            <rect x="35" y="85" width="4" height="4" fill="#F59E0B" transform="rotate(25 35 85)"/>
        </svg>
        """

    def _get_security_illustration(self) -> str:
        """Returns security/key SVG illustration for password reset"""
        return """
        <svg width="220" height="120" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
            <circle cx="110" cy="60" r="45" fill="#F0FDF4"/>
            <circle cx="110" cy="60" r="36" fill="#DCFCE7"/>
            <!-- Key / Shield -->
            <path d="M 110 32 C 95 32, 90 40, 90 55 C 90 75, 110 88, 110 88 C 110 88, 130 75, 130 55 C 130 40, 125 32, 110 32 Z" fill="#0C6759"/>
            <!-- Keyhole -->
            <circle cx="110" cy="54" r="5" fill="#FFFFFF"/>
            <polygon points="107,56 113,56 112,68 108,68" fill="#FFFFFF"/>
            <!-- Sparkles -->
            <circle cx="70" cy="40" r="3" fill="#F59E0B"/>
            <circle cx="150" cy="75" r="3" fill="#E05638"/>
        </svg>
        """

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        preheader: str = "",
        unsubscribe_url: str = None,
    ):
        """Send an email via Resend with graceful fallbacks"""
        if not settings.EMAILS_ENABLED:
            logger.info(f"[EMAIL DISABLED] Would send to: {to_email} | Subject: {subject}")
            return {"status": "skipped", "reason": "EMAILS_ENABLED is False"}

        if not settings.RESEND_API_KEY:
            logger.warning(
                f"[NO RESEND_API_KEY] Skipping email to {to_email}. Subject: '{subject}'"
            )
            return {"status": "skipped", "reason": "RESEND_API_KEY is not configured"}

        # Refresh API key
        resend.api_key = settings.RESEND_API_KEY

        unsub = unsubscribe_url or f"{settings.FRONTEND_URL}/unsubscribe?email={to_email}"
        headers = {
            "List-Unsubscribe": f"<mailto:{self.support_email}?subject=unsubscribe>, <{unsub}>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            "Precedence": "bulk",
            "X-Mailer": f"{self.company_name} Platform",
        }

        params = {
            "from": f"{self.from_name} <{self.from_email}>",
            "to": [to_email],
            "subject": subject,
            "html": html_content,
            "text": self._strip_html(html_content),
            "reply_to": self.support_email,
            "headers": headers,
        }

        logger.info(f"Sending email via Resend to {to_email} | subject: {subject} | from: {params['from']}")

        try:
            r = await asyncio.to_thread(resend.Emails.send, params)
            logger.info(f"Resend email sent successfully to {to_email}. Response: {r}")
            return r
        except Exception as e:
            logger.error(f"Resend error sending to {to_email}: {type(e).__name__}: {e}")
            raise

    async def send_verification_email(self, user: User, verification_code: str):
        """Send verification code & 1-click verification link in Gusto style"""
        preheader = f"Your Guri24 verification code is {verification_code}"
        website_url = settings.FRONTEND_URL.rstrip('/')
        verify_url = f"{website_url}/verify-email?token={verification_code}&email={user.email}"

        inset_content = f"""
        <p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.6;">
            Congratulations on joining <strong>{self.company_name}</strong>! Your account has been registered.
        </p>
        
        <p style="margin: 0 0 20px; color: #475569; font-size: 15px; line-height: 1.6;">
            So what's next? Before you start browsing, saving, or listing properties, be sure to confirm your email address using the 6-digit verification code below:
        </p>

        <!-- 6-digit Verification Box -->
        <div style="text-align: center; margin: 24px 0;">
            <div style="background-color: #f0fdf4; border: 2px dashed #0c6759; border-radius: 12px; padding: 18px 24px; display: inline-block;">
                <div style="font-size: 11px; font-weight: 700; color: #0c6759; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                    Verification Code
                </div>
                <div style="color: #0c6759; font-size: 34px; font-weight: 800; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">
                    {verification_code}
                </div>
            </div>
        </div>

        <p style="margin: 20px 0 24px; color: #64748b; font-size: 13.5px; line-height: 1.6; text-align: center;">
            This code will expire in <strong>24 hours</strong>. You can enter the code on the verification screen, or click the button below to verify instantly:
        </p>

        <!-- Primary CTA Button -->
        <div style="text-align: center; margin: 24px 0 10px;">
            <a href="{verify_url}" 
               target="_blank"
               style="background-color: #0c6759; 
                      color: #ffffff; 
                      padding: 15px 36px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 700;
                      font-size: 15px;
                      letter-spacing: -0.2px;">
                Verify My Email Address
            </a>
        </div>
        """

        html_content = self._create_gusto_template(
            headline="Welcome to the team!",
            illustration_svg=self._get_celebration_illustration(),
            inset_content=inset_content,
            preheader=preheader,
            to_email=user.email,
            unsubscribe_url=f"{website_url}/unsubscribe?email={user.email}"
        )

        await self.send_email(
            to_email=user.email,
            subject=f"Confirm your email - Welcome to {self.company_name}!",
            html_content=html_content,
            preheader=preheader,
        )

    async def send_welcome_email(self, user: User):
        """Send celebratory welcome email after account is verified"""
        preheader = f"Your {self.company_name} account is now active"
        website_url = settings.FRONTEND_URL.rstrip('/')
        explore_url = f"{website_url}/properties"

        inset_content = f"""
        <p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.6;">
            Hi <strong>{user.name}</strong>,
        </p>
        <p style="margin: 0 0 20px; color: #475569; font-size: 15px; line-height: 1.6;">
            Your email has been verified successfully! Your account with <strong>{self.company_name}</strong> is fully active and ready to go.
        </p>

        <div style="background-color: #f8fafc; border-radius: 10px; padding: 18px 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h4 style="margin: 0 0 10px; color: #1e293b; font-size: 14px; font-weight: 700;">
                What you can do now:
            </h4>
            <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.7;">
                <li>Search thousands of verified properties in Nairobi and across Kenya</li>
                <li>Save your favorite homes and setup price alerts</li>
                <li>Connect directly with licensed, background-checked agents</li>
                <li>Schedule seamless in-person and virtual viewings</li>
            </ul>
        </div>

        <!-- Primary CTA Button -->
        <div style="text-align: center; margin: 26px 0 10px;">
            <a href="{explore_url}" 
               target="_blank"
               style="background-color: #0c6759; 
                      color: #ffffff; 
                      padding: 15px 36px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 700;
                      font-size: 15px;">
                Start Browsing Properties
            </a>
        </div>
        """

        html_content = self._create_gusto_template(
            headline="You're all set!",
            illustration_svg=self._get_celebration_illustration(),
            inset_content=inset_content,
            preheader=preheader,
            to_email=user.email,
            unsubscribe_url=f"{website_url}/unsubscribe?email={user.email}"
        )

        await self.send_email(
            to_email=user.email,
            subject=f"Welcome to {self.company_name}! Your account is active 🎉",
            html_content=html_content,
            preheader=preheader,
        )

    async def send_password_reset_email(self, user: User, reset_url: str):
        """Send password reset email in Gusto style"""
        preheader = f"Reset your password for {self.company_name}"
        website_url = settings.FRONTEND_URL.rstrip('/')

        inset_content = f"""
        <p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.6;">
            Hi <strong>{user.name}</strong>,
        </p>
        <p style="margin: 0 0 20px; color: #475569; font-size: 15px; line-height: 1.6;">
            We received a request to reset your password for your <strong>{self.company_name}</strong> account. Click the secure link below to create a new password:
        </p>

        <!-- Primary CTA Button -->
        <div style="text-align: center; margin: 28px 0 20px;">
            <a href="{reset_url}" 
               target="_blank"
               style="background-color: #0c6759; 
                      color: #ffffff; 
                      padding: 15px 36px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 700;
                      font-size: 15px;">
                Reset My Password
            </a>
        </div>

        <p style="margin: 20px 0 10px; color: #64748b; font-size: 13px; line-height: 1.5; text-align: center;">
            This password reset link will expire in <strong>1 hour</strong>.
        </p>
        <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5; text-align: center; word-break: break-all;">
            If the button doesn't work, copy this link into your browser:<br/>
            <a href="{reset_url}" style="color: #0c6759; text-decoration: underline;">{reset_url}</a>
        </p>

        <div style="margin-top: 24px; padding: 14px 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px;">
            <p style="margin: 0; color: #991b1b; font-size: 13px; line-height: 1.5;">
                <strong>Security Alert:</strong> If you did not request this password reset, please ignore this email or contact support immediately if you suspect unauthorized activity.
            </p>
        </div>
        """

        html_content = self._create_gusto_template(
            headline="Reset your password",
            illustration_svg=self._get_security_illustration(),
            inset_content=inset_content,
            preheader=preheader,
            to_email=user.email,
            unsubscribe_url=f"{website_url}/unsubscribe?email={user.email}"
        )

        await self.send_email(
            to_email=user.email,
            subject=f"Reset your {self.company_name} password",
            html_content=html_content,
            preheader=preheader,
        )

    async def send_booking_notification(self, agent_email: str, booking_details: dict):
        """Notify agent of a new viewing or booking request"""
        property_title = booking_details.get('property_title', 'Property Listing')
        preheader = f"New booking request for {property_title}"
        website_url = settings.FRONTEND_URL.rstrip('/')

        inset_content = f"""
        <p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.6;">
            You have received a new booking request for <strong>{property_title}</strong>.
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin: 20px 0;">
            <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
                <tr>
                    <td style="color: #64748b; font-weight: 600;">Guest Name:</td>
                    <td style="color: #1e293b; font-weight: 700; text-align: right;">{booking_details.get('guest_name', 'Guest')}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: 600;">Check-in / Viewing:</td>
                    <td style="color: #1e293b; text-align: right;">{booking_details.get('check_in', 'TBD')}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: 600;">Check-out:</td>
                    <td style="color: #1e293b; text-align: right;">{booking_details.get('check_out', 'TBD')}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: 600;">Party Size:</td>
                    <td style="color: #1e293b; text-align: right;">{booking_details.get('guest_count', 1)} guest(s)</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0; padding-top: 10px;">Total Price:</td>
                    <td style="color: #0c6759; font-weight: 800; font-size: 16px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: right;">{booking_details.get('total_price', 'KES 0')}</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin: 26px 0 10px;">
            <a href="{website_url}/agent/bookings" 
               target="_blank"
               style="background-color: #0c6759; 
                      color: #ffffff; 
                      padding: 15px 36px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 700;
                      font-size: 15px;">
                View Booking Details
            </a>
        </div>
        """

        html_content = self._create_gusto_template(
            headline="New Booking Request!",
            illustration_svg=self._get_celebration_illustration(),
            inset_content=inset_content,
            preheader=preheader,
            to_email=agent_email,
            unsubscribe_url=f"{website_url}/unsubscribe?email={agent_email}"
        )

        await self.send_email(
            to_email=agent_email,
            subject=f"New Booking Request: {property_title}",
            html_content=html_content,
            preheader=preheader,
        )

    async def send_booking_confirmation(self, guest_email: str, booking_details: dict):
        """Send booking confirmation to guest in Gusto style"""
        property_title = booking_details.get('property_title', 'Property Listing')
        preheader = f"Your booking for {property_title} is confirmed"
        website_url = settings.FRONTEND_URL.rstrip('/')

        inset_content = f"""
        <p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.6;">
            Great news! Your booking for <strong>{property_title}</strong> has been confirmed.
        </p>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px 20px; margin: 20px 0;">
            <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
                <tr>
                    <td style="color: #166534; font-weight: 600;">Check-in:</td>
                    <td style="color: #1e293b; font-weight: 700; text-align: right;">{booking_details.get('check_in', 'TBD')}</td>
                </tr>
                <tr>
                    <td style="color: #166534; font-weight: 600;">Check-out:</td>
                    <td style="color: #1e293b; text-align: right;">{booking_details.get('check_out', 'TBD')}</td>
                </tr>
                <tr>
                    <td style="color: #166534; font-weight: 600;">Guests:</td>
                    <td style="color: #1e293b; text-align: right;">{booking_details.get('guest_count', 1)}</td>
                </tr>
                <tr>
                    <td style="color: #166534; font-weight: 600; border-top: 1px solid #bbf7d0; padding-top: 10px;">Total Paid:</td>
                    <td style="color: #0c6759; font-weight: 800; font-size: 16px; border-top: 1px solid #bbf7d0; padding-top: 10px; text-align: right;">{booking_details.get('total_price', 'KES 0')}</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin: 26px 0 10px;">
            <a href="{website_url}/my-bookings" 
               target="_blank"
               style="background-color: #0c6759; 
                      color: #ffffff; 
                      padding: 15px 36px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 700;
                      font-size: 15px;">
                View My Reservation
            </a>
        </div>
        """

        html_content = self._create_gusto_template(
            headline="Booking Confirmed!",
            illustration_svg=self._get_celebration_illustration(),
            inset_content=inset_content,
            preheader=preheader,
            to_email=guest_email,
            unsubscribe_url=f"{website_url}/unsubscribe?email={guest_email}"
        )

        await self.send_email(
            to_email=guest_email,
            subject=f"Confirmed: Your reservation for {property_title}",
            html_content=html_content,
            preheader=preheader,
        )

    async def send_agent_application_confirmation(self, user: User, application_details: dict):
        """Send confirmation email with full copy of submitted agent application"""
        sr_number = application_details.get("sr_number", "SR-2026-0001")
        submitted_date = application_details.get("submitted_date", "Today")
        name = application_details.get("name", user.name)
        national_id = application_details.get("national_id_number", "Provided")
        dob = application_details.get("date_of_birth", "Provided")
        gender = application_details.get("gender", "Not specified")
        phone = application_details.get("phone", user.phone or "Provided")
        address = application_details.get("full_address", "Provided")
        motivation = application_details.get("motivation", "Standard application")

        preheader = f"Application Ref: {sr_number} has been received"
        website_url = settings.FRONTEND_URL.rstrip('/')

        inset_content = f"""
        <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; margin-bottom: 18px; display: inline-block;">
            <span style="color: #92400e; font-size: 12px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                ● Status: Submitted &amp; Under Review
            </span>
        </div>

        <p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.6;">
            Hi <strong>{name}</strong>,
        </p>
        <p style="margin: 0 0 20px; color: #475569; font-size: 14.5px; line-height: 1.6;">
            Your agent verification request has been submitted successfully. Below is a complete copy of the information you provided:
        </p>

        <!-- Official Application Copy Table -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin: 18px 0;">
            <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13.5px;">
                <tr>
                    <td style="color: #64748b; font-weight: 600; width: 40%;">Reference (SR) Number:</td>
                    <td style="color: #0c6759; font-weight: 800; font-family: monospace; font-size: 15px;">{sr_number}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: 600;">Service Request:</td>
                    <td style="color: #1e293b; font-weight: 700;">Agent Verification Application</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: 600;">Submitted Date:</td>
                    <td style="color: #1e293b;">{submitted_date}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: 600; border-top: 1px solid #f1f5f9; padding-top: 8px;">Applicant Name:</td>
                    <td style="color: #1e293b; font-weight: 600; border-top: 1px solid #f1f5f9; padding-top: 8px;">{name}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: 600;">National ID / Passport:</td>
                    <td style="color: #1e293b; font-family: monospace;">{national_id}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: 600;">Date of Birth:</td>
                    <td style="color: #1e293b;">{dob}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: 600;">Gender:</td>
                    <td style="color: #1e293b;">{gender}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: 600;">Contact Phone:</td>
                    <td style="color: #1e293b;">{phone}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: 600;">Email:</td>
                    <td style="color: #1e293b;">{user.email}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: 600;">Address / Area:</td>
                    <td style="color: #1e293b;">{address}</td>
                </tr>
            </table>
        </div>

        <p style="margin: 18px 0 22px; color: #64748b; font-size: 13.5px; line-height: 1.6;">
            We are currently reviewing your request, and it typically takes up to <strong>2 business days</strong> to process (subject to verification of required documents).
        </p>

        <!-- Primary CTA Button -->
        <div style="text-align: center; margin: 24px 0 10px;">
            <a href="{website_url}/profile" 
               target="_blank"
               style="background-color: #0c6759; 
                      color: #ffffff; 
                      padding: 15px 36px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 700;
                      font-size: 15px;">
                View Application Details
            </a>
        </div>
        """

        html_content = self._create_gusto_template(
            headline="Success! Request Submitted",
            illustration_svg=self._get_celebration_illustration(),
            inset_content=inset_content,
            preheader=preheader,
            to_email=user.email,
            unsubscribe_url=f"{website_url}/unsubscribe?email={user.email}"
        )

        await self.send_email(
            to_email=user.email,
            subject=f"Application Received: Ref #{sr_number} - {self.company_name}",
            html_content=html_content,
            preheader=preheader,
        )

        # Notify admin as well
        try:
            admin_email = settings.ADMIN_EMAIL or settings.SUPPORT_EMAIL
            if admin_email and admin_email != user.email:
                await self.send_email(
                    to_email=admin_email,
                    subject=f"New Agent Application: {name} (Ref #{sr_number})",
                    html_content=html_content,
                    preheader=f"New agent application from {name}"
                )
        except Exception as e:
            logger.warning(f"Could not notify admin of application: {e}")

# Singleton instance
email_service = EmailService()
