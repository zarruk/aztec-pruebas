'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';

export default function AccesoDenegadoPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
        <div className="text-red-600 text-6xl mb-6">
          ⚠️
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
        
        <p className="mt-2 text-gray-600">
          Tu cuenta no tiene autorización para acceder al dashboard.
        </p>
        
        <p className="mt-4 text-gray-600">
          Si crees que esto es un error, por favor contacta al administrador.
        </p>
        
        <Button
          onClick={handleSignOut}
          className="mt-8 bg-red-600 hover:bg-red-700 text-white"
        >
          Volver al inicio de sesión
        </Button>
      </div>
    </div>
  );
} 