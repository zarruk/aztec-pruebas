'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { toast } from 'react-hot-toast';

// Componente interno que maneja la lógica de login
function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Función para acceder directamente al dashboard
  const accessDashboard = () => {
    setLoading(true);
    
    // Mostrar mensaje de éxito
    toast.success('Accediendo al dashboard...');
    
    // Redirección directa al dashboard usando window.location
    // Esto es más confiable que router.push en algunos casos
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Acceso al Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Haz clic en el botón para acceder al dashboard
          </p>
          <p className="mt-2 text-xs bg-blue-100 p-2 rounded">
            Acceso directo habilitado para facilitar el desarrollo
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && <FormError>{error}</FormError>}

          {/* Botón de acceso directo */}
          <Button
            type="button"
            onClick={accessDashboard}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4"
            disabled={loading}
          >
            {loading ? 'Accediendo...' : 'Acceder al Dashboard'}
          </Button>
          
          {/* Botón de Google (solo visual) */}
          <Button
            type="button"
            onClick={accessDashboard}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 flex items-center justify-center py-2 px-4 space-x-2 mt-4"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            <span>
              Iniciar sesión con Google
            </span>
          </Button>
          
          <div className="text-center mt-4 text-sm text-gray-500">
            Esta es una versión simplificada para desarrollo.
            <br />
            Ambos botones te llevarán directamente al dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de carga para el Suspense
function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
        <p>Cargando...</p>
      </div>
    </div>
  );
}

// Componente principal que envuelve el formulario en un Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
} 