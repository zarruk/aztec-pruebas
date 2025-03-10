'use client';

import Link from 'next/link';

interface SuccessPageProps {
  tallerId?: string;
}

export default function SuccessPage({ tallerId }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-[#fffdf9] flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">¡Registro exitoso!</h1>
          
          <div className="w-16 h-16 bg-[#2a7c60] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2a7c60]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <p className="text-gray-600 mb-8">
            Revisa tu correo y tu WhatsApp, a donde te enviamos los detalles de pago. Luego recibirás las instrucciones.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={tallerId ? `/talleres/${tallerId}` : '/talleres'} 
              className="inline-block bg-[#2a7c60] hover:bg-[#1e5a46] text-white font-medium py-2 px-6 rounded-md transition duration-150 ease-in-out"
            >
              Volver al taller
            </Link>
            
            <Link 
              href="/talleres" 
              className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-md transition duration-150 ease-in-out"
            >
              Ver más talleres
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 