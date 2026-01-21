import socketio
import logging
from typing import Dict, Any, Optional
from uuid import UUID
from jose import jwt, JWTError

from app.config import settings

logger = logging.getLogger(__name__)

# Create Socket.IO server
# Use Redis as message queue if available for scalability
mgr = None
if settings.REDIS_URL:
    try:
        mgr = socketio.AsyncRedisManager(settings.REDIS_URL)
        logger.info(f"Socket.IO using Redis manager: {settings.REDIS_URL}")
    except Exception as e:
        logger.error(f"Failed to initialize Redis manager: {e}")

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=settings.cors_origins_list,
    client_manager=mgr
)

class SocketManager:
    def __init__(self):
        self.connected_users: Dict[str, str] = {} # sid -> user_id

    async def get_user_id_from_token(self, token: str) -> Optional[str]:
        try:
            # Simple JWT decode (similar to what get_current_user does)
            payload = jwt.decode(
                token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
            )
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return user_id
        except JWTError:
            return None

    def setup_events(self):
        @sio.event
        async def connect(sid, environ, auth):
            token = None
            if auth and 'token' in auth:
                token = auth['token']
            
            # Also check query params as fallback
            if not token:
                query_string = environ.get('QUERY_STRING', '')
                params = dict(item.split('=') for item in query_string.split('&') if '=' in item)
                token = params.get('token')

            if not token:
                logger.warning(f"Connection attempt without token: {sid}")
                return False # Reject connection

            user_id = await self.get_user_id_from_token(token)
            if not user_id:
                logger.warning(f"Invalid token for sid {sid}")
                return False

            self.connected_users[sid] = user_id
            # Join a room specific to this user_id so we can send messages to them
            await sio.enter_room(sid, f"user_{user_id}")
            logger.info(f"User {user_id} connected via Socket.IO (sid: {sid})")
            return True

        @sio.event
        async def disconnect(sid):
            user_id = self.connected_users.pop(sid, None)
            if user_id:
                logger.info(f"User {user_id} disconnected (sid: {sid})")

        @sio.on("ping")
        async def handle_ping(sid, data):
            await sio.emit("pong", {"status": "ok"}, room=sid)

    async def emit_to_user(self, user_id: str, event: str, data: Any):
        """Send an event to all connections of a specific user"""
        await sio.emit(event, data, room=f"user_{user_id}")

socket_manager = SocketManager()
socket_manager.setup_events()
