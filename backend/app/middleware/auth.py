from fastapi import Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.supabase_client import get_supabase
from app.core.exceptions import UnauthorizedError

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """Verify Supabase JWT and return user data. Raises 401 if invalid."""
    if credentials is None:
        raise UnauthorizedError("Missing authorization token")

    token = credentials.credentials
    try:
        supabase = get_supabase()
        response = supabase.auth.get_user(token)
        if response is None or response.user is None:
            raise UnauthorizedError("Invalid or expired token")
        return {
            "id": response.user.id,
            "email": response.user.email,
            "full_name": response.user.user_metadata.get("full_name", ""),
            "avatar_url": response.user.user_metadata.get("avatar_url", ""),
        }
    except UnauthorizedError:
        raise
    except Exception as e:
        raise UnauthorizedError(f"Token verification failed: {str(e)}")


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict | None:
    """Return user if token is present and valid, else None. No error thrown."""
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials)
    except Exception:
        return None
