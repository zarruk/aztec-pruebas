'use client';

import React, { useEffect } from 'react';
import { DashboardNavbar } from '@/components/dashboard/navbar';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{backgroundColor: 'white', color: 'black', minHeight: '100vh'}}>
      {/* Header/Navbar */}
      <header style={{backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 0'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <img
              src="https://taller-fundamental.web.app/Logo%20Aztec%20(800%20x%20400%20px)%20(2).png"
              alt="Aztec Logo"
              style={{height: '2rem', width: 'auto', objectFit: 'contain'}}
            />
            <h1 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1f2937'}}>Panel de Administración</h1>
          </div>
          <nav>
            <ul style={{display: 'flex', gap: '1.5rem'}}>
              <li>
                <a href="/dashboard" style={{color: '#1f2937', textDecoration: 'none'}}>
                  Inicio
                </a>
              </li>
              <li>
                <a href="/dashboard/talleres" style={{color: '#1f2937', textDecoration: 'none'}}>
                  Talleres
                </a>
              </li>
              <li>
                <a href="/dashboard/usuarios" style={{color: '#1f2937', textDecoration: 'none'}}>
                  Usuarios
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', backgroundColor: 'white', color: '#1f2937'}}>
        {children}
      </main>
    </div>
  );
} 