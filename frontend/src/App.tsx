import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

// ============ Вспомогательная функция для API запросов ============
async function apiRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response;
}

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
      const response = await fetch('/api/auth/login', {
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
        <input type="text" placeholder="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" required />
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });
      if (response.ok) {
        const loginResponse = await fetch('/api/auth/login', {
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
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" required />
        <input type="text" placeholder="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" required />
        <button type="submit" disabled={loading} className="w-full p-3 bg-green-500 hover:bg-green-600 rounded-lg font-bold transition disabled:opacity-50">{loading ? 'Регистрация...' : 'Зарегистрироваться'}</button>
        <p className="text-center text-gray-400 mt-4">Уже есть аккаунт? <a href="/login" className="text-green-400 hover:underline">Войти</a></p>
      </form>
    </div>
  );
}

// ============ Dashboard Page ============
function DashboardPage() {
  const [stats, setStats] = useState({ trainings: 0, logs: 0, totalWeight: 0, username: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [meRes, trainingsRes, logsRes] = await Promise.all([
          apiRequest('/api/auth/me'),
          apiRequest('/api/trainings/'),
          apiRequest('/api/trainings/logs')
        ]);
        const user = await meRes.json();
        const trainings = await trainingsRes.json();
        const logs = await logsRes.json();
        const totalWeight = logs.reduce((sum: number, log: any) => sum + (log.weight * log.reps * log.sets), 0);
        setStats({ username: user.username, trainings: trainings.length, logs: logs.length, totalWeight: totalWeight });
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    loadStats();
  }, []);

  if (loading) return <div className="text-white text-center py-8">Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Привет, {stats.username}! 👋</h1>
        <p className="text-gray-300">Твоя статистика:</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-6"><h3 className="text-gray-400">Тренировок</h3><p className="text-3xl font-bold text-white mt-2">{stats.trainings}</p></div>
        <div className="bg-gray-800 rounded-xl p-6"><h3 className="text-gray-400">Подходов</h3><p className="text-3xl font-bold text-white mt-2">{stats.logs}</p></div>
        <div className="bg-gray-800 rounded-xl p-6"><h3 className="text-gray-400">Общий тоннаж (кг)</h3><p className="text-3xl font-bold text-white mt-2">{Math.round(stats.totalWeight)}</p></div>
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

  const loadTrainings = async () => {
    try { const response = await apiRequest('/api/trainings/'); setTrainings(await response.json()); } catch (error) { console.error(error); } finally { setLoading(false); }
  };
  const createTraining = async () => {
    if (!newTrainingName.trim()) return;
    try { await apiRequest('/api/trainings/', { method: 'POST', body: JSON.stringify({ name: newTrainingName }) }); setNewTrainingName(''); setShowModal(false); loadTrainings(); } catch (error) { console.error(error); }
  };
  useEffect(() => { loadTrainings(); }, []);

  if (loading) return <div className="text-white text-center py-8">Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Мои тренировки</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition">+ Новая тренировка</button>
      </div>
      {trainings.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center"><p className="text-gray-400 mb-4">У вас пока нет тренировок</p><button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-500 rounded-lg">Создать первую тренировку</button></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainings.map((training) => (<div key={training.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700"><h3 className="text-lg font-semibold text-white">{training.name}</h3><p className="text-gray-400 text-sm mt-2">{new Date(training.created_at).toLocaleDateString('ru-RU')}</p></div>))}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md"><h2 className="text-xl font-bold text-white mb-4">Новая тренировка</h2><input type="text" value={newTrainingName} onChange={(e) => setNewTrainingName(e.target.value)} placeholder="Название тренировки" className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" autoFocus /><div className="flex gap-3"><button onClick={createTraining} className="flex-1 p-2 bg-green-500 rounded-lg">Создать</button><button onClick={() => setShowModal(false)} className="flex-1 p-2 bg-gray-600 rounded-lg">Отмена</button></div></div>
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
  const [newLog, setNewLog] = useState({ training_id: 0, exercise_name: '', weight: 0, reps: 0, sets: 1 });

  const loadData = async () => {
    try { const [logsRes, trainingsRes] = await Promise.all([apiRequest('/api/trainings/logs'), apiRequest('/api/trainings/')]); setLogs(await logsRes.json()); setTrainings(await trainingsRes.json()); } catch (error) { console.error(error); } finally { setLoading(false); }
  };
  const addLog = async () => {
    if (!newLog.training_id || !newLog.exercise_name || newLog.weight <= 0 || newLog.reps <= 0) { alert('Заполните все поля'); return; }
    try { await apiRequest('/api/trainings/logs', { method: 'POST', body: JSON.stringify(newLog) }); setShowModal(false); setNewLog({ training_id: 0, exercise_name: '', weight: 0, reps: 0, sets: 1 }); loadData(); } catch (error) { console.error(error); }
  };
  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="text-white text-center py-8">Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4"><h1 className="text-2xl font-bold text-white">Журнал подходов</h1><button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-500 rounded-lg">+ Добавить подход</button></div>
      {logs.length === 0 ? (<div className="bg-gray-800 rounded-xl p-12 text-center"><p className="text-gray-400">Нет записей о подходах</p><button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-green-500 rounded-lg">Добавить первый подход</button></div>) : (<div className="space-y-3">{logs.map((log) => (<div key={log.id} className="bg-gray-800 rounded-xl p-4"><h3 className="text-lg font-semibold text-white">{log.exercise_name}</h3><p className="text-gray-400 text-sm">{log.weight} кг × {log.reps} повтор. × {log.sets} подход.</p><p className="text-gray-500 text-xs">{new Date(log.created_at).toLocaleString()}</p></div>))}</div>)}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md"><h2 className="text-xl font-bold text-white mb-4">Добавить подход</h2><div className="space-y-4"><div><label className="text-sm text-gray-400">Тренировка</label><select value={newLog.training_id} onChange={(e) => setNewLog({ ...newLog, training_id: Number(e.target.value) })} className="w-full p-3 rounded-lg bg-gray-700 text-white"><option value={0}>Выберите тренировку</option>{trainings.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}</select></div><div><label className="text-sm text-gray-400">Упражнение</label><input type="text" value={newLog.exercise_name} onChange={(e) => setNewLog({ ...newLog, exercise_name: e.target.value })} placeholder="Например: Жим лежа" className="w-full p-3 rounded-lg bg-gray-700 text-white" /></div><div className="grid grid-cols-3 gap-3"><div><label className="text-sm text-gray-400">Вес (кг)</label><input type="number" value={newLog.weight || ''} onChange={(e) => setNewLog({ ...newLog, weight: Number(e.target.value) })} className="w-full p-3 rounded-lg bg-gray-700 text-white" /></div><div><label className="text-sm text-gray-400">Повторения</label><input type="number" value={newLog.reps || ''} onChange={(e) => setNewLog({ ...newLog, reps: Number(e.target.value) })} className="w-full p-3 rounded-lg bg-gray-700 text-white" /></div><div><label className="text-sm text-gray-400">Подходы</label><input type="number" value={newLog.sets} onChange={(e) => setNewLog({ ...newLog, sets: Number(e.target.value) })} className="w-full p-3 rounded-lg bg-gray-700 text-white" /></div></div><div className="flex gap-3 pt-4"><button onClick={addLog} className="flex-1 p-2 bg-green-500 rounded-lg">Сохранить</button><button onClick={() => setShowModal(false)} className="flex-1 p-2 bg-gray-600 rounded-lg">Отмена</button></div></div></div>
        </div>
      )}
    </div>
  );
}

// ============ AI Page (РАБОЧАЯ ВЕРСИЯ С ПОДСКАЗКАМИ) ============
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
        content: '❌ Ошибка соединения с сервером. Попробуйте позже.',
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
              <button onClick={() => sendMessage("Программа для новичка")} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full transition">📋 Программа для новичка</button>
              <button onClick={() => sendMessage("Техника приседаний")} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full transition">🏋️ Техника приседаний</button>
              <button onClick={() => sendMessage("Питание для набора массы")} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full transition">🥗 Питание</button>
              <button onClick={() => sendMessage("Как похудеть")} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full transition">🔥 Похудение</button>
              <button onClick={() => sendMessage("Тренировка дома")} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full transition">🏠 Тренировка дома</button>
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

            {/* Кнопки-подсказки */}
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/trainings" element={<Layout><TrainingsPage /></Layout>} />
        <Route path="/journal" element={<Layout><JournalPage /></Layout>} />
        <Route path="/ai" element={<Layout><AIPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;