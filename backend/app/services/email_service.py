import re
import logging
import asyncio
from pathlib import Path
from app.config import settings
from app.models.user import User
import resend

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # Configure Resend with API Key
        resend.api_key = settings.RESEND_API_KEY
        
        # Email configuration
        self.from_email = settings.EMAIL_FROM
        self.from_name = settings.EMAIL_FROM_NAME
        self.support_email = settings.SUPPORT_EMAIL
        self.company_name = settings.COMPANY_NAME
        self.company_address = settings.COMPANY_ADDRESS
        self.company_phone = settings.COMPANY_PHONE
        
        # Setup Jinja2 for email templates
        template_dir = Path(__file__).parent.parent / "templates" / "emails"
        template_dir.mkdir(parents=True, exist_ok=True)
        
        self.template_env = Environment(
            loader=FileSystemLoader(str(template_dir)),
            autoescape=select_autoescape(['html', 'xml'])
        )
    
    def _strip_html(self, html: str) -> str:
        """Remove HTML tags for plain text version"""
        return re.sub('<[^<]+?>', '', html)
    
    def _get_email_footer(self, unsubscribe_url: str = None) -> str:
        """Generate standard email footer with company info and unsubscribe link"""
        unsubscribe_link = ""
        if unsubscribe_url:
            unsubscribe_link = f'<p style="margin: 10px 0;"><a href="{unsubscribe_url}" style="color: #6b7280; text-decoration: underline;">Unsubscribe from these emails</a></p>'
        
        return f"""
        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0" style="color: #6b7280; font-size: 12px;">
                <tr>
                    <td style="text-align: center; padding: 10px 0;">
                        <p style="margin: 5px 0; font-weight: 600; color: #1f2937;">{self.company_name}</p>
                        <p style="margin: 5px 0;">{self.company_address}</p>
                        <p style="margin: 5px 0;">{self.company_phone}</p>
                        <p style="margin: 10px 0;">
                            <a href="{settings.FRONTEND_URL}" style="color: #1a5f9e; text-decoration: none; margin: 0 10px;">Visit Website</a> |
                            <a href="mailto:{self.support_email}" style="color: #1a5f9e; text-decoration: none; margin: 0 10px;">Contact Support</a>
                        </p>
                        {unsubscribe_link}
                        <p style="margin: 15px 0 5px 0; color: #9ca3af; font-size: 11px;">
                            This email was sent to you because you have an account with {self.company_name}.
                        </p>
                    </td>
                </tr>
            </table>
        </div>
        """
    
    def _create_email_template(self, preheader: str, content: str, unsubscribe_url: str = None) -> str:
        """Create a professional email template with proper structure"""
        return f"""
        <!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="x-apple-disable-message-reformatting">
            <title>{self.company_name}</title>
            <!--[if mso]>
            <style type="text/css">
                body, table, td {{font-family: Arial, Helvetica, sans-serif !important;}}
            </style>
            <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <!-- Preheader text -->
            <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
                {preheader}
            </div>
            
            <!-- Email container -->
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <!-- Main content table -->
                        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #1a5f9e 0%, #0d3b6e 100%); border-radius: 12px 12px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                        {self.company_name}
                                    </h1>
                                    <p style="margin: 6px 0 0; color: rgba(255,255,255,0.75); font-size: 13px; font-weight: 500;">
                                        Kenya's Premier Real Estate Platform
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    {content}
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 0 40px 40px;">
                                    {self._get_email_footer(unsubscribe_url)}
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Email client text -->
                        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
                            If you're having trouble viewing this email, please contact <a href="mailto:{self.support_email}" style="color: #1a5f9e;">{self.support_email}</a>
                        </p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        preheader: str = "",
        unsubscribe_url: str = None,
    ):
        """Send an email using Resend"""
        if not settings.EMAILS_ENABLED:
            logger.info(f"Email sending disabled. Would send to {to_email}: {subject}")
            return

        # Always refresh the API key in case it was updated after startup
        resend.api_key = settings.RESEND_API_KEY

        # Build List-Unsubscribe headers — Gmail/Outlook require these to avoid spam
        unsub = unsubscribe_url or f"{settings.FRONTEND_URL}/unsubscribe?email={to_email}"
        headers = {
            "List-Unsubscribe": f"<mailto:{self.support_email}?subject=unsubscribe>, <{unsub}>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            "Precedence": "bulk",
            "X-Mailer": f"{self.company_name} Mailer 1.0",
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

        logger.info(f"Sending email to {to_email} | subject: {subject} | from: {params['from']}")

        try:
            # resend SDK is synchronous — run in thread pool to avoid blocking the event loop
            r = await asyncio.to_thread(resend.Emails.send, params)
            logger.info(f"Email sent OK to {to_email}. Resend ID: {r.get('id')}")
            return r
        except Exception as e:
            logger.error(f"Resend error sending to {to_email}: {type(e).__name__}: {e}")
            raise
    
    async def send_verification_email(self, user: User, verification_code: str):
        """Send email verification code"""
        preheader = f"Your verification code is {verification_code}"
        
        content = f"""
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
            Welcome to {self.company_name}!
        </h2>
        <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hi {user.name},
        </p>
        <p style="margin: 0 0 25px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Thank you for registering with {self.company_name}. To complete your registration and verify your email address, please use the verification code below:
        </p>
        <div style="text-align: center; margin: 35px 0;">
            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
                        border: 2px solid #1a5f9e; 
                        border-radius: 12px; 
                        padding: 20px 30px; 
                        display: inline-block;">
                <span style="color: #1f2937; 
                            font-size: 32px; 
                            font-weight: 700; 
                            letter-spacing: 8px; 
                            font-family: 'Courier New', monospace;">
                    {verification_code}
                </span>
            </div>
        </div>
        <p style="margin: 25px 0 15px; color: #6b7280; font-size: 14px; line-height: 1.6;">
            This code will expire in <strong>24 hours</strong>. If you didn't create an account with {self.company_name}, you can safely ignore this email.
        </p>
        <div style="margin-top: 30px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Security Tip:</strong> Never share this code with anyone. {self.company_name} will never ask for your verification code.
            </p>
        </div>
        """
        
        unsubscribe_url = f"{settings.FRONTEND_URL}/unsubscribe?email={user.email}"
        html_content = self._create_email_template(preheader, content, unsubscribe_url)

        await self.send_email(
            to_email=user.email,
            subject=f"Verify your {self.company_name} account",
            html_content=html_content,
            preheader=preheader,
            unsubscribe_url=unsubscribe_url,
        )
    
    async def send_password_reset_email(self, user: User, reset_url: str):
        """Send password reset link"""
        preheader = "Reset your password securely"
        
        content = f"""
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
            Password Reset Request
        </h2>
        <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hi {user.name},
        </p>
        <p style="margin: 0 0 25px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password for your {self.company_name} account. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 35px 0;">
            <a href="{reset_url}" 
               style="background: linear-gradient(135deg, #1a5f9e 0%, #155286 100%); 
                      color: #ffffff; 
                      padding: 16px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 600;
                      font-size: 16px;
                      box-shadow: 0 4px 6px rgba(26, 95, 158, 0.3);">
                Reset My Password
            </a>
        </div>
        <p style="margin: 25px 0 15px; color: #6b7280; font-size: 14px; line-height: 1.6;">
            This link will expire in <strong>1 hour</strong> for security reasons.
        </p>
        <p style="margin: 15px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="margin: 10px 0; padding: 12px; background-color: #f9fafb; border-radius: 6px; word-break: break-all; font-size: 13px; color: #1a5f9e;">
            {reset_url}
        </p>
        <div style="margin-top: 30px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
                <strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
            </p>
        </div>
        """
        
        unsubscribe_url = f"{settings.FRONTEND_URL}/unsubscribe?email={user.email}"
        html_content = self._create_email_template(preheader, content, unsubscribe_url)

        await self.send_email(
            to_email=user.email,
            subject=f"Reset your {self.company_name} password",
            html_content=html_content,
            preheader=preheader,
            unsubscribe_url=unsubscribe_url,
        )
    
    async def send_welcome_email(self, user: User):
        """Send welcome email after verification"""
        preheader = f"Welcome to {self.company_name} - Start exploring properties"
        
        content = f"""
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
            Welcome to {self.company_name}! 🎉
        </h2>
        <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hi {user.name},
        </p>
        <p style="margin: 0 0 25px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your email has been verified successfully! You're now ready to explore our platform and discover amazing properties.
        </p>
        <div style="text-align: center; margin: 35px 0;">
            <a href="{settings.FRONTEND_URL}" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                      color: #ffffff; 
                      padding: 16px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 600;
                      font-size: 16px;
                      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                Start Browsing Properties
            </a>
        </div>
        <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px; font-weight: 600;">
                What's Next?
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                <li>Browse thousands of properties</li>
                <li>Save your favorite listings</li>
                <li>Contact property agents directly</li>
                <li>Book property viewings</li>
            </ul>
        </div>
        <p style="margin: 25px 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            If you have any questions, our support team is here to help at <a href="mailto:{self.support_email}" style="color: #1a5f9e; text-decoration: none;">{self.support_email}</a>
        </p>
        """
        
        unsubscribe_url = f"{settings.FRONTEND_URL}/unsubscribe?email={user.email}"
        html_content = self._create_email_template(preheader, content, unsubscribe_url)

        await self.send_email(
            to_email=user.email,
            subject=f"Welcome to {self.company_name}! 🏡",
            html_content=html_content,
            preheader=preheader,
            unsubscribe_url=unsubscribe_url,
        )

    async def send_booking_notification(self, agent_email: str, booking_details: dict):
        """Notify agent of a new booking"""
        preheader = f"New booking for {booking_details['property_title']}"
        
        content = f"""
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
            New Booking Request! 📅
        </h2>
        <p style="margin: 0 0 25px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            You have received a new booking request for <strong>{booking_details['property_title']}</strong>.
        </p>
        
        <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); 
                    padding: 25px; 
                    border-radius: 12px; 
                    margin: 25px 0;
                    border: 1px solid #e5e7eb;">
            <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 15px;">
                <tr>
                    <td style="color: #6b7280; padding: 8px 0;"><strong>Guest:</strong></td>
                    <td style="color: #1f2937; padding: 8px 0;">{booking_details['guest_name']}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; padding: 8px 0;"><strong>Check-in:</strong></td>
                    <td style="color: #1f2937; padding: 8px 0;">{booking_details['check_in']}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; padding: 8px 0;"><strong>Check-out:</strong></td>
                    <td style="color: #1f2937; padding: 8px 0;">{booking_details['check_out']}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; padding: 8px 0;"><strong>Guests:</strong></td>
                    <td style="color: #1f2937; padding: 8px 0;">{booking_details['guest_count']}</td>
                </tr>
                <tr>
                    <td style="color: #6b7280; padding: 8px 0;"><strong>Total Price:</strong></td>
                    <td style="color: #10b981; font-weight: 600; font-size: 18px; padding: 8px 0;">{booking_details['total_price']}</td>
                </tr>
            </table>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
            <a href="{settings.FRONTEND_URL}/agent/bookings" 
               style="background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                      color: #ffffff; 
                      padding: 16px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 600;
                      font-size: 16px;
                      box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);">
                View Booking Details
            </a>
        </div>
        """
        
        unsubscribe_url = f"{settings.FRONTEND_URL}/unsubscribe?email={agent_email}"
        html_content = self._create_email_template(preheader, content, unsubscribe_url)

        await self.send_email(
            to_email=agent_email,
            subject=f"New Booking: {booking_details['property_title']}",
            html_content=html_content,
            preheader=preheader,
            unsubscribe_url=unsubscribe_url,
        )

    async def send_booking_confirmation(self, guest_email: str, booking_details: dict):
        """Send booking confirmation to guest"""
        preheader = f"Your booking for {booking_details['property_title']} is confirmed"
        
        content = f"""
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
            Booking Confirmed! ✅
        </h2>
        <p style="margin: 0 0 25px; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Great news! Your booking for <strong>{booking_details['property_title']}</strong> has been confirmed.
        </p>
        
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); 
                    padding: 25px; 
                    border-radius: 12px; 
                    margin: 25px 0;
                    border: 1px solid #93c5fd;">
            <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 15px;">
                <tr>
                    <td style="color: #1e40af; padding: 8px 0;"><strong>Check-in:</strong></td>
                    <td style="color: #1f2937; padding: 8px 0;">{booking_details['check_in']}</td>
                </tr>
                <tr>
                    <td style="color: #1e40af; padding: 8px 0;"><strong>Check-out:</strong></td>
                    <td style="color: #1f2937; padding: 8px 0;">{booking_details['check_out']}</td>
                </tr>
                <tr>
                    <td style="color: #1e40af; padding: 8px 0;"><strong>Guests:</strong></td>
                    <td style="color: #1f2937; padding: 8px 0;">{booking_details['guest_count']}</td>
                </tr>
                <tr>
                    <td style="color: #1e40af; padding: 8px 0;"><strong>Total Price:</strong></td>
                    <td style="color: #10b981; font-weight: 600; font-size: 18px; padding: 8px 0;">{booking_details['total_price']}</td>
                </tr>
            </table>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
            <a href="{settings.FRONTEND_URL}/my-bookings" 
               style="background: linear-gradient(135deg, #1a5f9e 0%, #155286 100%); 
                      color: #ffffff; 
                      padding: 16px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 600;
                      font-size: 16px;
                      box-shadow: 0 4px 6px rgba(26, 95, 158, 0.3);">
                View My Bookings
            </a>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Important:</strong> Please arrive at the property at your scheduled check-in time. Contact the property agent if you need to make any changes.
            </p>
        </div>
        """
        
        unsubscribe_url = f"{settings.FRONTEND_URL}/unsubscribe?email={guest_email}"
        html_content = self._create_email_template(preheader, content, unsubscribe_url)

        await self.send_email(
            to_email=guest_email,
            subject=f"Booking Confirmation - {booking_details['property_title']}",
            html_content=html_content,
            preheader=preheader,
            unsubscribe_url=unsubscribe_url,
        )

# Create singleton instance
email_service = EmailService()
