"use client";

import { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function RegistrationForm({ tallerId }: { tallerId: number }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('57'); // Código de Colombia por defecto
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const validatePhone = (phone: string) => {
    // Verificar que el teléfono tenga al menos 10 dígitos después del código de país
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar teléfono
    if (!validatePhone(phone)) {
      setSubmitStatus({
        success: false,
        message: 'Por favor, ingresa un número de teléfono válido con al menos 10 dígitos.'
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    // Lógica para manejar el envío del formulario
    console.log('Datos de registro:', { name, email, phone, tallerId });
    
    // Enviar los datos al servidor
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, tallerId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: '¡Registro exitoso! Te contactaremos pronto con más información sobre el taller.'
        });
        setName('');
        setEmail('');
        setPhone('57');
      } else {
        setSubmitStatus({
          success: false,
          message: data.error || 'Error al registrarse. Por favor, intente nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      setSubmitStatus({
        success: false,
        message: 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      {submitStatus && (
        <div className={`mb-6 p-4 rounded-md ${submitStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <p className="flex items-center">
            {submitStatus.success ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {submitStatus.message}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre completo
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <PhoneInput
            country={'co'} // Colombia como país predeterminado
            value={phone}
            onChange={(value) => setPhone(value)}
            inputProps={{
              id: 'phone',
              required: true,
              disabled: isSubmitting
            }}
            containerClass="mt-1"
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Ingresa tu número completo con código de país. Ejemplo: +57 300 123 4567
          </p>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting 
                ? 'bg-emerald-400 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              'Registrarme'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 