'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Calendar, Video, Plus, Search, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import { Taller, TallerConHerramientas, Herramienta } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';

export function BackofficeTalleresList() {
  const [talleres, setTalleres] = useState<TallerConHerramientas[]>([]);
  const [filteredTalleres, setFilteredTalleres] = useState<TallerConHerramientas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
        setFilteredTalleres(talleresConHerramientas);
      } catch (err) {
        console.error('Error al cargar talleres:', err);
        setError('Error al cargar los talleres. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchTalleres();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTalleres(talleres);
    } else {
      const filtered = talleres.filter(
        t => t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
             t.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTalleres(filtered);
    }
  }, [searchTerm, talleres]);

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
      setFilteredTalleres(filteredTalleres.filter(t => t.id !== id));
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
      {talleres.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar talleres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
      )}

      {talleres.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="bg-slate-100 p-4 rounded-full inline-flex mb-4">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-800 mb-2">No hay talleres</h3>
          <p className="text-slate-600 mb-6">Comienza creando tu primer taller.</p>
          <Link href="/backoffice/talleres/nuevo">
            <Button className="bg-primary-500 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Crear taller
            </Button>
          </Link>
        </div>
      ) : filteredTalleres.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-200">
          <p className="text-slate-600 mb-4">No se encontraron talleres con "{searchTerm}"</p>
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm('')}
          >
            Mostrar todos
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTalleres.map((taller) => (
            <div 
              key={taller.id} 
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-slate-800">{taller.nombre}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        taller.tipo === 'vivo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {taller.tipo === 'vivo' ? 'En vivo' : 'Pre-grabado'}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">{taller.descripcion}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/backoffice/talleres/${taller.id}`}>
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
                      onClick={() => handleDelete(taller.id as number)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Eliminar
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                      {taller.tipo === 'vivo' ? (
                        <>
                          <Calendar className="h-4 w-4 mr-1" />
                          Fecha del taller
                        </>
                      ) : (
                        <>
                          <Video className="h-4 w-4 mr-1" />
                          Fecha del taller
                        </>
                      )}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {formatDate(taller.fecha)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Herramientas necesarias
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {taller.herramientas.length > 0 ? (
                        taller.herramientas.map((herramienta) => (
                          <span 
                            key={herramienta.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
                          >
                            {herramienta.nombre}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">No se requieren herramientas</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 