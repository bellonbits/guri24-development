from sqlalchemy.ext.asyncio import AsyncSession
from app.models.activity import Activity
from typing import Optional, Any, Dict
import logging

logger = logging.getLogger(__name__)

async def log_activity(
    db: AsyncSession, 
    user_id: Optional[Any], 
    activity_type: str, 
    description: str, 
    metadata: Optional[Dict[str, Any]] = None
):
    """
    Utility to log a system activity.
    """
    try:
        new_activity = Activity(
            user_id=user_id,
            type=activity_type,
            description=description,
            metadata_json=metadata
        )
        db.add(new_activity)
        await db.commit()
    except Exception as e:
        logger.error(f"Failed to log activity {activity_type}: {e}")
        # We don't want activity logging to crash the main request
        await db.rollback()
