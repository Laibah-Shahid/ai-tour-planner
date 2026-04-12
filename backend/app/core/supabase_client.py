from supabase import create_client, Client
from app.core.config import get_settings

_client: Client | None = None
_service_client: Client | None = None


def get_supabase() -> Client:
    """Get Supabase client with anon key (for authenticated user operations)."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    return _client


def get_supabase_admin() -> Client:
    """Get Supabase client with service role key (for admin operations)."""
    global _service_client
    if _service_client is None:
        settings = get_settings()
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        _service_client = create_client(settings.SUPABASE_URL, key)
    return _service_client
