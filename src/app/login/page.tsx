'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // URL HARDCODEADA para redirección
      const SITE_URL = 'https://aztec-nuevo.onrender.com';
      console.log('Usando URL hardcodeada para redirección:', SITE_URL);
      
      // Sobrescribir temporalmente window.location.origin para este proceso
      const originalOrigin = window.location.origin;
      Object.defineProperty(window.location, 'origin', {
        get: function() { return SITE_URL; }
      });
      
      // Enviar enlace mágico al correo con URL explícita
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${SITE_URL}/auth/callback`,
          data: {
            redirectUrl: SITE_URL
          }
        },
      });
      
      // Restaurar el valor original (aunque probablemente no sea necesario)
      try {
        Object.defineProperty(window.location, 'origin', {
          get: function() { return originalOrigin; }
        });
      } catch (e) {
        console.error('Error al restaurar window.location.origin:', e);
      }

      if (error) throw error;
      
      setMagicLinkSent(true);
      toast.success('Se ha enviado un enlace de acceso a tu correo');
    } catch (err: any) {
      setError(err.message || 'Error al enviar el enlace de acceso');
      toast.error('Error al enviar el enlace de acceso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Acceso al Dashboard</h1>
          <p className="mt-2 text-gray-600">Ingresa tu correo para recibir un enlace de acceso</p>
        </div>

        {magicLinkSent ? (
          <div className="mt-8 p-6 bg-emerald-50 rounded-lg text-center">
            <h2 className="text-xl font-medium text-emerald-800 mb-4">¡Enlace enviado!</h2>
            <p className="text-gray-700 mb-6">
              Hemos enviado un enlace de acceso a <strong>{email}</strong>. 
              Por favor, revisa tu correo y haz clic en el enlace para iniciar sesión.
            </p>
            <p className="text-sm text-gray-500">
              Si no encuentras el correo, revisa tu carpeta de spam o correo no deseado.
            </p>
            <Button
              type="button"
              className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                setMagicLinkSent(false);
                setEmail('');
              }}
            >
              Volver a intentar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleMagicLinkLogin} className="mt-8 space-y-6">
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

            {error && <FormError>{error}</FormError>}

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading}
            >
              {loading ? 'Enviando enlace...' : 'Recibir enlace de acceso'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
} 