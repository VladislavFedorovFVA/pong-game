import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <h1 className="text-5xl font-bold tracking-tight">🏓 Пинг-понг</h1>
      <p className="text-gray-600 text-center max-w-md">
        Играй против ИИ. Настрой цвет мячика, следи за статистикой.
      </p>
      <Link
        href="/game"
        className="mt-4 px-8 py-3 bg-black text-white rounded-lg text-lg font-medium hover:bg-gray-800 transition"
      >
        Играть
      </Link>
      <div className="flex gap-3 mt-4">
        <Link
          href="/settings"
          className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
        >
          Настройки
        </Link>
        <Link
          href="/stats"
          className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
        >
          Статистика
        </Link>
      </div>
    </div>
  );
}