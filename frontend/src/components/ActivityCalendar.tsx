import { useState, useEffect } from 'react';
import { Calendar, Flame, TrendingUp, Award } from 'lucide-react';

interface ActivityCalendarProps {
  logs: any[];
}

export default function ActivityCalendar({ logs }: ActivityCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    currentStreak: 0,
    bestStreak: 0,
    totalWorkouts: 0,
    avgPerWeek: 0
  });

  // Получаем дни с тренировками
  const getWorkoutDays = () => {
    const workoutDates = new Set(
      logs.map(log => new Date(log.created_at).toDateString())
    );
    return workoutDates;
  };

  // Рассчитываем серию (streak)
  const calculateStreak = () => {
    const workoutDates = getWorkoutDays();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (!workoutDates.has(today) && !workoutDates.has(yesterday)) return 0;

    let streak = 0;
    let currentDate = new Date();

    while (true) {
      const dateStr = currentDate.toDateString();
      if (workoutDates.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Находим лучшую серию
  const calculateBestStreak = () => {
    const workoutDates = getWorkoutDays();
    const sortedDates = Array.from(workoutDates).sort();

    let currentStreak = 1;
    let bestStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.floor((curr.getTime() - prev.getTime()) / 86400000);

      if (diffDays === 1) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return bestStreak;
  };

  // Генерируем календарь
  const generateCalendar = () => {
    const workoutDays = getWorkoutDays();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const daysInMonth = lastDayOfMonth.getDate();
    const calendar = [];

    // Пустые дни в начале
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(null);
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const hasWorkout = workoutDays.has(date.toDateString());
      calendar.push({ day, hasWorkout, date });
    }

    setCalendarData(calendar);
  };

  useEffect(() => {
    generateCalendar();
    setStats({
      currentStreak: calculateStreak(),
      bestStreak: calculateBestStreak(),
      totalWorkouts: getWorkoutDays().size,
      avgPerWeek: Math.round((getWorkoutDays().size / (new Date().getDay() + 1)) * 7)
    });
  }, [logs, selectedMonth, selectedYear]);

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-400" />
          Календарь активности
        </h3>
        <p className="text-gray-400 text-sm mt-1">Отслеживай регулярность тренировок</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <Flame className="h-5 w-5 text-orange-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
          <p className="text-xs text-gray-400">Текущая серия (дней)</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <Award className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{stats.bestStreak}</p>
          <p className="text-xs text-gray-400">Лучшая серия (дней)</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{stats.totalWorkouts}</p>
          <p className="text-xs text-gray-400">Всего дней с тренировками</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <Calendar className="h-5 w-5 text-blue-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{stats.avgPerWeek}</p>
          <p className="text-xs text-gray-400">В среднем в неделю</p>
        </div>
      </div>

      {/* Навигация по месяцам */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => {
            if (selectedMonth === 0) {
              setSelectedMonth(11);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          ◀
        </button>
        <h4 className="text-lg font-semibold text-white">
          {monthNames[selectedMonth]} {selectedYear}
        </h4>
        <button
          onClick={() => {
            if (selectedMonth === 11) {
              setSelectedMonth(0);
              setSelectedYear(selectedYear + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          ▶
        </button>
        <button
          onClick={() => {
            setSelectedMonth(new Date().getMonth());
            setSelectedYear(new Date().getFullYear());
          }}
          className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg text-sm transition"
        >
          Сегодня
        </button>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {weekDays.map(day => (
          <div key={day} className="text-xs text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Календарь */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((item, idx) => (
          <div
            key={idx}
            className={`aspect-square rounded-lg p-1 text-center transition ${
              item
                ? item.hasWorkout
                  ? 'bg-green-500/30 border border-green-500 hover:bg-green-500/50 cursor-pointer'
                  : 'bg-gray-700/30 hover:bg-gray-600/30'
                : 'bg-transparent'
            }`}
            title={item ? `Тренировка была ${new Date(item.date).toLocaleDateString('ru-RU')}` : ''}
          >
            {item && (
              <div className="h-full flex flex-col items-center justify-center">
                <span className={`text-sm font-medium ${item.hasWorkout ? 'text-green-400' : 'text-gray-500'}`}>
                  {item.day}
                </span>
                {item.hasWorkout && (
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-0.5"></div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Легенда */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-400">Тренировка была</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-700"></div>
          <span className="text-xs text-gray-400">Без тренировки</span>
        </div>
      </div>

      {/* Мотивация */}
      {stats.currentStreak > 0 && (
        <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
          <p className="text-sm text-green-400 flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Отлично! Твоя текущая серия: <strong>{stats.currentStreak} дня(ей)</strong> подряд!
            {stats.currentStreak === stats.bestStreak && stats.bestStreak > 1 && (
              <span> Это твой рекорд! 🔥</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}