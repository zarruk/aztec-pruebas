'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { cn } from '@/lib/utils';

interface ToolSelectorProps {
  value: number[];
  onChange: (tools: number[]) => void;
  error?: boolean;
  className?: string;
}

export function ToolSelector({ value = [], onChange, error, className }: ToolSelectorProps) {
  const supabase = createClientComponentClient<Database>();
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('herramientas')
          .select('id, nombre');
          
        if (error) {
          throw error;
        }
        
        setTools(data || []);
      } catch (error) {
        console.error('Error al cargar herramientas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTools();
  }, [supabase]);
  
  const handleToolChange = (toolId: number) => {
    const isSelected = value.includes(toolId);
    let newSelectedTools;
    
    if (isSelected) {
      newSelectedTools = value.filter(id => id !== toolId);
    } else {
      newSelectedTools = [...value, toolId];
    }
    
    console.log('Herramientas seleccionadas:', newSelectedTools);
    onChange(newSelectedTools);
  };
  
  if (loading) {
    return <div className="text-slate-600">Cargando herramientas...</div>;
  }
  
  return (
    <div className={cn("space-y-2", className, error && "border-red-500")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {tools.map((tool) => (
          <div key={tool.id} className="flex items-center">
            <input
              type="checkbox"
              id={`tool-${tool.id}`}
              checked={value.includes(tool.id)}
              onChange={() => handleToolChange(tool.id)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
            />
            <label htmlFor={`tool-${tool.id}`} className="ml-2 text-sm text-slate-700">
              {tool.nombre}
            </label>
          </div>
        ))}
      </div>
      
      {tools.length === 0 && (
        <p className="text-slate-600 text-sm">
          No hay herramientas disponibles. <a href="/dashboard/herramientas/nueva" className="text-primary-600 hover:underline">Crear una nueva herramienta</a>
        </p>
      )}
    </div>
  );
} 