'use client';

import { useState } from 'react';

interface DebugButtonProps {
  onDebug?: () => void;
}

export function DebugButton({ onDebug }: DebugButtonProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleDebug = () => {
    // Obtener información del formulario desde localStorage si existe
    const formData = localStorage.getItem('taller_form_data');
    
    if (formData) {
      try {
        const parsedData = JSON.parse(formData);
        setDebugInfo(parsedData);
        console.log('Datos del formulario recuperados:', parsedData);
        
        // Mostrar alerta con información básica
        alert(`Datos recuperados del formulario:\n- Tipo: ${parsedData.tipo || 'No definido'}\n- Fecha vivo: ${Array.isArray(parsedData.fecha_vivo) ? 'Es array' : 'No es array'}\n- Campos webhook: ${typeof parsedData.campos_webhook === 'object' ? 'Es objeto' : 'No es objeto'}`);
        
        // Llamar al callback si existe
        if (onDebug) onDebug();
      } catch (error) {
        console.error('Error al parsear datos del formulario:', error);
        alert('Error al recuperar datos del formulario. Ver consola para más detalles.');
      }
    } else {
      alert('No hay datos del formulario guardados. Completa algunos campos primero.');
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleDebug}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Depurar Formulario
      </button>
      
      {debugInfo && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="font-bold mb-2">Información de depuración:</h3>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 