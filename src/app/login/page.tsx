'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { toast } from 'react-hot-toast';

// Lista de correos autorizados para crear cuentas
const ALLOWED_EMAILS = ['martin@azteclab.co', 'salomon@azteclab.co'];

// Usuario hardcodeado para desarrollo local
const DEV_USER = {
  email: 'salomon@azteclab.co',
  password: 'azteclab123'
};

// Componente interno que usa useSearchParams
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
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
      // Pre-llenar con el usuario de desarrollo
      setEmail(DEV_USER.email);
      setPassword(DEV_USER.password);
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

  // Función para traducir mensajes de error de Supabase
  const translateError = (errorMessage: string) => {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Credenciales de inicio de sesión inválidas. Verifica tu correo y contraseña.',
      'Email not confirmed': 'El correo electrónico no ha sido confirmado. Por favor, verifica tu bandeja de entrada.',
      'User not found': 'Usuario no encontrado. ¿Estás seguro de que tienes una cuenta?',
      'Email already in use': 'Este correo ya está registrado. Intenta iniciar sesión.',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    };

    return errorMap[errorMessage] || errorMessage;
  };

  // Función para iniciar sesión en modo de desarrollo local
  const handleLocalDevLogin = () => {
    console.log('Iniciando sesión en modo desarrollo local');
    // Simular inicio de sesión exitoso
    toast.success(`Inicio de sesión de desarrollo como ${email}`);
    // Redirigir al dashboard
    router.push('/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Iniciando proceso de autenticación para:', email);
      
      // Si estamos en desarrollo local, usar el inicio de sesión simplificado
      if (isLocalDev) {
        handleLocalDevLogin();
        return;
      }
      
      let response;
      
      if (isSignUp) {
        // Verificar si el correo está autorizado para crear cuenta
        if (!ALLOWED_EMAILS.includes(email)) {
          throw new Error('No estás autorizado para crear una cuenta. Solo los administradores pueden registrarse.');
        }

        // Registrar nuevo usuario
        response = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Crear usuario sin necesidad de confirmación por correo
            data: {
              role: 'admin'
            }
          }
        });

        // Verificar si hay errores específicos
        if (response.error) {
          throw new Error(translateError(response.error.message));
        }

        // Si el registro fue exitoso pero no hay sesión, intentar iniciar sesión automáticamente
        if (!response.data.session) {
          console.log('Cuenta creada, intentando iniciar sesión automáticamente...');
          
          // Iniciar sesión automáticamente después de crear la cuenta
          const loginResponse = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (loginResponse.error) {
            console.log('Error al iniciar sesión automáticamente:', loginResponse.error.message);
            toast.success('Cuenta creada correctamente. Ahora puedes iniciar sesión manualmente.');
            setIsSignUp(false);
            setPassword('');
            setLoading(false);
            return;
          }
          
          response = loginResponse;
        }
      } else {
        // Iniciar sesión con usuario existente
        response = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      const { error, data } = response;
      
      if (error) {
        throw new Error(translateError(error.message));
      }
      
      if (data.session) {
        toast.success(`Inicio de sesión exitoso como ${data.session.user.email}`);
        console.log('Detalles de la sesión:', {
          userId: data.session.user.id,
          email: data.session.user.email,
          lastSignIn: new Date(data.session.user.last_sign_in_at || '').toLocaleString()
        });
        router.push('/dashboard');
      } else {
        // Este caso no debería ocurrir normalmente
        throw new Error('No se pudo establecer la sesión. Intenta nuevamente.');
      }
    } catch (err: any) {
      const errorMessage = translateError(err.message);
      setError(errorMessage);
      toast.error(errorMessage);
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
          {isLocalDev && (
            <p className="mt-2 text-xs bg-blue-100 p-2 rounded">
              Modo de desarrollo local activo. Las credenciales están pre-llenadas.
            </p>
          )}
          {isSignUp && (
            <p className="mt-2 text-xs text-gray-500">
              Nota: Solo los correos autorizados pueden crear cuentas.
              <br />
              Las credenciales se almacenan de forma segura en Supabase.
            </p>
          )}
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
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              {isSignUp ? 'La contraseña debe tener al menos 6 caracteres' : ''}
            </p>
          </div>

          {error && <FormError>{error}</FormError>}

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={loading}
          >
            {loading 
              ? 'Procesando...' 
              : isLocalDev
                ? 'Iniciar sesión (Modo desarrollo)'
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