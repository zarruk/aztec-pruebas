'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Calendar, Video } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Taller, TallerConHerramientas, Herramienta } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function TalleresList() {
  const [talleres, setTalleres] = useState<TallerConHerramientas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTalleres = async () => {
      try {
        setLoading(true);
        
        // Obtener todos los talleres
        const { data: talleresData, error: talleresError } = await supabase
          .from('talleres')
          .select('*')
          .order('created_at', { ascending: false });

        if (talleresError) throw talleresError;
        
        // Obtener todas las herramientas
        const { data: herramientasData, error: herramientasError } = await supabase
          .from('herramientas')
          .select('*');

        if (herramientasError) throw herramientasError;
        
        // Mapear las herramientas a cada taller
        const talleresConHerramientas = talleresData.map((taller: Taller) => {
          const herramientasTaller = taller.herramientas.map(
            (id) => herramientasData.find((h: Herramienta) => h.id === id)
          ).filter(Boolean) as Herramienta[];
          
          return {
            ...taller,
            herramientas: herramientasTaller,
          };
        });
        
        setTalleres(talleresConHerramientas);
      } catch (err) {
        console.error('Error al cargar talleres:', err);
        setError('Error al cargar los talleres. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchTalleres();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este taller?')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('talleres')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      // Actualizar la lista después de eliminar
      setTalleres(talleres.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error al eliminar el taller:', err);
      alert('Error al eliminar el taller. Por favor, intenta de nuevo.');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    try {
      return format(new Date(dateString), 'PPP', { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return <div className="text-center py-10">Cargando talleres...</div>;
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

  if (talleres.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-card">
        <h3 className="text-lg font-medium">No hay talleres</h3>
        <p className="text-muted-foreground mt-1">Comienza creando tu primer taller.</p>
        <Link href="/dashboard/talleres/nuevo">
          <Button className="mt-4">
            Crear taller
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {talleres.map((taller) => (
        <div 
          key={taller.id} 
          className="border rounded-lg overflow-hidden bg-card shadow-sm"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{taller.nombre}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    taller.tipo === 'vivo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {taller.tipo === 'vivo' ? 'En vivo' : 'Pre-grabado'}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1">{taller.descripcion}</p>
              </div>
              
              <div className="flex gap-2">
                <Link href={`/dashboard/talleres/${taller.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(taller.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium flex items-center gap-1">
                  {taller.tipo === 'vivo' ? (
                    <>
                      <Calendar className="h-4 w-4" />
                      Fecha del taller en vivo
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      Fecha del live build
                    </>
                  )}
                </h4>
                <p className="text-sm">
                  {taller.tipo === 'vivo' 
                    ? formatDate(taller.fecha_vivo)
                    : formatDate(taller.fecha_live_build)
                  }
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Herramientas</h4>
                {taller.herramientas.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {taller.herramientas.map((herramienta) => (
                      <span 
                        key={herramienta.id}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md"
                      >
                        {herramienta.nombre}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay herramientas asociadas</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium">Campos adicionales para webhook</h4>
              {taller.campos_webhook && taller.campos_webhook.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {taller.campos_webhook.map((campo, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-md"
                    >
                      {campo}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay campos adicionales</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 