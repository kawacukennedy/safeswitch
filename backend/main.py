"""
Application entry point. Creates DB tables on startup, registers middleware and router.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

@app.get("/")
def root():
    return {"service": "SafeSwitch", "status": "running", "docs": "/docs"}
