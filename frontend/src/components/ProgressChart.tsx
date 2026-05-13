import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar
} from 'recharts';
import { TrendingUp, Dumbbell, Calendar, Award, Activity, Target } from 'lucide-react';

interface ProgressData {
  date: string;
  weight: number;
  reps: number;
  volume: number;
  oneRepMax: number;
}

interface ProgressChartProps {
  exerciseName: string;
  logs: any[];
}

export default function ProgressChart({ exerciseName, logs }: ProgressChartProps) {
  const [chartData, setChartData] = useState<ProgressData[]>([]);
  const [viewType, setViewType] = useState<'weight' | 'volume' | '1rm'>('weight');
  const [stats, setStats] = useState({
    bestWeight: 0,
    bestVolume: 0,
    bestOneRepMax: 0,
    totalSets: 0,
    totalReps: 0,
    progress: 0,
    avgWeight: 0
  });

  useEffect(() => {
    // Фильтруем логи только по выбранному упражнению
    const exerciseLogs = logs.filter(log =>
      log.exercise_name.toLowerCase() === exerciseName.toLowerCase()
    );

    // Сортируем по дате
    const sortedLogs = [...exerciseLogs].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Формируем данные для графика
    const data = sortedLogs.map(log => {
      const volume = log.weight * log.reps * log.sets;
      const oneRepMax = Math.round(log.weight * (1 + log.reps / 30)); // Формула Бжицки
      return {
        date: new Date(log.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        weight: log.weight,
        reps: log.reps,
        volume: volume,
        oneRepMax: oneRepMax
      };
    });

    setChartData(data);

    // Вычисляем статистику
    if (sortedLogs.length > 0) {
      const bestWeight = Math.max(...sortedLogs.map(l => l.weight));
      const bestVolume = Math.max(...sortedLogs.map(l => l.weight * l.reps * l.sets));
      const bestOneRepMax = Math.max(...sortedLogs.map(l => Math.round(l.weight * (1 + l.reps / 30))));
      const totalSets = sortedLogs.reduce((sum, l) => sum + l.sets, 0);
      const totalReps = sortedLogs.reduce((sum, l) => sum + l.reps * l.sets, 0);
      const avgWeight = sortedLogs.reduce((sum, l) => sum + l.weight, 0) / sortedLogs.length;

      // Прогресс (сравнение первых и последних 3 тренировок)
      const firstThree = sortedLogs.slice(0, 3);
      const lastThree = sortedLogs.slice(-3);
      const firstAvg = firstThree.reduce((sum, l) => sum + l.weight, 0) / firstThree.length;
      const lastAvg = lastThree.reduce((sum, l) => sum + l.weight, 0) / lastThree.length;
      const progress = lastAvg - firstAvg;

      setStats({
        bestWeight,
        bestVolume,
        bestOneRepMax,
        totalSets,
        totalReps,
        progress: parseFloat(progress.toFixed(1)),
        avgWeight: parseFloat(avgWeight.toFixed(1))
      });
    }
  }, [logs, exerciseName]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-xl">
        <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">Нет данных для отображения прогресса</p>
        <p className="text-gray-500 text-sm mt-2">Добавь подходы в журнал, чтобы увидеть графики</p>
      </div>
    );
  }

  const getChartTitle = () => {
    if (viewType === 'weight') return 'Вес (кг)';
    if (viewType === 'volume') return 'Объём (кг)';
    return '1 ПМ (кг)';
  };

  const getChartColor = () => {
    if (viewType === 'weight') return '#22c55e';
    if (viewType === 'volume') return '#3b82f6';
    return '#eab308';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Прогресс: {exerciseName}
          </h3>
          <p className="text-gray-400 text-sm mt-1">Последние {chartData.length} тренировок</p>
        </div>

        {/* Переключатель типа графика */}
        <div className="flex gap-2 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewType('weight')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewType === 'weight'
                ? 'bg-green-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📊 Вес
          </button>
          <button
            onClick={() => setViewType('volume')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewType === 'volume'
                ? 'bg-green-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📈 Объём
          </button>
          <button
            onClick={() => setViewType('1rm')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewType === '1rm'
                ? 'bg-green-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            🏆 1 ПМ
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <Dumbbell className="h-4 w-4 text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{stats.bestWeight}</p>
          <p className="text-xs text-gray-400">Макс. вес (кг)</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <Activity className="h-4 w-4 text-blue-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{stats.bestVolume.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Макс. объём</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <Target className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{stats.bestOneRepMax}</p>
          <p className="text-xs text-gray-400">1 ПМ (кг)</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <Calendar className="h-4 w-4 text-purple-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{stats.totalSets}</p>
          <p className="text-xs text-gray-400">Всего подходов</p>
        </div>
      </div>

      {/* График */}
      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Legend />
            {viewType === 'weight' && (
              <>
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Вес (кг)"
                  stroke={getChartColor()}
                  strokeWidth={3}
                  dot={{ fill: getChartColor(), r: 5 }}
                  activeDot={{ r: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  name="Тренд"
                  fill={getChartColor()}
                  fillOpacity={0.1}
                  stroke="none"
                />
              </>
            )}
            {viewType === 'volume' && (
              <Bar dataKey="volume" name="Объём (кг)" fill={getChartColor()} radius={[4, 4, 0, 0]} />
            )}
            {viewType === '1rm' && (
              <Line
                type="monotone"
                dataKey="oneRepMax"
                name="1 ПМ (кг)"
                stroke={getChartColor()}
                strokeWidth={3}
                dot={{ fill: getChartColor(), r: 5 }}
                activeDot={{ r: 8 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Прогноз и советы */}
      <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
        <p className="text-sm text-gray-300 flex items-center gap-2">
          <Award className="h-4 w-4 text-yellow-400" />
          {stats.progress > 0 ? (
            <span>📈 Отлично! Твой прогресс: +{stats.progress} кг к среднему весу! Так держать! 💪</span>
          ) : stats.progress < 0 ? (
            <span>📉 Внимание! Твой средний вес снизился на {Math.abs(stats.progress)} кг. Попробуй увеличить нагрузку или отдохнуть! 🔥</span>
          ) : (
            <span>⚖️ Вес стабилен. Попробуй добавить 2.5 кг на следующей тренировке для прогресса!</span>
          )}
        </p>
        {stats.avgWeight > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            💡 Средний вес за все тренировки: {stats.avgWeight} кг.
            {stats.bestWeight > stats.avgWeight && ` Твой рекорд: ${stats.bestWeight} кг (на ${Math.round(stats.bestWeight - stats.avgWeight)} кг больше среднего)!`}
          </p>
        )}
      </div>
    </div>
  );
}