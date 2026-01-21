from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User, UserRole, AgentStatus
from app.schemas.user import (
    UserRegister, UserLogin, UserResponse, TokenResponse,
    EmailVerification, PasswordResetRequest, PasswordReset,
    MessageResponse
)
from app.core.security import (
    get_password_hash, verify_password,
    create_access_token, create_refresh_token,
    generate_verification_token, generate_reset_token
)
from app.services.email_service import email_service
from app.config import settings
from app.utils.activity import log_activity

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user and send verification email"""
    
    # Check if user already exists
    stmt = select(User).where(User.email == user_data.email)
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    verification_token = generate_verification_token()
    
    # Handle agent role and status
    # On signup, we default to USER role, but set agent_status to PENDING if they requested it.
    # This allows admins to verify them before they get the full AGENT role.
    print(f"DEBUG: Processing registration for {user_data.email}")
    
    # Safely get requested_role to avoid AttributeError
    # getattr is safer if for some reason Pydantic didn't include it in the object attributes
    requested_role_val = getattr(user_data, 'requested_role', UserRole.USER)
    print(f"DEBUG: requested_role value: {requested_role_val}")
    
    initial_role = UserRole.USER
    agent_status = None
    
    if requested_role_val == UserRole.AGENT:
        print("DEBUG: Setting agent_status to PENDING")
        agent_status = AgentStatus.PENDING
    
    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        name=user_data.name,
        phone=user_data.phone,
        role=initial_role,
        agent_status=agent_status,
        verification_token=verification_token,
        verification_token_expires=datetime.utcnow() + timedelta(hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS)
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    print(f"DEBUG: User {new_user.email} created with role {new_user.role} and agent_status {new_user.agent_status}")
    
    # Log Activity
    await log_activity(
        db=db,
        user_id=new_user.id,
        activity_type="user_registered",
        description=f"New user {new_user.name} ({new_user.email}) registered as {new_user.role.value}",
        metadata={"email": new_user.email, "role": new_user.role.value}
    )
    
    # Send verification email
    try:
        await email_service.send_verification_email(new_user, verification_token)
    except Exception as e:
        # Log error but don't fail registration
        print(f"Failed to send verification email: {e}")
        # FALLBACK: Auto-verify if email service fails (for dev/demo)
        new_user.email_verified = True
        new_user.verification_token = None
        new_user.verification_token_expires = None
        db.add(new_user)
        await db.commit()
    
    return {"message": "Registration successful. User auto-verified due to email service error (Dev Mode)."}

@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    verification: EmailVerification,
    db: AsyncSession = Depends(get_db)
):
    """Verify user email with token"""
    
    stmt = select(User).where(User.verification_token == verification.token)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    if user.email_verified:
        return {"message": "Email already verified"}
    
    if user.verification_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token expired. Please request a new one."
        )
    
    # Verify email
    user.email_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    
    await db.commit()
    
    # Send welcome email
    try:
        await email_service.send_welcome_email(user)
    except Exception as e:
        print(f"Failed to send welcome email: {e}")
    
    return {"message": "Email verified successfully"}

@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    email: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Resend verification email"""
    
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a verification link has been sent."}
    
    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Generate new token
    verification_token = generate_verification_token()
    user.verification_token = verification_token
    user.verification_token_expires = datetime.utcnow() + timedelta(hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS)
    
    await db.commit()
    
    # Send verification email
    try:
        await email_service.send_verification_email(user, verification_token)
    except Exception as e:
        print(f"Failed to send verification email: {e}")
    
    return {"message": "If the email exists, a verification link has been sent."}

@router.post("/login", response_model=UserResponse)
async def login(
    credentials: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Login user and set HTTP-only cookies"""
    
    # Get user by email
    stmt = select(User).where(User.email == credentials.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if account is locked
    if user.locked_until and user.locked_until > datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account locked until {user.locked_until}"
        )
    
    # Check account status
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is {user.status}"
        )
    
    # Check email verification
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in"
        )
    
    # Reset login attempts
    user.login_attempts = 0
    user.locked_until = None
    user.last_login = datetime.utcnow()
    
    # Log Activity
    await log_activity(
        db=db,
        user_id=user.id,
        activity_type="user_login",
        description=f"User {user.name} logged in",
        metadata={"email": user.email}
    )
    
    await db.commit()
    
    # Create tokens
    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    # Set HTTP-only cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/"
    )
    
    return UserResponse.model_validate(user)

@router.post("/logout", response_model=MessageResponse)
async def logout(response: Response):
    """Logout user by clearing cookies"""
    
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    
    return {"message": "Logged out successfully"}

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    request_data: PasswordResetRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Request password reset"""
    print(f"DEBUG: Processing forgot_password for {request_data.email}")
    
    stmt = select(User).where(User.email == request_data.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    # Don't reveal if email exists
    if not user:
        print(f"DEBUG: User {request_data.email} NOT FOUND in database.")
        return {"message": "If the email exists, a password reset link has been sent."}
    
    print(f"DEBUG: User {request_data.email} found. Generating reset token.")
    
    # Generate reset token
    reset_token = generate_reset_token()
    user.reset_token = reset_token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
    
    await db.commit()
    print("DEBUG: Reset token saved to DB.")
    
    # Send reset email
    base_url = str(request.base_url).rstrip('/')
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    
    print(f"DEBUG: Attempting to send email to {user.email}")
    try:
        await email_service.send_password_reset_email(user, reset_url)
        print("DEBUG: Email service call completed.")
    except Exception as e:
        print(f"DEBUG: Failed to send password reset email: {e}")
    
    return {"message": "If the email exists, a password reset link has been sent."}

@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    reset_data: PasswordReset,
    db: AsyncSession = Depends(get_db)
):
    """Reset password with token"""
    
    stmt = select(User).where(User.reset_token == reset_data.token)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )
    
    if user.reset_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token expired. Please request a new one."
        )
    
    # Update password
    user.password_hash = get_password_hash(reset_data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    
    await db.commit()
    
    return {"message": "Password reset successfully"}


