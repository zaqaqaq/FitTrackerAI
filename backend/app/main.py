from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routers import auth, trainings, ai, recipes
from app.database import init_db

app = FastAPI(title="FitTrackerAi API", version="1.0.0")

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Регистрация роутеров с префиксом /api
app.include_router(auth.router, prefix="/api")
app.include_router(trainings.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(recipes.router, prefix="/api")

# Создаём папку для картинок
os.makedirs("static/images", exist_ok=True)

# Подключаем статику
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
async def startup():
    await init_db()
    print("✅ Database initialized")

@app.get("/")
async def root():
    return {"message": "Welcome to FitTrackerAi API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}