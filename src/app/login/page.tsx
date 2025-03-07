'use client';

import { Suspense } from 'react';

// Componente interno simplificado al máximo
function LoginForm() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Acceso al Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Haz clic en cualquier botón para acceder
          </p>
          <p className="mt-2 text-xs bg-blue-100 p-2 rounded">
            Versión simplificada para desarrollo
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Enlaces HTML directos - la forma más básica y confiable de navegación */}
          <a 
            href="/dashboard" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded flex items-center justify-center"
          >
            Acceder al Dashboard
          </a>
          
          <a 
            href="/dashboard" 
            className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-3 px-4 rounded flex items-center justify-center space-x-2 mt-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            <span>Iniciar sesión con Google</span>
          </a>
          
          <div className="text-center mt-4 text-sm text-gray-500">
            Ambos botones te llevarán directamente al dashboard.
            <br />
            <a href="/dashboard/talleres" className="text-emerald-600 hover:underline">
              Ir directamente a Talleres
            </a>
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