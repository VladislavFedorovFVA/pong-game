'use client';

import { useEffect, useState } from 'react';
import {
  loadSettings,
  saveSettings,
  defaultSettings,
  type Settings,
} from '@/lib/storage';

const ballColors = ['#111827', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];
const paddleColors = ['#111827', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  // при первом рендере — подгружаем настройки из localStorage
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Настройки</h1>

      {/* Цвет мячика */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Цвет мячика</h2>
        <div className="flex gap-3 flex-wrap">
          {ballColors.map((c) => (
            <button
              key={c}
              onClick={() => update('ballColor', c)}
              className={
                'w-10 h-10 rounded-full border-2 ' +
                (settings.ballColor === c
                  ? 'border-gray-900'
                  : 'border-transparent')
              }
              style={{ backgroundColor: c }}
              aria-label={`Цвет ${c}`}
            />
          ))}
        </div>
      </section>

      {/* Цвет ракеток */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Цвет ракеток</h2>
        <div className="flex gap-3 flex-wrap">
          {paddleColors.map((c) => (
            <button
              key={c}
              onClick={() => update('paddleColor', c)}
              className={
                'w-10 h-10 rounded-full border-2 ' +
                (settings.paddleColor === c
                  ? 'border-gray-900'
                  : 'border-transparent')
              }
              style={{ backgroundColor: c }}
              aria-label={`Цвет ${c}`}
            />
          ))}
        </div>
      </section>

      {/* Скорость */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Скорость</h2>
        <div className="flex gap-2">
          {(['slow', 'normal', 'fast'] as const).map((s) => (
            <button
              key={s}
              onClick={() => update('speed', s)}
              className={
                'px-4 py-2 rounded-md text-sm border ' +
                (settings.speed === s
                  ? 'bg-black text-white border-black'
                  : 'border-gray-300 hover:bg-gray-100')
              }
            >
              {s === 'slow' ? 'Медленно' : s === 'normal' ? 'Средне' : 'Быстро'}
            </button>
          ))}
        </div>
      </section>
      {/* Сложность ИИ */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Сложность ИИ</h2>
        <div className="flex gap-2">
          {(
            [
              { value: 'easy', label: 'Легко' },
              { value: 'normal', label: 'Средне' },
              { value: 'hard', label: 'Сложно' },
            ] as const
          ).map((d) => (
            <button
              key={d.value}
              onClick={() => update('difficulty', d.value)}
              className={
                'px-4 py-2 rounded-md text-sm border ' +
                (settings.difficulty === d.value
                  ? 'bg-black text-white border-black'
                  : 'border-gray-300 hover:bg-gray-100')
              }
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
        >
          Сохранить
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
        >
          Сбросить
        </button>
        {saved && (
          <span className="self-center text-sm text-green-600">Сохранено ✓</span>
        )}
      </div>

      {/* Превью мячика */}
      <section className="mt-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Превью</h2>
        <div className="w-full h-40 bg-white border border-gray-200 rounded-lg relative overflow-hidden">
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-16 rounded"
            style={{ backgroundColor: settings.paddleColor }}
          />
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-16 rounded"
            style={{ backgroundColor: settings.paddleColor }}
          />
          <div
            className="absolute w-4 h-4 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ backgroundColor: settings.ballColor }}
          />
        </div>
      </section>
    </div>
  );
}