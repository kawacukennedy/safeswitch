"""
Application entry point. Creates DB tables on startup, registers middleware and router.
In production, serves the built frontend via catch-all SPA route so that client-side
router paths like /dashboard and /demo work on page refresh or direct navigation.
"""
import os
from fastapi import FastAPI, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from database import engine, Base
from router import router
from config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SafeSwitch API",
    description="Real-time fraud prevention for mobile money — Nokia Network as Code + on-device reasoning engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

static_dir = os.environ.get("STATIC_DIR", "static")
assets_dir = os.path.join(static_dir, "assets")
if os.path.isdir(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="static_assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path.startswith("api/"):
        return JSONResponse({"detail": "Not Found"}, status_code=404)
    file_path = os.path.join(static_dir, full_path) if full_path else static_dir
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    index_path = os.path.join(static_dir, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return JSONResponse({"detail": "Not Found"}, status_code=404)
