'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Меню' },
  { href: '/game', label: 'Игра' },
  { href: '/settings', label: 'Настройки' },
  { href: '/stats', label: 'Статистика' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-3 flex gap-2 flex-wrap">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                'px-3 py-1.5 rounded-md text-sm font-medium transition ' +
                (active
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100')
              }
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}