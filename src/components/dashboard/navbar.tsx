'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Hammer, BookOpen } from 'lucide-react';
import Image from 'next/image';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Talleres',
    href: '/dashboard/talleres',
    icon: BookOpen,
  },
  {
    label: 'Herramientas',
    href: '/dashboard/herramientas',
    icon: Hammer,
  },
];

export function DashboardNavbar() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="w-32 h-10 relative">
                <Image 
                  src="/logo.svg" 
                  alt="Aztec Logo" 
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>
          
          {/* Navegación para escritorio */}
          <nav className="flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors py-4",
                    isActive
                      ? "text-slate-900 border-b-2 border-primary-500"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
} 