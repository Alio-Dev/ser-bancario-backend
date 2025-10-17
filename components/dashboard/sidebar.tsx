'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Award,
  FolderOpen,
  Tags,
  Activity,
  Settings,
  Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Painel de Controlo', href: '/dashboard' },
  { icon: Users, label: 'Utilizadores', href: '/dashboard/users' },
  { icon: FileText, label: 'Artigos', href: '/dashboard/articles' },
  { icon: Calendar, label: 'Eventos', href: '/dashboard/events' },
  { icon: Award, label: 'Patrocinadores', href: '/dashboard/sponsors' },
  { icon: FolderOpen, label: 'Categorias', href: '/dashboard/categories' },
  { icon: Tags, label: 'Etiquetas', href: '/dashboard/tags' },
  { icon: Activity, label: 'Registo de Atividades', href: '/dashboard/activity-logs' },
  { icon: Terminal, label: 'Terminal SQL', href: '/dashboard/terminal' },
  { icon: Settings, label: 'Definições', href: '/dashboard/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white shadow-sm">
      <div className="flex h-20 items-center justify-center border-b px-6 bg-gradient-to-r from-blue-600 to-blue-700">
        <img
          src="https://image2url.com/images/1760652842082-bc1c1f14-6030-4d3f-9ef9-37e00413c01c.jpg"
          alt="Serbancario"
          className="h-12 w-auto object-contain"
        />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
