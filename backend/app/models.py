from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    trainings = relationship("Training", back_populates="owner", cascade="all, delete-orphan")
    logs = relationship("ExerciseLog", back_populates="user", cascade="all, delete-orphan")
    recipes = relationship("Recipe", back_populates="user", cascade="all, delete-orphan")


class Training(Base):
    __tablename__ = "trainings"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="trainings")
    exercises = relationship("ExerciseLog", back_populates="training", cascade="all, delete-orphan")


class ExerciseLog(Base):
    __tablename__ = "exercise_logs"

    id = Column(Integer, primary_key=True)
    training_id = Column(Integer, ForeignKey("trainings.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    exercise_name = Column(String, nullable=False)
    weight = Column(Float)
    reps = Column(Integer)
    sets = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    training = relationship("Training", back_populates="exercises")
    user = relationship("User", back_populates="logs")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    ingredients = Column(String, nullable=False)
    instructions = Column(String, nullable=False)
    cooking_time = Column(Integer, default=30)
    calories = Column(Integer, default=0)
    protein = Column(Integer, default=0)
    fats = Column(Integer, default=0)
    carbs = Column(Integer, default=0)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recipes")