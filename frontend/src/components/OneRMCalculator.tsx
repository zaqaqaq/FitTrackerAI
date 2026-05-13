import { useState } from 'react';
import { TrendingUp, Calculator, Target, Info } from 'lucide-react';

interface OneRMResult {
  brzycki: number;
  epley: number;
  lander: number;
  average: number;
}

export default function OneRMCalculator() {
  const [weight, setWeight] = useState<number>(100);
  const [reps, setReps] = useState<number>(5);
  const [result, setResult] = useState<OneRMResult | null>(null);

  // Формула Бжицки: вес / (1.0278 - 0.0278 × количество повторений)
  const calculateBrzycki = (weight: number, reps: number): number => {
    return Math.round(weight / (1.0278 - 0.0278 * reps));
  };

  // Формула Эпли: вес × (1 + 0.0333 × количество повторений)
  const calculateEpley = (weight: number, reps: number): number => {
    return Math.round(weight * (1 + 0.0333 * reps));
  };

  // Формула Лэндера: (100 × вес) / (101.3 - 2.67123 × количество повторений)
  const calculateLander = (weight: number, reps: number): number => {
    return Math.round((100 * weight) / (101.3 - 2.67123 * reps));
  };

  const calculateOneRM = () => {
    if (weight <= 0 || reps <= 0 || reps > 12) {
      alert('Введите корректные данные (вес > 0, повторения 1-12)');
      return;
    }

    const brzycki = calculateBrzycki(weight, reps);
    const epley = calculateEpley(weight, reps);
    const lander = calculateLander(weight, reps);
    const average = Math.round((brzycki + epley + lander) / 3);

    setResult({ brzycki, epley, lander, average });
  };

  // Рекомендации по весу
  const getRecommendation = () => {
    if (!result) return null;

    const recommendedWeight = Math.round(result.average * 0.85);
    return (
      <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-300 flex items-center gap-2">
          <Info className="h-4 w-4 text-green-400" />
          💡 Рекомендация: Для тренировок в 5-8 повторениях используй вес <strong>{recommendedWeight} кг</strong> (85% от 1 ПМ)
        </p>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-400" />
          Калькулятор 1 ПМ
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Рассчитай свой максимальный вес в одном повторении
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ввод данных */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Вес на штанге (кг)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Например: 100"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Количество повторений</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(Math.min(Number(e.target.value), 12))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Например: 5"
              min="1"
              max="12"
            />
            <p className="text-xs text-gray-500 mt-1">* Наиболее точный расчёт при 2-8 повторениях</p>
          </div>

          <button
            onClick={calculateOneRM}
            className="w-full p-3 bg-green-500 hover:bg-green-600 rounded-lg transition font-semibold"
          >
            Рассчитать 1 ПМ
          </button>
        </div>

        {/* Результат */}
        {result && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">Твой предполагаемый 1 ПМ</p>
                <p className="text-4xl font-bold text-white">{result.average} кг</p>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Бжицки</p>
                    <p className="text-lg font-semibold text-green-400">{result.brzycki}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Эпли</p>
                    <p className="text-lg font-semibold text-green-400">{result.epley}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Лэндер</p>
                    <p className="text-lg font-semibold text-green-400">{result.lander}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Таблица весов для разных целей */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-white mb-2">📊 Рекомендации по весам:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Сила (1-3 повторения):</span>
                  <span className="text-white font-semibold">{Math.round(result.average * 0.95)}-{result.average} кг</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Гипертрофия (6-10 повторений):</span>
                  <span className="text-white font-semibold">{Math.round(result.average * 0.75)}-{Math.round(result.average * 0.85)} кг</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Выносливость (12+ повторений):</span>
                  <span className="text-white font-semibold">{Math.round(result.average * 0.65)}-{Math.round(result.average * 0.7)} кг</span>
                </div>
              </div>
            </div>

            {getRecommendation()}
          </div>
        )}
      </div>
    </div>
  );
}