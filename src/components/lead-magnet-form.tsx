'use client';

import { useState } from 'react';
import ReactCountryFlag from 'react-country-flag';

interface FormData {
  nombre: string;
  telefono: string;
  email: string;
  registro: string;
}

const COUNTRY_CODES = [
  { code: '+57', isoCode: 'CO', name: 'Colombia' },
  { code: '+1', isoCode: 'US', name: 'Estados Unidos' },
  { code: '+52', isoCode: 'MX', name: 'México' },
  { code: '+34', isoCode: 'ES', name: 'España' },
  { code: '+56', isoCode: 'CL', name: 'Chile' },
  { code: '+51', isoCode: 'PE', name: 'Perú' },
  { code: '+54', isoCode: 'AR', name: 'Argentina' },
  { code: '+593', isoCode: 'EC', name: 'Ecuador' },
  { code: '+58', isoCode: 'VE', name: 'Venezuela' },
  { code: '+507', isoCode: 'PA', name: 'Panamá' },
];

export default function LeadMagnetForm() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    telefono: '',
    email: '',
    registro: 'lead-magnet'
  });
  const [countryCode, setCountryCode] = useState('+57');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://aztec.app.n8n.cloud/webhook/6ab724ec-631c-4a0f-b3f8-c5a401c28619', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          telefono: `${countryCode}${formData.telefono}`,
          registro: 'lead-magnet'
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar los datos');
      }

      setIsSubmitted(true);
      localStorage.setItem('leadMagnetFormSubmitted', 'true');
    } catch (err) {
      setError('Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/guia-automatizacion-ia.pdf';
    link.download = 'guia-automatizacion-ia.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedCountry = COUNTRY_CODES.find(country => country.code === countryCode) || COUNTRY_CODES[0];

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="h-10 w-10 text-[#2a7c60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Gracias por tu interés!
        </h3>
        <p className="text-gray-600 mb-8">
          Tu guía está lista para descargar. Haz clic en el botón para obtenerla.
        </p>
        <button
          onClick={handleDownload}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-[#2a7c60] hover:bg-[#1e5a46] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2a7c60] transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Descargar Guía
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Obtén tu guía gratuita
        </h3>
        <p className="text-gray-600">
          Completa el formulario para recibir la guía en tu correo
        </p>
      </div>

      <div className="space-y-4">
        <div className="group">
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-[#2a7c60]">
            Nombre completo
          </label>
          <input
            type="text"
            id="nombre"
            required
            className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#2a7c60] focus:border-transparent transition-all duration-200 hover:border-gray-400"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Juan Pérez"
          />
        </div>

        <div className="group">
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-[#2a7c60]">
            Teléfono
          </label>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="block w-[120px] pl-9 pr-3 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#2a7c60] focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white appearance-none"
              >
                {COUNTRY_CODES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ReactCountryFlag
                  countryCode={selectedCountry.isoCode}
                  svg
                  style={{
                    width: '1.2em',
                    height: '1.2em',
                  }}
                />
              </div>
            </div>
            <input
              type="tel"
              id="telefono"
              required
              className="block flex-1 px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#2a7c60] focus:border-transparent transition-all duration-200 hover:border-gray-400"
              value={formData.telefono}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, telefono: value });
              }}
              placeholder="300 123 4567"
            />
          </div>
        </div>

        <div className="group">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-[#2a7c60]">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            required
            className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#2a7c60] focus:border-transparent transition-all duration-200 hover:border-gray-400"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="juan@ejemplo.com"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-[#2a7c60] hover:bg-[#1e5a46] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2a7c60] disabled:opacity-50 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Procesando...</span>
          </div>
        ) : (
          'Obtener Guía Gratuita'
        )}
      </button>
    </form>
  );
} 