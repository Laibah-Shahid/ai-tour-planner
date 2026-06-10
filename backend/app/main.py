"""
PakTour AI — FastAPI Backend Application
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.routers import itinerary, chat, disaster, explore, profile, contribute


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Starting PakTour AI API...")
    settings = get_settings()
    logger.info("CORS origins: %s", settings.cors_origins_list)

    # Eagerly initialize the itinerary generator so the first request is not slow.
    # Runs in a thread executor to avoid blocking the event loop during model load.
    import asyncio
    from app.services.itinerary_engine import get_generator
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, get_generator)
    logger.info("Itinerary generator ready.")

    yield
    logger.info("Shutting down PakTour AI API...")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="AI-powered travel planning API for Pakistan tourism",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled error on %s %s: %s", request.method, request.url.path, exc)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error. Please try again later."},
        )

    # Routers
    app.include_router(itinerary.router)
    app.include_router(chat.router)
    app.include_router(disaster.router)
    app.include_router(explore.router)
    app.include_router(profile.router)
    app.include_router(contribute.router)

    # Health check
    @app.get("/api/health")
    async def health_check():
        return {"status": "healthy", "version": settings.APP_VERSION}

    return app


app = create_app()
