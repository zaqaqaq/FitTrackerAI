from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, trainings, ai
from app.database import init_db

app = FastAPI(title="FitTrackerAi API", version="1.0.0")

# CORS настройки для React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Регистрация роутеров
app.include_router(auth.router)
app.include_router(trainings.router)
app.include_router(ai.router)

@app.on_event("startup")
async def startup():
    await init_db()

@app.get("/")
async def root():
    return {"message": "Welcome to FitTrackerAi API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}