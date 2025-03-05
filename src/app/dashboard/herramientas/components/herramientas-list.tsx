'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Herramienta } from '@/lib/types';
import { Button } from '@/components/ui/button';

export function HerramientasList() {
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHerramientas = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('herramientas')
          .select('*')
          .order('nombre');

        if (fetchError) throw fetchError;
        setHerramientas((data as unknown as Herramienta[]) || []);
      } catch (err) {
        console.error('Error al cargar herramientas:', err);
        setError('Error al cargar las herramientas. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchHerramientas();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta herramienta?')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('herramientas')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      // Actualizar la lista después de eliminar
      setHerramientas(herramientas.filter(h => h.id !== id));
    } catch (err) {
      console.error('Error al eliminar la herramienta:', err);
      alert('Error al eliminar la herramienta. Por favor, intenta de nuevo.');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Cargando herramientas...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  if (herramientas.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-card">
        <h3 className="text-lg font-medium">No hay herramientas</h3>
        <p className="text-muted-foreground mt-1">Comienza creando tu primera herramienta.</p>
        <Link href="/dashboard/herramientas/nueva">
          <Button className="mt-4">
            Crear herramienta
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {herramientas.map((herramienta) => (
        <div 
          key={herramienta.id} 
          className="border rounded-lg overflow-hidden bg-card shadow-sm"
        >
          <div className="h-40 overflow-hidden">
            <img 
              src={herramienta.imagen_url} 
              alt={herramienta.nombre}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Sin+Imagen';
              }}
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold">{herramienta.nombre}</h3>
            <p className="text-muted-foreground mt-1 line-clamp-2">{herramienta.descripcion}</p>
            
            <div className="flex justify-end gap-2 mt-4">
              <Link href={`/dashboard/herramientas/${herramienta.id}`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDelete(herramienta.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 