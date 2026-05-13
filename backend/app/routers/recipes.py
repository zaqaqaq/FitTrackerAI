from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import shutil

from app.database import get_db
from app.models import User, Recipe
from app.auth import get_current_user

router = APIRouter(prefix="/recipes", tags=["recipes"])


class RecipeCreate(BaseModel):
    title: str
    description: str
    ingredients: str
    instructions: str
    cooking_time: int = 30
    calories: int = 0
    protein: int = 0
    fats: int = 0
    carbs: int = 0
    image_url: Optional[str] = None


class RecipeResponse(BaseModel):
    id: int
    title: str
    description: str
    ingredients: str
    instructions: str
    cooking_time: int
    calories: int
    protein: int
    fats: int
    carbs: int
    image_url: Optional[str]
    created_at: str
    user_id: int


@router.post("/", response_model=RecipeResponse)
async def create_recipe(
        recipe_data: RecipeCreate,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """Создание нового рецепта"""
    recipe = Recipe(
        user_id=current_user.id,
        title=recipe_data.title,
        description=recipe_data.description,
        ingredients=recipe_data.ingredients,
        instructions=recipe_data.instructions,
        cooking_time=recipe_data.cooking_time,
        calories=recipe_data.calories,
        protein=recipe_data.protein,
        fats=recipe_data.fats,
        carbs=recipe_data.carbs,
        image_url=recipe_data.image_url
    )
    db.add(recipe)
    await db.commit()
    await db.refresh(recipe)

    return RecipeResponse(
        id=recipe.id,
        title=recipe.title,
        description=recipe.description,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
        cooking_time=recipe.cooking_time,
        calories=recipe.calories,
        protein=recipe.protein,
        fats=recipe.fats,
        carbs=recipe.carbs,
        image_url=recipe.image_url,
        created_at=recipe.created_at.isoformat(),
        user_id=recipe.user_id
    )


@router.post("/upload-image")
async def upload_image(
        file: UploadFile = File(...),
        current_user: User = Depends(get_current_user)
):
    """Загрузка картинки для рецепта"""
    # Проверяем тип файла
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Файл должен быть изображением")

    # Создаём папку если её нет
    os.makedirs("static/images", exist_ok=True)

    # Создаём уникальное имя файла
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = file.filename.replace(" ", "_")
    filename = f"{timestamp}_{current_user.id}_{safe_filename}"
    filepath = f"static/images/{filename}"

    # Сохраняем файл
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Возвращаем URL для доступа к картинке
    image_url = f"/static/images/{filename}"

    return {"image_url": image_url}


@router.get("/", response_model=List[RecipeResponse])
async def get_recipes(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """Получение всех рецептов пользователя"""
    result = await db.execute(
        select(Recipe).where(Recipe.user_id == current_user.id).order_by(Recipe.created_at.desc())
    )
    recipes = result.scalars().all()

    return [
        RecipeResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            ingredients=r.ingredients,
            instructions=r.instructions,
            cooking_time=r.cooking_time,
            calories=r.calories,
            protein=r.protein,
            fats=r.fats,
            carbs=r.carbs,
            image_url=r.image_url,
            created_at=r.created_at.isoformat(),
            user_id=r.user_id
        )
        for r in recipes
    ]


@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(
        recipe_id: int,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """Получение одного рецепта"""
    result = await db.execute(
        select(Recipe).where(Recipe.id == recipe_id, Recipe.user_id == current_user.id)
    )
    recipe = result.scalar_one_or_none()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    return RecipeResponse(
        id=recipe.id,
        title=recipe.title,
        description=recipe.description,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
        cooking_time=recipe.cooking_time,
        calories=recipe.calories,
        protein=recipe.protein,
        fats=recipe.fats,
        carbs=recipe.carbs,
        image_url=recipe.image_url,
        created_at=recipe.created_at.isoformat(),
        user_id=recipe.user_id
    )


@router.put("/{recipe_id}", response_model=RecipeResponse)
async def update_recipe(
        recipe_id: int,
        recipe_data: RecipeCreate,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """Обновление рецепта"""
    result = await db.execute(
        select(Recipe).where(Recipe.id == recipe_id, Recipe.user_id == current_user.id)
    )
    recipe = result.scalar_one_or_none()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    recipe.title = recipe_data.title
    recipe.description = recipe_data.description
    recipe.ingredients = recipe_data.ingredients
    recipe.instructions = recipe_data.instructions
    recipe.cooking_time = recipe_data.cooking_time
    recipe.calories = recipe_data.calories
    recipe.protein = recipe_data.protein
    recipe.fats = recipe_data.fats
    recipe.carbs = recipe_data.carbs
    recipe.image_url = recipe_data.image_url

    await db.commit()
    await db.refresh(recipe)

    return RecipeResponse(
        id=recipe.id,
        title=recipe.title,
        description=recipe.description,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
        cooking_time=recipe.cooking_time,
        calories=recipe.calories,
        protein=recipe.protein,
        fats=recipe.fats,
        carbs=recipe.carbs,
        image_url=recipe.image_url,
        created_at=recipe.created_at.isoformat(),
        user_id=recipe.user_id
    )


@router.delete("/{recipe_id}")
async def delete_recipe(
        recipe_id: int,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """Удаление рецепта"""
    result = await db.execute(
        select(Recipe).where(Recipe.id == recipe_id, Recipe.user_id == current_user.id)
    )
    recipe = result.scalar_one_or_none()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # Удаляем картинку, если она есть
    if recipe.image_url:
        image_path = recipe.image_url.lstrip('/')
        if os.path.exists(image_path):
            os.remove(image_path)

    await db.delete(recipe)
    await db.commit()

    return {"message": "Recipe deleted successfully"}