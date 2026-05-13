import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Flame, List, ChefHat } from 'lucide-react';

interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  cooking_time: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  image_url: string | null;
  created_at: string;
}

const API_BASE_URL = 'http://localhost:8000';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/recipes/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setRecipe(data);
        } else if (response.status === 404) {
          navigate('/recipes');
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id, navigate]);

  if (loading) {
    return <div className="text-white text-center py-8">Загрузка...</div>;
  }

  if (!recipe) {
    return <div className="text-white text-center py-8">Рецепт не найден</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Кнопка назад */}
      <button
        onClick={() => navigate('/recipes')}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к рецептам
      </button>

      {/* Картинка - исправлено отображение */}
      <div className="rounded-xl overflow-hidden mb-6 h-80 md:h-96 bg-gray-800">
        {recipe.image_url && !imageError ? (
          <img
            src={`${API_BASE_URL}${recipe.image_url}`}
            alt={recipe.title}
            className="w-full h-full object-contain bg-gray-800"
            onError={() => {
              console.error('Ошибка загрузки картинки:', recipe.image_url);
              setImageError(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl bg-gray-700">
            🍲
          </div>
        )}
      </div>

      {/* Заголовок */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{recipe.title}</h1>

      {/* Описание */}
      <p className="text-gray-300 text-lg mb-6">{recipe.description || 'Описание отсутствует'}</p>

      {/* Информационная панель */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <Clock className="h-5 w-5 text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{recipe.cooking_time}</p>
          <p className="text-xs text-gray-400">минут</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <Flame className="h-5 w-5 text-orange-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{recipe.calories}</p>
          <p className="text-xs text-gray-400">ккал</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <span className="text-2xl mb-1 block">🥩</span>
          <p className="text-xl font-bold text-white">{recipe.protein}</p>
          <p className="text-xs text-gray-400">белки (г)</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <span className="text-2xl mb-1 block">🧈</span>
          <p className="text-xl font-bold text-white">{recipe.fats}</p>
          <p className="text-xs text-gray-400">жиры (г)</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <span className="text-2xl mb-1 block">🍚</span>
          <p className="text-xl font-bold text-white">{recipe.carbs}</p>
          <p className="text-xs text-gray-400">углеводы (г)</p>
        </div>
      </div>

      {/* Ингредиенты */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <List className="h-5 w-5 text-green-400" />
          Ингредиенты
        </h2>
        <div className="text-gray-300 whitespace-pre-wrap">
          {recipe.ingredients || 'Ингредиенты не указаны'}
        </div>
      </div>

      {/* Приготовление */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <ChefHat className="h-5 w-5 text-green-400" />
          Приготовление
        </h2>
        <div className="text-gray-300 whitespace-pre-wrap">
          {recipe.instructions || 'Инструкция не указана'}
        </div>
      </div>
    </div>
  );
}