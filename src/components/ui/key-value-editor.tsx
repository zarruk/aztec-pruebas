'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, X } from 'lucide-react';

interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueEditorProps {
  value: Record<string, string> | any;
  onChange: (value: Record<string, string>) => void;
  error?: boolean;
}

export function KeyValueEditor({ value, onChange, error }: KeyValueEditorProps) {
  // Convertir el valor a un formato utilizable
  const [pairs, setPairs] = useState<KeyValuePair[]>([{ key: '', value: '' }]);

  // Procesar el valor inicial
  useEffect(() => {
    let initialPairs: KeyValuePair[] = [];
    
    try {
      // Si es objeto, convertir directamente
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        initialPairs = Object.entries(value).map(([key, val]) => ({ 
          key, 
          value: String(val) 
        }));
      }
      
      // Si no hay pares o no es un objeto válido, iniciar con uno vacío
      if (initialPairs.length === 0) {
        initialPairs = [{ key: '', value: '' }];
      }
    } catch (e) {
      console.error("Error al procesar valor inicial:", e);
      initialPairs = [{ key: '', value: '' }];
    }
    
    setPairs(initialPairs);
  }, []);  // Solo ejecutar al montar el componente

  // Actualizar el componente padre cuando cambian los pares
  const updateParent = (newPairs: KeyValuePair[]) => {
    const newValue = newPairs.reduce((acc, { key, value }) => {
      if (key.trim()) {
        acc[key.trim()] = value;
      }
      return acc;
    }, {} as Record<string, string>);
    
    onChange(newValue);
  };

  // Añadir un nuevo par clave-valor
  const addPair = () => {
    const newPairs = [...pairs, { key: '', value: '' }];
    setPairs(newPairs);
  };

  // Eliminar un par clave-valor
  const removePair = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    setPairs(newPairs);
    updateParent(newPairs);
  };

  // Actualizar un par clave-valor
  const updatePair = (index: number, field: 'key' | 'value', newValue: string) => {
    const newPairs = [...pairs];
    newPairs[index][field] = newValue;
    setPairs(newPairs);
    updateParent(newPairs);
  };

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {pairs.map((pair, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Nombre del campo"
              value={pair.key}
              onChange={(e) => updatePair(index, 'key', e.target.value)}
              className={`flex-1 ${error ? 'border-red-500' : ''}`}
            />
            <Input
              placeholder="Valor"
              value={pair.value}
              onChange={(e) => updatePair(index, 'value', e.target.value)}
              className={`flex-1 ${error ? 'border-red-500' : ''}`}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={() => removePair(index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addPair}
        className="mt-2 flex items-center gap-1"
      >
        <PlusCircle className="h-4 w-4" />
        <span>Añadir campo</span>
      </Button>
    </div>
  );
} 