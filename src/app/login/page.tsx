'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { toast } from 'react-hot-toast';

// Componente interno que usa useSearchParams
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Iniciando proceso de autenticación para:', email);
      
      let response;
      
      if (isSignUp) {
        // Registrar nuevo usuario
        response = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        // Iniciar sesión con usuario existente
        response = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      const { error, data } = response;
      
      if (error) throw error;
      
      if (isSignUp && !data.session) {
        toast.success('Cuenta creada. Por favor verifica tu correo para confirmar tu cuenta.');
      } else if (data.session) {
        toast.success('Inicio de sesión exitoso');
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      toast.error('Error al iniciar sesión');
      console.error('Error detallado:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Crear cuenta' : 'Acceso al Dashboard'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isSignUp 
              ? 'Ingresa tus datos para crear una cuenta' 
              : 'Ingresa tus credenciales para acceder'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
              placeholder="********"
            />
          </div>

          {error && <FormError>{error}</FormError>}

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={loading}
          >
            {loading 
              ? 'Procesando...' 
              : isSignUp 
                ? 'Crear cuenta' 
                : 'Iniciar sesión'}
          </Button>
          
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-sm text-emerald-600 hover:text-emerald-800"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp 
                ? '¿Ya tienes cuenta? Inicia sesión' 
                : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </form>
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