'use client';

import { useEffect, useState } from 'react';
import { loadMatches, type Match } from '@/lib/storage';
import Link from 'next/link';

type Stats = {
  total: number;
  wins: number;
  losses: number;
  winRate: number;      // процент побед
  currentStreak: number; // текущая серия побед подряд
  bestStreak: number;    // лучшая серия за всё время
};

function computeStats(matches: Match[]): Stats {
  const total = matches.length;
  const wins = matches.filter((m) => m.won).length;
  const losses = total - wins;
  const winRate = total === 0 ? 0 : Math.round((wins / total) * 100);

  // currentStreak — считаем с конца: сколько побед подряд в последних матчах
  let currentStreak = 0;
  for (let i = matches.length - 1; i >= 0; i--) {
    if (matches[i].won) currentStreak++;
    else break;
  }

  // bestStreak — максимальная серия побед за всё время
  let bestStreak = 0;
  let run = 0;
  for (const m of matches) {
    if (m.won) {
      run++;
      if (run > bestStreak) bestStreak = run;
    } else {
      run = 0;
    }
  }

  return { total, wins, losses, winRate, currentStreak, bestStreak };
}

export default function StatsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMatches(loadMatches());
    setReady(true);
  }, []);

  if (!ready) {
    // чтобы не мигало "нет матчей" при первой отрисовке
    return null;
  }

  const stats = computeStats(matches);
  const recent = [...matches].reverse().slice(0, 10); // последние 10

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Статистика</h1>

      {stats.total === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">Пока нет сыгранных матчей.</p>
          <Link
            href="/game"
            className="px-6 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
          >
            Сыграть первую игру
          </Link>
        </div>
      ) : (
        <>
          {/* Карточки со сводкой */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Всего игр" value={stats.total} />
            <StatCard label="Побед" value={stats.wins} />
            <StatCard label="% побед" value={`${stats.winRate}%`} />
            <StatCard label="Streak сейчас" value={stats.currentStreak} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatCard label="Лучшая серия побед" value={stats.bestStreak} />
            <StatCard label="Поражений" value={stats.losses} />
          </div>

          {/* Последние матчи */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Последние матчи</h2>
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden bg-white">
              {recent.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span
                    className={
                      'font-medium ' +
                      (m.won ? 'text-green-600' : 'text-red-500')
                    }
                  >
                    {m.won ? 'Победа' : 'Поражение'}
                  </span>
                  <span className="text-gray-700 tabular-nums">
                    {m.playerScore} : {m.aiScore}
                  </span>
                  <span className="text-gray-400">
                    {new Date(m.date).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Кнопка очистки */}
          <div>
            <button
              onClick={() => {
                if (confirm('Удалить всю статистику? Это нельзя отменить.')) {
                  localStorage.removeItem('pong.matches');
                  setMatches([]);
                }
              }}
              className="text-sm text-red-500 hover:underline"
            >
              Очистить статистику
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
      <div className="text-xs uppercase text-gray-400 tracking-wide">{label}</div>
      <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>
    </div>
  );
}