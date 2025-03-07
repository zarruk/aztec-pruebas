'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { toast } from 'react-hot-toast';

// Lista de correos autorizados
const ALLOWED_EMAILS = ['martin@azteclab.co', 'salomon@azteclab.co'];

// Componente interno que usa useSearchParams
function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLocalDev, setIsLocalDev] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Verificar si estamos en desarrollo local
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    setIsLocalDev(isLocal);
    
    if (isLocal) {
      console.log('Modo de desarrollo local detectado');
    }
  }, []);

  // Verificar si hay un error en los parámetros de la URL
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      toast.error(decodeURIComponent(errorParam));
    }

    // Verificar si ya hay una sesión activa
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log('Sesión activa detectada, redirigiendo al dashboard');
        router.push('/dashboard');
      }
    };

    checkSession();
  }, [searchParams, router]);

  // Función para iniciar sesión en modo de desarrollo local
  const handleLocalDevLogin = () => {
    console.log('Iniciando sesión en modo desarrollo local');
    
    // Simular inicio de sesión exitoso
    toast.success(`Inicio de sesión de desarrollo como salomon@azteclab.co`);
    
    // Establecer un pequeño retraso para asegurar que el toast se muestre
    setTimeout(() => {
      // Redirigir al dashboard
      window.location.href = '/dashboard';
    }, 500);
  };

  // Función para iniciar sesión con Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Si estamos en desarrollo local, usar el inicio de sesión simplificado
      if (isLocalDev) {
        handleLocalDevLogin();
        return;
      }

      // Iniciar sesión con Google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
      
      // La redirección a Google ocurrirá automáticamente
      console.log('Redirigiendo a Google para autenticación...');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
      toast.error('Error al iniciar sesión con Google');
      console.error('Error detallado:', err);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Acceso al Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Inicia sesión con tu cuenta de Google
          </p>
          {isLocalDev && (
            <p className="mt-2 text-xs bg-blue-100 p-2 rounded">
              Modo de desarrollo local activo. El inicio de sesión será simulado.
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Nota: Solo los correos autorizados pueden acceder al sistema.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && <FormError>{error}</FormError>}

          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 flex items-center justify-center py-2 px-4 space-x-2"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            <span>
              {loading 
                ? 'Procesando...' 
                : isLocalDev
                  ? 'Iniciar sesión con Google (Simulado)'
                  : 'Iniciar sesión con Google'}
            </span>
          </Button>
          
          <div className="text-center mt-4 text-sm text-gray-500">
            Solo los usuarios autorizados pueden acceder al sistema.
            <br />
            Si tienes problemas, contacta al administrador.
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