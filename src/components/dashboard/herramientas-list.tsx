'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Plus, Search, Hammer } from 'lucide-react';
import { Herramienta } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function HerramientasList() {
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [filteredHerramientas, setFilteredHerramientas] = useState<Herramienta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Crear cliente de Supabase una sola vez
  const supabaseClient = createClientComponentClient();

  useEffect(() => {
    const fetchHerramientas = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabaseClient
          .from('herramientas')
          .select('*')
          .order('nombre');

        if (fetchError) throw fetchError;
        setHerramientas(data || []);
        setFilteredHerramientas(data || []);
      } catch (err) {
        console.error('Error al cargar herramientas:', err);
        setError('Error al cargar las herramientas. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchHerramientas();
  }, [supabaseClient]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredHerramientas(herramientas);
    } else {
      const filtered = herramientas.filter(
        h => h.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
             h.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHerramientas(filtered);
    }
  }, [searchTerm, herramientas]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta herramienta?')) {
      return;
    }

    try {
      const { error: deleteError } = await supabaseClient
        .from('herramientas')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      // Actualizar la lista después de eliminar
      setHerramientas(herramientas.filter(h => h.id !== id));
      setFilteredHerramientas(filteredHerramientas.filter(h => h.id !== id));
    } catch (err) {
      console.error('Error al eliminar la herramienta:', err);
      alert('Error al eliminar la herramienta. Por favor, intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="text-red-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">{error}</h3>
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

  return (
    <div className="space-y-6">
      {herramientas.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar herramientas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
      )}

      {herramientas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="bg-slate-100 p-4 rounded-full inline-flex mb-4">
            <Hammer className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-800 mb-2">No hay herramientas</h3>
          <p className="text-slate-600 mb-6">Comienza creando tu primera herramienta.</p>
          <Link href="/dashboard/herramientas/nueva">
            <Button className="bg-primary-500 hover:bg-primary-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Crear herramienta
            </Button>
          </Link>
        </div>
      ) : filteredHerramientas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-200">
          <p className="text-slate-600 mb-4">No se encontraron herramientas con "{searchTerm}"</p>
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm('')}
          >
            Mostrar todas
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHerramientas.map((herramienta) => (
            <div 
              key={herramienta.id} 
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={herramienta.imagen_url} 
                  alt={herramienta.nombre}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Sin+Imagen';
                  }}
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-semibold text-slate-800">{herramienta.nombre}</h3>
                <p className="text-slate-600 mt-2 line-clamp-2 text-sm h-10">{herramienta.descripcion}</p>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Link href={`/dashboard/herramientas/${herramienta.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-primary-300 text-primary-600 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-400 font-medium shadow-sm"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Editar
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 font-medium shadow-sm"
                    onClick={() => handleDelete(herramienta.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 