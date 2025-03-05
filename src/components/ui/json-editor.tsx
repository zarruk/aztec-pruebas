'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface JsonEditorProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  error?: boolean;
}

export function JsonEditor({ value, onChange, error }: JsonEditorProps) {
  const [jsonString, setJsonString] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  // Convertir el objeto a string cuando cambia el valor
  useEffect(() => {
    try {
      const formatted = JSON.stringify(value, null, 2);
      setJsonString(formatted);
      setParseError(null);
    } catch (err) {
      console.error('Error al convertir JSON a string:', err);
      setJsonString('{}');
      setParseError('Error al formatear JSON');
    }
  }, [value]);

  // Manejar cambios en el textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setJsonString(newValue);
    
    try {
      // Intentar parsear el JSON
      if (newValue.trim() === '') {
        onChange({});
        setParseError(null);
        return;
      }
      
      const parsed = JSON.parse(newValue);
      onChange(parsed);
      setParseError(null);
    } catch (err: any) {
      setParseError(`Error de sintaxis: ${err.message}`);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={jsonString}
        onChange={handleChange}
        rows={5}
        placeholder='{ "campo1": "valor1", "campo2": "valor2" }'
        className={`font-mono text-sm ${error || parseError ? 'border-red-500' : ''}`}
      />
      {parseError && (
        <p className="text-xs text-red-500">{parseError}</p>
      )}
    </div>
  );
} 