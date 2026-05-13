import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Clock, Flame, Upload, X } from 'lucide-react';

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

export default function RecipeBook() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Recipe | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    cooking_time: 30,
    calories: 0,
    protein: 0,
    fats: 0,
    carbs: 0,
    image_url: ''
  });

  const loadRecipes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/recipes/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/recipes/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.image_url;
      }
      return null;
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      return null;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setFormData({ ...formData, image_url: imageUrl });
    }
    setUploading(false);
  };

  const saveRecipe = async () => {
    if (!formData.title.trim()) {
      alert('Введите название рецепта');
      return;
    }

    const token = localStorage.getItem('token');
    const url = editingRecipe
      ? `/api/recipes/${editingRecipe.id}`
      : '/api/recipes/';
    const method = editingRecipe ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingRecipe(null);
        setFormData({
          title: '', description: '', ingredients: '', instructions: '',
          cooking_time: 30, calories: 0, protein: 0, fats: 0, carbs: 0, image_url: ''
        });
        loadRecipes();
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const deleteRecipe = async () => {
    if (!deleteConfirm) return;

    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/recipes/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDeleteConfirm(null);
      loadRecipes();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cooking_time: recipe.cooking_time,
      calories: recipe.calories,
      protein: recipe.protein,
      fats: recipe.fats,
      carbs: recipe.carbs,
      image_url: recipe.image_url || ''
    });
    setShowModal(true);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  if (loading) {
    return <div className="text-white text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🍳 Кулинарный блокнот
          </h1>
          <p className="text-gray-400 text-sm mt-1">Полезные рецепты для здорового питания</p>
        </div>
        <button
          onClick={() => {
            setEditingRecipe(null);
            setFormData({
              title: '', description: '', ingredients: '', instructions: '',
              cooking_time: 30, calories: 0, protein: 0, fats: 0, carbs: 0, image_url: ''
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Новый рецепт
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">У вас пока нет рецептов</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition"
          >
            Добавить первый рецепт
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-green-500 transition group flex flex-col">
              {/* Картинка - фиксированная высота с object-cover */}
              <div className="h-48 bg-gray-700 relative overflow-hidden flex-shrink-0">
                {recipe.image_url ? (
                  <img
                    src={`${API_BASE_URL}${recipe.image_url}`}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      console.error('Ошибка загрузки картинки:', recipe.image_url);
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl bg-gray-700">🍲</div>';
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-700">
                    🍲
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openEditModal(recipe)}
                    className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                    title="Редактировать"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(recipe)}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Контент */}
              <div className="p-4 flex flex-col flex-grow">
                <a href={`/recipes/${recipe.id}`} className="block">
                  <h3 className="text-lg font-bold text-white hover:text-green-400 transition mb-2 line-clamp-1">
                    {recipe.title}
                  </h3>
                </a>
                <p className="text-gray-400 text-sm line-clamp-2 mb-3 flex-grow">
                  {recipe.description || 'Описание отсутствует'}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded-full flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {recipe.cooking_time} мин
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded-full flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {recipe.calories} ккал
                  </span>
                  {recipe.protein > 0 && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 rounded-full">
                      🥩 {recipe.protein}г
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно добавления/редактирования */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingRecipe ? 'Редактировать рецепт' : 'Новый рецепт'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Название*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Например: Протеиновый смузи"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Картинка</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Загрузка...' : 'Загрузить картинку'}
                  </button>
                  {formData.image_url && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition text-red-400 flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Удалить
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {formData.image_url && (
                  <div className="mt-2 relative w-32 h-32">
                    <img
                      src={`${API_BASE_URL}${formData.image_url}`}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Краткое описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={2}
                  placeholder="Коротко о рецепте..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Ингредиенты</label>
                <textarea
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Курица - 200 г&#10;Рис - 150 г&#10;Брокколи - 100 г&#10;..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Приготовление</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={5}
                  placeholder="1. Нарезать курицу...&#10;2. Отварить рис...&#10;3. ..."
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Время (мин)</label>
                  <input
                    type="number"
                    value={formData.cooking_time}
                    onChange={(e) => setFormData({ ...formData, cooking_time: Number(e.target.value) })}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Калории</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Белки (г)</label>
                  <input
                    type="number"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Жиры (г)</label>
                  <input
                    type="number"
                    value={formData.fats}
                    onChange={(e) => setFormData({ ...formData, fats: Number(e.target.value) })}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Углеводы (г)</label>
                  <input
                    type="number"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={saveRecipe} className="flex-1 p-2 bg-green-500 hover:bg-green-600 rounded-lg transition">
                  {editingRecipe ? 'Сохранить' : 'Создать'}
                </button>
                <button onClick={() => setShowModal(false)} className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition">
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Подтверждение удаления */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Удалить рецепт?</h2>
            <p className="text-gray-300 mb-6">
              Вы уверены, что хотите удалить <strong className="text-white">"{deleteConfirm.title}"</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={deleteRecipe} className="flex-1 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition">
                Удалить
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}