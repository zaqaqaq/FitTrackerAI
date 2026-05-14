import { useState, useEffect } from 'react';
import { Trophy, Target, Flame, Award, Star, Calendar, Dumbbell, Zap, Activity, Heart, Crown, TrendingUp } from 'lucide-react';

// ============ ИКОНКИ (ОПРЕДЕЛЯЕМ ДО ИСПОЛЬЗОВАНИЯ) ============
const SunIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface AchievementsProps {
  logs: any[];
  trainings: any[];
  stats: {
    totalTrainings: number;
    totalLogs: number;
    totalWeight: number;
    bestWeight: number;
  };
}

export default function Achievements({ logs, trainings, stats }: AchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first_workout', name: 'Первый шаг', description: 'Заверши первую тренировку', icon: <Star className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'ten_workouts', name: 'Начинающий атлет', description: 'Заверши 10 тренировок', icon: <Target className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 10 },
    { id: 'fifty_workouts', name: 'Опытный боец', description: 'Заверши 50 тренировок', icon: <Trophy className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 50 },
    { id: 'hundred_workouts', name: 'Железный человек', description: 'Заверши 100 тренировок', icon: <Award className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 100 },
    { id: 'first_hundred_kg', name: 'Сотня', description: 'Подними вес 100 кг', icon: <Zap className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 100 },
    { id: 'two_hundred_kg', name: 'Тяжёлая артиллерия', description: 'Подними вес 200 кг', icon: <Flame className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 200 },
    { id: 'tonnage_1000', name: 'Тысяча тонн', description: 'Набери тоннаж 1000 кг', icon: <Dumbbell className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 1000 },
    { id: 'tonnage_10000', name: 'Десять тысяч тонн', description: 'Набери тоннаж 10000 кг', icon: <Dumbbell className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 10000 },
    { id: 'seven_days_streak', name: 'Неделя силы', description: 'Тренируйся 7 дней подряд', icon: <Calendar className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 7 },
    { id: 'thirty_days_streak', name: 'Месяц без остановки', description: 'Тренируйся 30 дней подряд', icon: <Flame className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 30 },
    { id: 'pr_bench', name: 'Король жима', description: 'Жим лёжа 100+ кг', icon: <Crown className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 100 },
    { id: 'pr_squat', name: 'Король приседа', description: 'Приседания 120+ кг', icon: <Crown className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 120 },
    { id: 'pr_deadlift', name: 'Король тяги', description: 'Становая тяга 140+ кг', icon: <Crown className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 140 },
    { id: 'five_exercises', name: 'Универсал', description: 'Выполни 5 разных упражнений', icon: <Activity className="h-5 w-5" />, unlocked: false, progress: 0, maxProgress: 5 },
    { id: 'early_bird', name: 'Ранняя пташка', description: 'Потренируйся до 8 утра', icon: <SunIcon />, unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'night_owl', name: 'Ночная сова', description: 'Потренируйся после 22:00', icon: <MoonIcon />, unlocked: false, progress: 0, maxProgress: 1 },
  ]);

  const calculateStreak = () => {
    if (logs.length === 0) return 0;
    const dates = [...new Set(logs.map(log => new Date(log.created_at).toDateString()))];
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const diff = (new Date(dates[i]).getTime() - new Date(dates[i + 1]).getTime()) / 86400000;
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  };

  useEffect(() => {
    const streak = calculateStreak();
    const maxWeight = logs.length > 0 ? Math.max(...logs.map(l => l.weight)) : 0;

    const benchMax = Math.max(...logs.filter(l => l.exercise_name.toLowerCase().includes('жим')).map(l => l.weight), 0);
    const squatMax = Math.max(...logs.filter(l => l.exercise_name.toLowerCase().includes('присед')).map(l => l.weight), 0);
    const deadliftMax = Math.max(...logs.filter(l => l.exercise_name.toLowerCase().includes('становая') || l.exercise_name.toLowerCase().includes('тяга')).map(l => l.weight), 0);

    const uniqueExercises = new Set(logs.map(l => l.exercise_name)).size;

    const hasEarlyWorkout = logs.some(l => new Date(l.created_at).getHours() < 8);
    const hasLateWorkout = logs.some(l => new Date(l.created_at).getHours() >= 22);

    const updated = achievements.map(ach => {
      let progress = 0;
      let unlocked = false;

      if (ach.id === 'first_workout') { progress = Math.min(stats.totalTrainings, 1); unlocked = stats.totalTrainings >= 1; }
      else if (ach.id === 'ten_workouts') { progress = Math.min(stats.totalTrainings, 10); unlocked = stats.totalTrainings >= 10; }
      else if (ach.id === 'fifty_workouts') { progress = Math.min(stats.totalTrainings, 50); unlocked = stats.totalTrainings >= 50; }
      else if (ach.id === 'hundred_workouts') { progress = Math.min(stats.totalTrainings, 100); unlocked = stats.totalTrainings >= 100; }
      else if (ach.id === 'first_hundred_kg') { progress = Math.min(maxWeight, 100); unlocked = maxWeight >= 100; }
      else if (ach.id === 'two_hundred_kg') { progress = Math.min(maxWeight, 200); unlocked = maxWeight >= 200; }
      else if (ach.id === 'tonnage_1000') { progress = Math.min(stats.totalWeight, 1000); unlocked = stats.totalWeight >= 1000; }
      else if (ach.id === 'tonnage_10000') { progress = Math.min(stats.totalWeight, 10000); unlocked = stats.totalWeight >= 10000; }
      else if (ach.id === 'seven_days_streak') { progress = Math.min(streak, 7); unlocked = streak >= 7; }
      else if (ach.id === 'thirty_days_streak') { progress = Math.min(streak, 30); unlocked = streak >= 30; }
      else if (ach.id === 'pr_bench') { progress = Math.min(benchMax, 100); unlocked = benchMax >= 100; }
      else if (ach.id === 'pr_squat') { progress = Math.min(squatMax, 120); unlocked = squatMax >= 120; }
      else if (ach.id === 'pr_deadlift') { progress = Math.min(deadliftMax, 140); unlocked = deadliftMax >= 140; }
      else if (ach.id === 'five_exercises') { progress = Math.min(uniqueExercises, 5); unlocked = uniqueExercises >= 5; }
      else if (ach.id === 'early_bird') { progress = hasEarlyWorkout ? 1 : 0; unlocked = hasEarlyWorkout; }
      else if (ach.id === 'night_owl') { progress = hasLateWorkout ? 1 : 0; unlocked = hasLateWorkout; }

      return { ...ach, unlocked, progress };
    });

    setAchievements(updated);
  }, [logs, trainings, stats]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Достижения
          </h2>
          <p className="text-gray-400 text-sm">Получено {unlockedCount} из {achievements.length}</p>
        </div>
        <div className="bg-gray-700 rounded-lg px-3 py-1">
          <span className="text-sm text-gray-300">{Math.round((unlockedCount / achievements.length) * 100)}%</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {achievements.map((ach) => (
          <div key={ach.id} className={`p-3 rounded-lg transition ${ach.unlocked ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50' : 'bg-gray-700/30 border border-gray-600'}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${ach.unlocked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-600 text-gray-500'}`}>
                {ach.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-sm ${ach.unlocked ? 'text-yellow-400' : 'text-gray-300'}`}>{ach.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{ach.description}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Прогресс</span>
                    <span>{ach.progress} / {ach.maxProgress}</span>
                  </div>
                  <div className="h-1.5 bg-gray-600 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${ach.unlocked ? 'bg-yellow-400' : 'bg-green-500'}`} style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}