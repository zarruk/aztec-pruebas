'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';

// Lista de correos autorizados
const ALLOWED_EMAILS = ['martin@azteclab.co', 'salomon@azteclab.co'];

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

// Componente principal de login
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithPassword, signUp, session } = useAuth();
  
  // Verificar si hay un error en los parámetros de la URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);
  
  // Redirigir si ya está autenticado
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    // Verificar si el correo está autorizado
    if (!ALLOWED_EMAILS.includes(email)) {
      setError('Correo electrónico no autorizado. Solo usuarios específicos pueden acceder al sistema.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Registro de usuario
        const { error } = await signUp(email, password);
        
        if (error) throw error;
        
        setMessage('Cuenta creada exitosamente. Ya puedes iniciar sesión.');
        setIsSignUp(false);
      } else {
        // Inicio de sesión
        const { error } = await signInWithPassword(email, password);
        
        if (error) throw error;
        
        // La redirección se maneja en el hook useAuth
      }
    } catch (error: any) {
      setError(error.message || 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Crear Cuenta' : 'Acceso al Dashboard'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isSignUp 
              ? 'Crea una cuenta para acceder al sistema' 
              : 'Ingresa tus credenciales para acceder'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="********"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Procesando...' : isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-emerald-600 hover:text-emerald-500"
          >
            {isSignUp ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes una cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente exportado que envuelve el formulario en un Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
} 