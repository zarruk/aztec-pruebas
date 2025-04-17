'use client';

import { useState } from 'react';

interface FormData {
  nombre: string;
  telefono: string;
  email: string;
}

export default function LeadMagnetForm() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    telefono: '+57',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Enviar datos al webhook
      const response = await fetch('https://aztec.app.n8n.cloud/webhook-test/6ab724ec-631c-4a0f-b3f8-c5a401c28619', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al enviar los datos');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError('Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    // Aquí puedes agregar la lógica para descargar el archivo
    window.open('/guia-automatizacion-ia.pdf', '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto my-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Guía Práctica: Automatiza tu Empresa con IA en 4 Pasos
      </h2>
      <p className="text-gray-600 mb-6">
        Descubre cómo implementar inteligencia artificial en tu negocio de manera sencilla y efectiva.
      </p>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre completo
            </label>
            <input
              type="text"
              id="nombre"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="tel"
                id="telefono"
                required
                className="block w-full rounded-md border-gray-300 pl-12 focus:border-blue-500 focus:ring-blue-500"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">+57</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Procesando...' : 'Obtener Guía Gratuita'}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <div className="mb-6">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            ¡Gracias por tu interés!
          </h3>
          <p className="text-gray-600 mb-6">
            Tu guía está lista para descargar. Haz clic en el botón para obtenerla.
          </p>
          <button
            onClick={handleDownload}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Descargar Guía
          </button>
        </div>
      )}
    </div>
  );
} 