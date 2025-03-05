import React, { useState, useEffect } from 'react';

const WebhookFieldsEditor = ({ value, onChange }) => {
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [error, setError] = useState(null);

  // Asegurarse de que value sea un objeto
  const actualValue = value && typeof value === 'object' && !Array.isArray(value) ? value : {};

  // Añadir mensaje de depuración
  useEffect(() => {
    console.log("WebhookFieldsEditor - valor recibido:", value);
    console.log("WebhookFieldsEditor - tipo de valor:", typeof value);
    console.log("WebhookFieldsEditor - es array:", Array.isArray(value));
    console.log("WebhookFieldsEditor - valor procesado:", actualValue);
    
    // Verificar si hay error de tipo
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        setError("Se recibió un array en lugar de un objeto. Se ha convertido automáticamente.");
        // Convertir array a objeto si es necesario
        const convertedValue = {};
        onChange(convertedValue);
      } else if (typeof value !== 'object') {
        setError(`Se recibió un ${typeof value} en lugar de un objeto.`);
        // Convertir a objeto vacío si no es un objeto
        onChange({});
      } else {
        setError(null);
      }
    } else if (value === null || value === undefined) {
      // Si el valor es null o undefined, inicializarlo como un objeto vacío
      onChange({});
    }
  }, [value]);

  const handleAddField = () => {
    if (keyInput.trim() === '') return;
    
    // Crear una copia del objeto actual y añadir el nuevo campo
    const newValue = { ...actualValue };
    newValue[keyInput.trim()] = valueInput.trim();
    
    // Actualizar el valor
    onChange(newValue);
    
    // Limpiar los campos
    setKeyInput('');
    setValueInput('');
  };

  const handleRemoveField = (key) => {
    const newValue = { ...actualValue };
    delete newValue[key];
    onChange(newValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && keyInput.trim() !== '') {
      e.preventDefault();
      handleAddField();
    }
  };

  return (
    <div className="space-y-4">
      {/* Mostrar mensaje de error si existe */}
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}
      
      {/* Mostrar campos existentes */}
      <div className="flex flex-wrap gap-2 mb-2">
        {Object.entries(actualValue).map(([key, val]) => (
          <div key={key} className="flex items-center bg-gray-100 rounded px-2 py-1">
            <span className="mr-1">
              <strong>{key}</strong>: {String(val)}
            </span>
            <button
              type="button"
              onClick={() => handleRemoveField(key)}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      
      {/* Campos para añadir nuevos valores - CLARAMENTE SEPARADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Llave
          </label>
          <input
            type="text"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nombre del campo"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor
          </label>
          <input
            type="text"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Valor del campo"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Botón para añadir */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAddField}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Añadir campo
        </button>
      </div>
    </div>
  );
};

export default WebhookFieldsEditor; 