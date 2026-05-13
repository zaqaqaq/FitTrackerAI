import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./fitracker.db")
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")


settings = Settings()