"""
Chat API routes — conversational trip planning.
"""

from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user, get_optional_user
from app.models.schemas import ChatRequest, ChatResponse
from app.services.chat_planner import get_or_create_session, delete_session
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    user: dict | None = Depends(get_optional_user),
):
    """
    Send a message to the trip planning chatbot.
    Uses session_id to maintain conversation state.
    """
    planner = get_or_create_session(request.session_id)

    try:
        reply, is_complete, extracted = planner.process_input(request.message)

        return ChatResponse(
            reply=reply,
            trip_complete=is_complete,
            extracted_details=extracted,
            session_id=request.session_id,
        )
    except Exception as e:
        logger.error("Chat error for session '%s': %s", request.session_id, e)
        return ChatResponse(
            reply="Something went wrong. Please try again.",
            trip_complete=False,
            extracted_details=None,
            session_id=request.session_id,
        )


@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear a chat session."""
    delete_session(session_id)
    return {"message": "Session cleared"}


@router.get("/session/{session_id}/state")
async def get_session_state(session_id: str):
    """Get the current state of a chat session (for debugging/display)."""
    planner = get_or_create_session(session_id)
    return {
        "session_id": session_id,
        "state": planner.get_state_dict(),
        "errors": planner.validate(),
    }
