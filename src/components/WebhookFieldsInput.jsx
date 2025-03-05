import React, { useState, useEffect } from 'react';

const WebhookFieldsInput = ({ value, onChange, placeholder }) => {
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');

  // Añadir mensaje de depuración
  useEffect(() => {
    console.log("WebhookFieldsInput - valor recibido:", value);
    console.log("WebhookFieldsInput - tipo de valor:", typeof value);
  }, [value]);

  // Asegurarse de que value sea un objeto
  let actualValue = {};
  
  // Convertir array a objeto si es necesario
  if (Array.isArray(value)) {
    console.log("Convirtiendo array a objeto");
    value.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        Object.entries(item).forEach(([key, val]) => {
          actualValue[key] = val;
        });
      } else {
        actualValue[`item_${index}`] = item;
      }
    });
  } 
  // Usar el objeto directamente si ya es un objeto
  else if (value && typeof value === 'object') {
    actualValue = value;
  }
  
  console.log("WebhookFieldsInput - valor procesado:", actualValue);

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

  return (
    <div className="space-y-4">
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
      
      {/* Campos para añadir nuevos valores */}
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Llave</label>
          <input
            type="text"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Valor</label>
          <input
            type="text"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <button
          type="button"
          onClick={handleAddField}
          className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
        >
          Añadir
        </button>
      </div>
    </div>
  );
};

export default WebhookFieldsInput; 