import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RecipeDetail from './components/RecipeDetail';
import Achievements from './components/Achievements';
import { useState, useEffect, useRef  } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// ============ Layout ============
function Layout({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-white font-bold text-xl">FitTrackerAi</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700">Главная</a>
              <a href="/trainings" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700">Тренировки</a>
              <a href="/journal" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700">Журнал</a>
              <a href="/recipes" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700">Рецепты</a>
              <a href="/ai" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700">AI Тренер</a>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-gray-700">Выход</button>
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">{isOpen ? '✕' : '☰'}</button>
            </div>
          </div>
          {isOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <a href="/" className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700">Главная</a>
              <a href="/trainings" className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700">Тренировки</a>
              <a href="/journal" className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700">Журнал</a>
              <a href="/recipes" className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700">Рецепты</a>
              <a href="/ai" className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700">AI Тренер</a>
              <button onClick={handleLogout} className="w-full text-left text-red-400 px-3 py-2 rounded-lg hover:bg-gray-700">Выход</button>
            </div>
          )}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

// ============ Login Page ============
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        window.location.href = '/';
      } else {
        setError(data.detail || 'Ошибка входа');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white text-center mb-6">FitTrackerAi</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg mb-4">{error}</div>}
        <input type="text" placeholder="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" autoComplete="username" required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" autoComplete="current-password" required />
        <button type="submit" disabled={loading} className="w-full p-3 bg-green-500 hover:bg-green-600 rounded-lg font-bold transition disabled:opacity-50">{loading ? 'Вход...' : 'Войти'}</button>
        <p className="text-center text-gray-400 mt-4">Нет аккаунта? <a href="/register" className="text-green-400 hover:underline">Зарегистрироваться</a></p>
      </form>
    </div>
  );
}

// ============ Register Page ============
function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });
      if (response.ok) {
        const loginResponse = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const loginData = await loginResponse.json();
        localStorage.setItem('token', loginData.access_token);
        window.location.href = '/';
      } else {
        const data = await response.json();
        setError(data.detail || 'Ошибка регистрации');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Регистрация</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg mb-4">{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" autoComplete="email" required />
        <input type="text" placeholder="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" autoComplete="username" required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" autoComplete="new-password" required />
        <button type="submit" disabled={loading} className="w-full p-3 bg-green-500 hover:bg-green-600 rounded-lg font-bold transition disabled:opacity-50">{loading ? 'Регистрация...' : 'Зарегистрироваться'}</button>
        <p className="text-center text-gray-400 mt-4">Уже есть аккаунт? <a href="/login" className="text-green-400 hover:underline">Войти</a></p>
      </form>
    </div>
  );
}

// ============ Dashboard Page ============
function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [stats, setStats] = useState({ trainings: 0, logs: 0, totalWeight: 0, bestWeight: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [meRes, trainingsRes, logsRes] = await Promise.all([
          fetch('/api/me', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/trainings', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/trainings/logs', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const userData = await meRes.json();
        const trainingsData = await trainingsRes.json();
        const logsData = await logsRes.json();

        setUser(userData);
        setLogs(logsData);
        setTrainings(trainingsData);

        const totalWeight = logsData.reduce((sum: number, log: any) => sum + (log.weight * log.reps * log.sets), 0);
        const bestWeight = logsData.length > 0 ? Math.max(...logsData.map((l: any) => l.weight)) : 0;

        setStats({
          trainings: trainingsData.length,
          logs: logsData.length,
          totalWeight: totalWeight,
          bestWeight: bestWeight
        });
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Привет, {user?.username || 'Гость'}! 👋</h1>
        <p className="text-gray-300">Продолжай тренироваться, прогресс не стоит на месте</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-6"><h3 className="text-gray-400">Тренировок</h3><p className="text-3xl font-bold text-white mt-2">{stats.trainings}</p></div>
        <div className="bg-gray-800 rounded-xl p-6"><h3 className="text-gray-400">Подходов</h3><p className="text-3xl font-bold text-white mt-2">{stats.logs}</p></div>
        <div className="bg-gray-800 rounded-xl p-6"><h3 className="text-gray-400">Общий тоннаж (кг)</h3><p className="text-3xl font-bold text-white mt-2">{Math.round(stats.totalWeight)}</p></div>
        <div className="bg-gray-800 rounded-xl p-6"><h3 className="text-gray-400">Лучший вес (кг)</h3><p className="text-3xl font-bold text-white mt-2">{stats.bestWeight}</p></div>
      </div>

      <Achievements logs={logs} trainings={trainings} stats={stats} />

      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📋 Быстрый старт</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/trainings" className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition">Мои тренировки</a>
          <a href="/recipes" className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition">Кулинарный блокнот</a>
          <a href="/ai" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">AI Тренер</a>
        </div>
      </div>
    </div>
  );
}

// ============ Trainings Page ============
function TrainingsPage() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [newTrainingName, setNewTrainingName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTraining, setEditingTraining] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const loadTrainings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/trainings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTrainings(data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTraining = async () => {
    if (!newTrainingName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/trainings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newTrainingName })
      });
      setNewTrainingName('');
      setShowModal(false);
      loadTrainings();
    } catch (error) {
      console.error('Ошибка создания:', error);
    }
  };

  const updateTraining = async () => {
    if (!editingTraining || !editingTraining.name.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/trainings/${editingTraining.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editingTraining.name })
      });
      setEditingTraining(null);
      loadTrainings();
    } catch (error) {
      console.error('Ошибка обновления:', error);
    }
  };

  const deleteTraining = async (training: any) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/trainings/${training.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDeleteConfirm(null);
      loadTrainings();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  if (loading) return <div className="text-white text-center py-8">Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Мои тренировки</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition">+ Новая тренировка</button>
      </div>
      {trainings.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">У вас пока нет тренировок</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition">Создать первую тренировку</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainings.map((training) => (
            <div key={training.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-500 transition">
              {editingTraining?.id === training.id ? (
                <div className="space-y-3">
                  <input type="text" value={editingTraining.name} onChange={(e) => setEditingTraining({ ...editingTraining, name: e.target.value })} className="w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" autoFocus />
                  <div className="flex gap-2">
                    <button onClick={updateTraining} className="flex-1 px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg text-sm transition">Сохранить</button>
                    <button onClick={() => setEditingTraining(null)} className="flex-1 px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm transition">Отмена</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div><h3 className="text-lg font-semibold text-white">{training.name}</h3><p className="text-gray-400 text-sm mt-1">{new Date(training.created_at).toLocaleDateString('ru-RU')}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingTraining({ id: training.id, name: training.name })} className="p-1.5 text-blue-400 hover:text-blue-300 transition" title="Редактировать">✏️</button>
                      <button onClick={() => setDeleteConfirm(training)} className="p-1.5 text-red-400 hover:text-red-300 transition" title="Удалить">🗑️</button>
                    </div>
                  </div>
                  <a href={`/journal?training_id=${training.id}`} className="inline-block mt-3 text-green-400 hover:text-green-300 text-sm">Добавить подходы →</a>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Новая тренировка</h2>
            <input type="text" value={newTrainingName} onChange={(e) => setNewTrainingName(e.target.value)} placeholder="Название тренировки" className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" autoFocus />
            <div className="flex gap-3"><button onClick={createTraining} className="flex-1 p-2 bg-green-500 hover:bg-green-600 rounded-lg transition">Создать</button><button onClick={() => setShowModal(false)} className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition">Отмена</button></div>
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Подтверждение удаления</h2>
            <p className="text-gray-300 mb-6">Вы уверены, что хотите удалить тренировку <strong className="text-white">"{deleteConfirm.name}"</strong>?<br /><span className="text-red-400 text-sm">Все подходы этой тренировки также будут удалены!</span></p>
            <div className="flex gap-3"><button onClick={() => deleteTraining(deleteConfirm)} className="flex-1 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition">Удалить</button><button onClick={() => setDeleteConfirm(null)} className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition">Отмена</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ Journal Page ============
function JournalPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [uniqueExercises, setUniqueExercises] = useState<string[]>([]);
  const [newLog, setNewLog] = useState({ training_id: 0, exercise_name: '', weight: 0, reps: 0, sets: 1 });

  // Калькулятор 1 ПМ
  const [calcWeight, setCalcWeight] = useState<number>(100);
  const [calcReps, setCalcReps] = useState<number>(5);
  const [calcResult, setCalcResult] = useState<any>(null);

  const calculateBrzycki = (weight: number, reps: number): number => Math.round(weight / (1.0278 - 0.0278 * reps));
  const calculateEpley = (weight: number, reps: number): number => Math.round(weight * (1 + 0.0333 * reps));
  const calculateLander = (weight: number, reps: number): number => Math.round((100 * weight) / (101.3 - 2.67123 * reps));

  const calculateOneRM = () => {
    if (calcWeight <= 0 || calcReps <= 0 || calcReps > 12) { alert('Введите корректные данные (вес > 0, повторения 1-12)'); return; }
    setCalcResult({
      brzycki: calculateBrzycki(calcWeight, calcReps),
      epley: calculateEpley(calcWeight, calcReps),
      lander: calculateLander(calcWeight, calcReps),
      average: Math.round((calculateBrzycki(calcWeight, calcReps) + calculateEpley(calcWeight, calcReps) + calculateLander(calcWeight, calcReps)) / 3)
    });
  };

  // Календарь активности
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [activityStats, setActivityStats] = useState({ currentStreak: 0, bestStreak: 0, totalWorkouts: 0, avgPerWeek: 0 });

  const getWorkoutDays = () => new Set(logs.map(log => new Date(log.created_at).toDateString()));

  const calculateStreak = () => {
    const workoutDates = getWorkoutDays();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (!workoutDates.has(today) && !workoutDates.has(yesterday)) return 0;
    let streak = 0;
    let currentDate = new Date();
    while (true) {
      if (workoutDates.has(currentDate.toDateString())) { streak++; currentDate.setDate(currentDate.getDate() - 1); } else break;
    }
    return streak;
  };

  const calculateBestStreak = () => {
    const workoutDates = getWorkoutDays();
    const sortedDates = Array.from(workoutDates).sort();
    let currentStreak = 1, bestStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i-1]), curr = new Date(sortedDates[i]);
      const diffDays = Math.floor((curr.getTime() - prev.getTime()) / 86400000);
      if (diffDays === 1) { currentStreak++; bestStreak = Math.max(bestStreak, currentStreak); } else currentStreak = 1;
    }
    return bestStreak;
  };

  const generateCalendar = () => {
    const workoutDays = getWorkoutDays();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const calendar = [];
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < adjustedStartDay; i++) calendar.push(null);
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      calendar.push({ day, hasWorkout: workoutDays.has(date.toDateString()), date });
    }
    setCalendarData(calendar);
  };

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedTrainingId ? `/api/trainings/logs?training_id=${selectedTrainingId}` : '/api/trainings/logs';
      const [logsRes, trainingsRes] = await Promise.all([
        fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/trainings', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const logsData = await logsRes.json();
      const trainingsData = await trainingsRes.json();
      setLogs(logsData);
      setTrainings(trainingsData);
      const exercises = [...new Set(logsData.map((log: any) => log.exercise_name))];
      setUniqueExercises(exercises);
      if (exercises.length > 0 && !selectedExercise) setSelectedExercise(exercises[0]);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const addLog = async () => {
    if (!newLog.training_id || !newLog.exercise_name || newLog.weight <= 0 || newLog.reps <= 0) { alert('Заполните все поля'); return; }
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/trainings/logs', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(newLog) });
      setShowModal(false);
      setNewLog({ training_id: 0, exercise_name: '', weight: 0, reps: 0, sets: 1 });
      loadData();
    } catch (error) { console.error(error); }
  };

  const updateLog = async () => {
    if (!editingLog) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/trainings/logs/${editingLog.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ training_id: editingLog.training_id, exercise_name: editingLog.exercise_name, weight: editingLog.weight, reps: editingLog.reps, sets: editingLog.sets }) });
      setEditingLog(null);
      loadData();
    } catch (error) { console.error(error); }
  };

  const deleteLog = async (log: any) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/trainings/logs/${log.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      setDeleteConfirm(null);
      loadData();
    } catch (error) { console.error(error); }
  };

  useEffect(() => { loadData(); }, [selectedTrainingId]);
  useEffect(() => {
    generateCalendar();
    setActivityStats({ currentStreak: calculateStreak(), bestStreak: calculateBestStreak(), totalWorkouts: getWorkoutDays().size, avgPerWeek: Math.round((getWorkoutDays().size / 30) * 7) });
  }, [logs, selectedMonth, selectedYear]);

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  if (loading) return <div className="text-white text-center py-8">Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Журнал тренировок</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition">+ Добавить подход</button>
      </div>

      {/* Калькулятор 1 ПМ */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">🏋️ Калькулятор 1 ПМ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-400 mb-2">Вес на штанге (кг)</label><input type="number" value={calcWeight} onChange={(e) => setCalcWeight(Number(e.target.value))} className="w-full p-3 rounded-lg bg-gray-700 text-white" /></div>
            <div><label className="block text-sm text-gray-400 mb-2">Количество повторений</label><input type="number" value={calcReps} onChange={(e) => setCalcReps(Math.min(Number(e.target.value), 12))} className="w-full p-3 rounded-lg bg-gray-700 text-white" min="1" max="12" /><p className="text-xs text-gray-500 mt-1">* Наиболее точный расчёт при 2-8 повторениях</p></div>
            <button onClick={calculateOneRM} className="w-full p-3 bg-green-500 hover:bg-green-600 rounded-lg transition">Рассчитать 1 ПМ</button>
          </div>
          {calcResult && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-400 mb-1">Твой предполагаемый 1 ПМ</p>
                <p className="text-4xl font-bold text-white">{calcResult.average} кг</p>
                <div className="flex justify-center gap-4 mt-2">
                  <div><p className="text-xs text-gray-400">Бжицки</p><p className="text-lg font-semibold text-green-400">{calcResult.brzycki}</p></div>
                  <div><p className="text-xs text-gray-400">Эпли</p><p className="text-lg font-semibold text-green-400">{calcResult.epley}</p></div>
                  <div><p className="text-xs text-gray-400">Лэндер</p><p className="text-lg font-semibold text-green-400">{calcResult.lander}</p></div>
                </div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-white mb-2">📊 Рекомендации по весам:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Сила (1-3 повторения):</span><span className="text-white font-semibold">{Math.round(calcResult.average * 0.95)}-{calcResult.average} кг</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Гипертрофия (6-10 повторений):</span><span className="text-white font-semibold">{Math.round(calcResult.average * 0.75)}-{Math.round(calcResult.average * 0.85)} кг</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Выносливость (12+ повторений):</span><span className="text-white font-semibold">{Math.round(calcResult.average * 0.65)}-{Math.round(calcResult.average * 0.7)} кг</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Календарь активности */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">📅 Календарь активности</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-orange-400">{activityStats.currentStreak}</p><p className="text-xs text-gray-400">Текущая серия (дней)</p></div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-yellow-400">{activityStats.bestStreak}</p><p className="text-xs text-gray-400">Лучшая серия (дней)</p></div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-green-400">{activityStats.totalWorkouts}</p><p className="text-xs text-gray-400">Всего дней с тренировками</p></div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-blue-400">{activityStats.avgPerWeek}</p><p className="text-xs text-gray-400">В среднем в неделю</p></div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => { if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1); } else setSelectedMonth(selectedMonth - 1); }} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">◀</button>
          <h4 className="text-lg font-semibold text-white">{monthNames[selectedMonth]} {selectedYear}</h4>
          <button onClick={() => { if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1); } else setSelectedMonth(selectedMonth + 1); }} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">▶</button>
          <button onClick={() => { setSelectedMonth(new Date().getMonth()); setSelectedYear(new Date().getFullYear()); }} className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg text-sm transition">Сегодня</button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">{weekDays.map(day => <div key={day} className="text-xs text-gray-500 py-1">{day}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((item, idx) => (
            <div key={idx} className={`aspect-square rounded-lg p-1 text-center transition ${item ? (item.hasWorkout ? 'bg-green-500/30 border border-green-500' : 'bg-gray-700/30') : 'bg-transparent'}`}>
              {item && <div className="text-sm font-medium text-white">{item.day}</div>}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-xs text-gray-400">Тренировка была</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-700"></div><span className="text-xs text-gray-400">Без тренировки</span></div>
        </div>
      </div>

      {/* График прогресса с recharts */}
      {selectedExercise && logs.filter(l => l.exercise_name === selectedExercise).length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">📈 Прогресс: {selectedExercise}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={logs
                  .filter(l => l.exercise_name === selectedExercise)
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((log) => ({
                    date: new Date(log.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
                    weight: log.weight,
                    reps: log.reps,
                    volume: log.weight * log.reps * log.sets
                  }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} labelStyle={{ color: '#9CA3AF' }} />
                <Legend />
                <Line type="monotone" dataKey="weight" name="Вес (кг)" stroke="#22c55e" strokeWidth={3} dot={{ fill: "#22c55e", r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Выбор упражнения для графика */}
      {uniqueExercises.length > 1 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <label className="text-sm text-gray-400 mb-2 block">📊 Показать график для:</label>
          <div className="flex flex-wrap gap-2">
            {uniqueExercises.map((exercise) => (
              <button key={exercise} onClick={() => setSelectedExercise(exercise)} className={`px-3 py-1.5 rounded-lg text-sm transition ${selectedExercise === exercise ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                {exercise}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Фильтр по тренировкам */}
      {trainings.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSelectedTrainingId(null)} className={`px-3 py-1 rounded-lg transition ${selectedTrainingId === null ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'}`}>Все тренировки</button>
          {trainings.map((t) => (
            <button key={t.id} onClick={() => setSelectedTrainingId(t.id)} className={`px-3 py-1 rounded-lg transition ${selectedTrainingId === t.id ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'}`}>{t.name}</button>
          ))}
        </div>
      )}

      {/* Список подходов */}
      {logs.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">Нет записей о подходах</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-500 rounded-lg">Добавить первый подход</button>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition">
              {editingLog?.id === log.id ? (
                <div className="space-y-3">
                  <input type="text" value={editingLog.exercise_name} onChange={(e) => setEditingLog({ ...editingLog, exercise_name: e.target.value })} className="w-full p-2 rounded-lg bg-gray-700 text-white" placeholder="Упражнение" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" value={editingLog.weight} onChange={(e) => setEditingLog({ ...editingLog, weight: Number(e.target.value) })} className="p-2 rounded-lg bg-gray-700 text-white" placeholder="Вес" />
                    <input type="number" value={editingLog.reps} onChange={(e) => setEditingLog({ ...editingLog, reps: Number(e.target.value) })} className="p-2 rounded-lg bg-gray-700 text-white" placeholder="Повторы" />
                    <input type="number" value={editingLog.sets} onChange={(e) => setEditingLog({ ...editingLog, sets: Number(e.target.value) })} className="p-2 rounded-lg bg-gray-700 text-white" placeholder="Подходы" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={updateLog} className="flex-1 p-2 bg-green-500 rounded-lg">Сохранить</button>
                    <button onClick={() => setEditingLog(null)} className="flex-1 p-2 bg-gray-600 rounded-lg">Отмена</button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{log.exercise_name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{log.weight} кг × {log.reps} повтор. × {log.sets} подход.</p>
                    <p className="text-gray-500 text-xs mt-2">{new Date(log.created_at).toLocaleString('ru-RU')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingLog({ ...log })} className="p-1.5 text-blue-400 hover:text-blue-300 transition" title="Редактировать">✏️</button>
                    <button onClick={() => setDeleteConfirm(log)} className="p-1.5 text-red-400 hover:text-red-300 transition" title="Удалить">🗑️</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно добавления подхода */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Добавить подход</h2>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-400 mb-1">Тренировка</label><select value={newLog.training_id} onChange={(e) => setNewLog({ ...newLog, training_id: Number(e.target.value) })} className="w-full p-3 rounded-lg bg-gray-700 text-white"><option value={0}>Выберите тренировку</option>{trainings.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}</select></div>
              <div><label className="block text-sm text-gray-400 mb-1">Упражнение</label><input type="text" value={newLog.exercise_name} onChange={(e) => setNewLog({ ...newLog, exercise_name: e.target.value })} placeholder="Например: Жим лежа" className="w-full p-3 rounded-lg bg-gray-700 text-white" list="exercises" /><datalist id="exercises"><option>Жим лежа</option><option>Приседания</option><option>Становая тяга</option><option>Подтягивания</option><option>Отжимания</option><option>Жим гантелей</option><option>Тяга штанги</option></datalist></div>
              <div className="grid grid-cols-3 gap-3"><div><label className="block text-sm text-gray-400 mb-1">Вес (кг)</label><input type="number" value={newLog.weight || ''} onChange={(e) => setNewLog({ ...newLog, weight: Number(e.target.value) })} className="w-full p-3 rounded-lg bg-gray-700 text-white" /></div><div><label className="block text-sm text-gray-400 mb-1">Повторения</label><input type="number" value={newLog.reps || ''} onChange={(e) => setNewLog({ ...newLog, reps: Number(e.target.value) })} className="w-full p-3 rounded-lg bg-gray-700 text-white" /></div><div><label className="block text-sm text-gray-400 mb-1">Подходы</label><input type="number" value={newLog.sets} onChange={(e) => setNewLog({ ...newLog, sets: Number(e.target.value) })} className="w-full p-3 rounded-lg bg-gray-700 text-white" /></div></div>
              <div className="flex gap-3 pt-4"><button onClick={addLog} className="flex-1 p-2 bg-green-500 rounded-lg">Сохранить</button><button onClick={() => setShowModal(false)} className="flex-1 p-2 bg-gray-600 rounded-lg">Отмена</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Подтверждение удаления */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Подтверждение удаления</h2>
            <p className="text-gray-300 mb-6">Удалить подход: <strong className="text-white">"{deleteConfirm.exercise_name}"</strong><br />{deleteConfirm.weight} кг × {deleteConfirm.reps} повтор. × {deleteConfirm.sets} подход.</p>
            <div className="flex gap-3"><button onClick={() => deleteLog(deleteConfirm)} className="flex-1 p-2 bg-red-500 rounded-lg">Удалить</button><button onClick={() => setDeleteConfirm(null)} className="flex-1 p-2 bg-gray-600 rounded-lg">Отмена</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ Recipes Page ============
function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
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
      const response = await fetch('/api/recipes', {
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
        headers: { 'Authorization': `Bearer ${token}` },
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
    const url = editingRecipe ? `/api/recipes/${editingRecipe.id}` : '/api/recipes';
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

  const openEditModal = (recipe: any) => {
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

  if (loading) return <div className="text-white text-center py-8">Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">🍳 Кулинарный блокнот</h1>
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
          + Новый рецепт
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">У вас пока нет рецептов</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-500 rounded-lg">Добавить первый рецепт</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-green-500 transition group flex flex-col">
              <div className="h-48 bg-gray-700 relative overflow-hidden flex-shrink-0">
                {recipe.image_url ? (
                  <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-700">🍲</div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEditModal(recipe)} className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg" title="Редактировать">✏️</button>
                  <button onClick={() => setDeleteConfirm(recipe)} className="p-2 bg-red-500 hover:bg-red-600 rounded-lg" title="Удалить">🗑️</button>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <a href={`/recipes/${recipe.id}`}><h3 className="text-lg font-bold text-white hover:text-green-400 transition mb-2">{recipe.title}</h3></a>
                <p className="text-gray-400 text-sm line-clamp-2 mb-3 flex-grow">{recipe.description || 'Описание отсутствует'}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded-full">⏱️ {recipe.cooking_time} мин</span>
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded-full">🔥 {recipe.calories} ккал</span>
                  {recipe.protein > 0 && <span className="text-xs px-2 py-1 bg-green-500/20 rounded-full">🥩 {recipe.protein}г</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">{editingRecipe ? 'Редактировать рецепт' : 'Новый рецепт'}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-400 mb-1">Название*</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 rounded-lg bg-gray-700 text-white" placeholder="Например: Протеиновый смузи" /></div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Картинка</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg">{uploading ? 'Загрузка...' : '📷 Загрузить картинку'}</button>
                  {formData.image_url && <button type="button" onClick={() => setFormData({ ...formData, image_url: '' })} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">🗑️ Удалить</button>}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
                {formData.image_url && <div className="mt-2 w-32 h-32"><img src={formData.image_url} alt="Preview" className="w-full h-full object-cover rounded-lg" /></div>}
              </div>
              <div><label className="block text-sm text-gray-400 mb-1">Краткое описание</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 rounded-lg bg-gray-700 text-white" rows={2} placeholder="Коротко о рецепте..." /></div>
              <div><label className="block text-sm text-gray-400 mb-1">Ингредиенты</label><textarea value={formData.ingredients} onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })} className="w-full p-3 rounded-lg bg-gray-700 text-white" rows={4} placeholder="Курица - 200 г&#10;Рис - 150 г&#10;Брокколи - 100 г" /></div>
              <div><label className="block text-sm text-gray-400 mb-1">Приготовление</label><textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} className="w-full p-3 rounded-lg bg-gray-700 text-white" rows={5} placeholder="1. Нарезать курицу...&#10;2. Отварить рис..." /></div>
              <div className="grid grid-cols-5 gap-3">
                <div><label className="text-sm text-gray-400">Время (мин)</label><input type="number" value={formData.cooking_time} onChange={(e) => setFormData({ ...formData, cooking_time: Number(e.target.value) })} className="w-full p-3 rounded-lg bg-gray-700 text-white" /></div>
                <div><label className="text-sm text-gray-400">Калории</label><input type="number" value={formData.calories} onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })} className="w-full p-3 rounded-lg bg-gray-700 text-white" /></div>
                <div><label className="text-sm text-gray-400">Белки (г)</label><input type="number" value={formData.protein} onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })} className="w-full p-3 rounded-lg bg-gray-700 text-white" /></div>
                <div><label className="text-sm text-gray-400">Жиры (г)</label><input type="number" value={formData.fats} onChange={(e) => setFormData({ ...formData, fats: Number(e.target.value) })} className="w-full p-3 rounded-lg bg-gray-700 text-white" /></div>
                <div><label className="text-sm text-gray-400">Углеводы (г)</label><input type="number" value={formData.carbs} onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })} className="w-full p-3 rounded-lg bg-gray-700 text-white" /></div>
              </div>
              <div className="flex gap-3 pt-4"><button onClick={saveRecipe} className="flex-1 p-2 bg-green-500 rounded-lg">{editingRecipe ? 'Сохранить' : 'Создать'}</button><button onClick={() => setShowModal(false)} className="flex-1 p-2 bg-gray-600 rounded-lg">Отмена</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Подтверждение удаления */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Удалить рецепт?</h2>
            <p className="text-gray-300 mb-6">Вы уверены, что хотите удалить <strong>"{deleteConfirm.title}"</strong>?</p>
            <div className="flex gap-3"><button onClick={deleteRecipe} className="flex-1 p-2 bg-red-500 rounded-lg">Удалить</button><button onClick={() => setDeleteConfirm(null)} className="flex-1 p-2 bg-gray-600 rounded-lg">Отмена</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ AI Page ============
// ============ AI Page ============
function AIPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions || []
      }]);
    } catch (error) {
      console.error('Ошибка:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Ошибка соединения. Попробуйте позже.',
        timestamp: new Date(),
        suggestions: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">🤖</span> AI Тренер
        </h1>
        <p className="text-gray-400 text-sm">Задай вопрос о тренировках, питании или технике упражнений</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-gray-800/30 rounded-xl p-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-4">💬 Напиши "привет" чтобы начать</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => sendMessage("Программа для новичка")} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full">📋 Программа для новичка</button>
              <button onClick={() => sendMessage("Техника приседаний")} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full">🏋️ Техника приседаний</button>
              <button onClick={() => sendMessage("Питание для набора массы")} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full">🥗 Питание</button>
              <button onClick={() => sendMessage("Как похудеть")} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full">🔥 Похудение</button>
              <button onClick={() => sendMessage("Тренировка дома")} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full">🏠 Тренировка дома</button>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 whitespace-pre-wrap ${msg.role === 'user' ? 'bg-green-500' : 'bg-gray-700'}`}>
                <div className="text-white">{msg.content}</div>
                <div className="text-xs text-gray-300 mt-2">
                  {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 ml-2">
                {msg.suggestions.map((suggestion: string, sIdx: number) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-full transition cursor-pointer"
                  >
                    💡 {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Напиши вопрос о тренировках..."
          className="flex-1 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          rows={2}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition disabled:opacity-50"
        >
          Отправить
        </button>
      </div>
    </div>
  );
}

// ============ App ============
function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={token ? <Layout><DashboardPage /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/trainings" element={token ? <Layout><TrainingsPage /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/journal" element={token ? <Layout><JournalPage /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/recipes" element={token ? <Layout><RecipesPage /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/ai" element={token ? <Layout><AIPage /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/recipes/:id" element={token ? <Layout><RecipeDetail /></Layout> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;