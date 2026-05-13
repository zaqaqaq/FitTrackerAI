from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional

from app.database import get_db
from app.models import User, Training, ExerciseLog
from app.auth import get_current_user

router = APIRouter(prefix="/trainings", tags=["trainings"])


class TrainingCreate(BaseModel):
    name: str


class TrainingResponse(BaseModel):
    id: int
    name: str
    created_at: str


class ExerciseLogCreate(BaseModel):
    training_id: int
    exercise_name: str
    weight: float
    reps: int
    sets: int = 1


class ExerciseLogResponse(BaseModel):
    id: int
    exercise_name: str
    weight: float
    reps: int
    sets: int
    created_at: str


@router.post("/", response_model=TrainingResponse)
async def create_training(
        training_data: TrainingCreate,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    training = Training(name=training_data.name, user_id=current_user.id)
    db.add(training)
    await db.commit()
    await db.refresh(training)

    return TrainingResponse(
        id=training.id,
        name=training.name,
        created_at=training.created_at.isoformat()
    )


@router.get("/", response_model=List[TrainingResponse])
async def get_trainings(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Training).where(Training.user_id == current_user.id).order_by(Training.created_at.desc())
    )
    trainings = result.scalars().all()

    return [
        TrainingResponse(
            id=t.id,
            name=t.name,
            created_at=t.created_at.isoformat()
        )
        for t in trainings
    ]


@router.post("/logs", response_model=ExerciseLogResponse)
async def add_exercise_log(
        log_data: ExerciseLogCreate,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    # Проверка, что тренировка принадлежит пользователю
    result = await db.execute(
        select(Training).where(Training.id == log_data.training_id, Training.user_id == current_user.id)
    )
    training = result.scalar_one_or_none()
    if not training:
        raise HTTPException(status_code=404, detail="Training not found")

    log = ExerciseLog(
        training_id=log_data.training_id,
        user_id=current_user.id,
        exercise_name=log_data.exercise_name,
        weight=log_data.weight,
        reps=log_data.reps,
        sets=log_data.sets
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)

    return ExerciseLogResponse(
        id=log.id,
        exercise_name=log.exercise_name,
        weight=log.weight,
        reps=log.reps,
        sets=log.sets,
        created_at=log.created_at.isoformat()
    )


@router.get("/logs", response_model=List[ExerciseLogResponse])
async def get_exercise_logs(
        training_id: Optional[int] = None,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    query = select(ExerciseLog).where(ExerciseLog.user_id == current_user.id)
    if training_id:
        query = query.where(ExerciseLog.training_id == training_id)
    query = query.order_by(ExerciseLog.created_at.desc())

    result = await db.execute(query)
    logs = result.scalars().all()

    return [
        ExerciseLogResponse(
            id=log.id,
            exercise_name=log.exercise_name,
            weight=log.weight,
            reps=log.reps,
            sets=log.sets,
            created_at=log.created_at.isoformat()
        )
        for log in logs
    ]