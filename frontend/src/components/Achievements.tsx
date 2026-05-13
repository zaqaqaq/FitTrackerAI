import { useState, useEffect } from 'react';
import { Trophy, Target, Flame, Award, Star, Calendar, Dumbbell, Zap, Lock } from 'lucide-react';

// Иконки для дополнительных ачивок (определяем ДО их использования)
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
  condition: (data: any) => boolean;
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
    totalDays: number;
  };
}

export default function Achievements({ logs, trainings, stats }: AchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_workout',
      name: 'Первый шаг',
      description: 'Заверши первую тренировку',
      icon: <Star className="h-5 w-5" />,
      condition: (data) => data.trainings.length >= 1,
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'ten_workouts',
      name: 'Начинающий атлет',
      description: 'Заверши 10 тренировок',
      icon: <Target className="h-5 w-5" />,
      condition: (data) => data.trainings.length >= 10,
      unlocked: false,
      progress: 0,
      maxProgress: 10
    },
    {
      id: 'fifty_workouts',
      name: 'Опытный боец',
      description: 'Заверши 50 тренировок',
      icon: <Trophy className="h-5 w-5" />,
      condition: (data) => data.trainings.length >= 50,
      unlocked: false,
      progress: 0,
      maxProgress: 50
    },
    {
      id: 'hundred_workouts',
      name: 'Железный человек',
      description: 'Заверши 100 тренировок',
      icon: <Award className="h-5 w-5" />,
      condition: (data) => data.trainings.length >= 100,
      unlocked: false,
      progress: 0,
      maxProgress: 100
    },
    {
      id: 'first_hundred_kg',
      name: 'Сотня',
      description: 'Подними вес 100 кг в любом упражнении',
      icon: <Zap className="h-5 w-5" />,
      condition: (data) => data.logs.some((l: any) => l.weight >= 100),
      unlocked: false,
      progress: 0,
      maxProgress: 100
    },
    {
      id: 'two_hundred_kg',
      name: 'Тяжёлая артиллерия',
      description: 'Подними вес 200 кг в любом упражнении',
      icon: <Flame className="h-5 w-5" />,
      condition: (data) => data.logs.some((l: any) => l.weight >= 200),
      unlocked: false,
      progress: 0,
      maxProgress: 200
    },
    {
      id: 'tonnage_1000',
      name: 'Тысяча тонн',
      description: 'Набери общий тоннаж 1000 кг',
      icon: <Dumbbell className="h-5 w-5" />,
      condition: (data) => data.totalWeight >= 1000,
      unlocked: false,
      progress: 0,
      maxProgress: 1000
    },
    {
      id: 'tonnage_10000',
      name: 'Десять тысяч тонн',
      description: 'Набери общий тоннаж 10 000 кг',
      icon: <Dumbbell className="h-5 w-5" />,
      condition: (data) => data.totalWeight >= 10000,
      unlocked: false,
      progress: 0,
      maxProgress: 10000
    },
    {
      id: 'seven_days_streak',
      name: 'Неделя силы',
      description: 'Тренируйся 7 дней подряд',
      icon: <Calendar className="h-5 w-5" />,
      condition: (data) => data.streak >= 7,
      unlocked: false,
      progress: 0,
      maxProgress: 7
    },
    {
      id: 'thirty_days_streak',
      name: 'Месяц без остановки',
      description: 'Тренируйся 30 дней подряд',
      icon: <Flame className="h-5 w-5" />,
      condition: (data) => data.streak >= 30,
      unlocked: false,
      progress: 0,
      maxProgress: 30
    },
    {
      id: 'pr_bench',
      name: 'Король жима',
      description: 'Установи личный рекорд в жиме лёжа (100+ кг)',
      icon: <Trophy className="h-5 w-5" />,
      condition: (data) => {
        const benchLogs = data.logs.filter((l: any) =>
          l.exercise_name.toLowerCase().includes('жим') &&
          l.weight >= 100
        );
        return benchLogs.length > 0;
      },
      unlocked: false,
      progress: 0,
      maxProgress: 100
    },
    {
      id: 'pr_squat',
      name: 'Король приседа',
      description: 'Установи личный рекорд в приседаниях (120+ кг)',
      icon: <Trophy className="h-5 w-5" />,
      condition: (data) => {
        const squatLogs = data.logs.filter((l: any) =>
          l.exercise_name.toLowerCase().includes('присед') &&
          l.weight >= 120
        );
        return squatLogs.length > 0;
      },
      unlocked: false,
      progress: 0,
      maxProgress: 120
    },
    {
      id: 'pr_deadlift',
      name: 'Король тяги',
      description: 'Установи личный рекорд в становой тяге (140+ кг)',
      icon: <Trophy className="h-5 w-5" />,
      condition: (data) => {
        const deadliftLogs = data.logs.filter((l: any) =>
          (l.exercise_name.toLowerCase().includes('становая') || l.exercise_name.toLowerCase().includes('тяга')) &&
          l.weight >= 140
        );
        return deadliftLogs.length > 0;
      },
      unlocked: false,
      progress: 0,
      maxProgress: 140
    },
    {
      id: 'five_exercises',
      name: 'Универсал',
      description: 'Выполни 5 разных упражнений',
      icon: <Star className="h-5 w-5" />,
      condition: (data) => {
        const uniqueExercises = new Set(data.logs.map((l: any) => l.exercise_name));
        return uniqueExercises.size >= 5;
      },
      unlocked: false,
      progress: 0,
      maxProgress: 5
    },
    {
      id: 'early_bird',
      name: 'Ранняя пташка',
      description: 'Потренируйся до 8 утра',
      icon: <SunIcon />,
      condition: (data) => {
        return data.logs.some((l: any) => {
          const hour = new Date(l.created_at).getHours();
          return hour < 8;
        });
      },
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'night_owl',
      name: 'Ночная сова',
      description: 'Потренируйся после 22:00',
      icon: <MoonIcon />,
      condition: (data) => {
        return data.logs.some((l: any) => {
          const hour = new Date(l.created_at).getHours();
          return hour >= 22;
        });
      },
      unlocked: false,
      progress: 0,
      maxProgress: 1
    }
  ]);

  const calculateStreak = (logs: any[]) => {
    if (logs.length === 0) return 0;

    const dates = [...new Set(logs.map((log: any) =>
      new Date(log.created_at).toDateString()
    ))];

    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 1;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]);
      const next = new Date(dates[i + 1]);
      const diffDays = Math.floor((current.getTime() - next.getTime()) / 86400000);

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // Рассчитываем прогресс
  useEffect(() => {
    const data = {
      logs,
      trainings,
      totalWeight: stats.totalWeight,
      streak: calculateStreak(logs)
    };

    const updatedAchievements = achievements.map(achievement => {
      let progress = 0;
      let maxProgress = achievement.maxProgress;
      let unlocked = achievement.condition(data);

      // Рассчитываем прогресс для конкретных ачивок
      if (achievement.id === 'ten_workouts') {
        progress = Math.min(data.trainings.length, maxProgress);
      } else if (achievement.id === 'fifty_workouts') {
        progress = Math.min(data.trainings.length, maxProgress);
      } else if (achievement.id === 'hundred_workouts') {
        progress = Math.min(data.trainings.length, maxProgress);
      } else if (achievement.id === 'tonnage_1000' || achievement.id === 'tonnage_10000') {
        progress = Math.min(data.totalWeight, maxProgress);
      } else if (achievement.id === 'seven_days_streak' || achievement.id === 'thirty_days_streak') {
        progress = Math.min(data.streak, maxProgress);
      } else if (achievement.id === 'first_hundred_kg' || achievement.id === 'two_hundred_kg') {
        const maxWeight = Math.max(...data.logs.map((l: any) => l.weight), 0);
        progress = Math.min(maxWeight, maxProgress);
      } else if (achievement.id === 'pr_bench' || achievement.id === 'pr_squat' || achievement.id === 'pr_deadlift') {
        let maxWeight = 0;
        if (achievement.id === 'pr_bench') {
          const benchLogs = data.logs.filter((l: any) => l.exercise_name.toLowerCase().includes('жим'));
          maxWeight = Math.max(...benchLogs.map((l: any) => l.weight), 0);
        } else if (achievement.id === 'pr_squat') {
          const squatLogs = data.logs.filter((l: any) => l.exercise_name.toLowerCase().includes('присед'));
          maxWeight = Math.max(...squatLogs.map((l: any) => l.weight), 0);
        } else {
          const deadliftLogs = data.logs.filter((l: any) =>
            l.exercise_name.toLowerCase().includes('становая') || l.exercise_name.toLowerCase().includes('тяга')
          );
          maxWeight = Math.max(...deadliftLogs.map((l: any) => l.weight), 0);
        }
        progress = Math.min(maxWeight, maxProgress);
      } else if (achievement.id === 'five_exercises') {
        const uniqueExercises = new Set(data.logs.map((l: any) => l.exercise_name));
        progress = Math.min(uniqueExercises.size, maxProgress);
      } else if (achievement.id === 'first_workout' || achievement.id === 'early_bird' || achievement.id === 'night_owl') {
        progress = unlocked ? maxProgress : 0;
      } else {
        progress = unlocked ? maxProgress : 0;
      }

      return { ...achievement, unlocked, progress };
    });

    setAchievements(updatedAchievements);
  }, [logs, trainings, stats]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Достижения
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Получено {unlockedCount} из {totalCount} ачивок
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg px-3 py-1">
          <span className="text-sm text-gray-300">
            Прогресс: {Math.round((unlockedCount / totalCount) * 100)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-3 rounded-lg transition-all duration-300 ${
              achievement.unlocked
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50'
                : 'bg-gray-700/30 border border-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                achievement.unlocked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-600 text-gray-500'
              }`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-semibold text-sm ${
                    achievement.unlocked ? 'text-yellow-400' : 'text-gray-300'
                  }`}>
                    {achievement.name}
                  </h3>
                  {achievement.unlocked && (
                    <Trophy className="h-3 w-3 text-yellow-400" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>

                {/* Прогресс-бар */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Прогресс</span>
                    <span>{achievement.progress} / {achievement.maxProgress}</span>
                  </div>
                  <div className="h-1.5 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        achievement.unlocked ? 'bg-yellow-400' : 'bg-green-500'
                      }`}
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    />
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