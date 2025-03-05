'use client';

import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import RegistrationForm from '@/components/registration-form';
import { useEffect, useState } from 'react';
import React from 'react';
import { safeInteger } from '@/lib/utils';

// Función para obtener un taller por ID
async function fetchTaller(id: number) {
  console.log('Intentando obtener taller con ID:', id);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Faltan variables de entorno de Supabase');
    throw new Error('Faltan variables de entorno de Supabase');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Obtener el taller con sus datos básicos
    const { data, error } = await supabase
      .from('talleres')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error al obtener taller:', error);
      return null;
    }
    
    // Obtener las herramientas asociadas al taller
    if (data && data.herramientas && Array.isArray(data.herramientas)) {
      const { data: herramientasData, error: herramientasError } = await supabase
        .from('herramientas')
        .select('*')
        .in('id', data.herramientas);
      
      if (!herramientasError && herramientasData) {
        // Añadir las herramientas completas al objeto del taller
        return {
          ...data,
          herramientasDetalle: herramientasData
        };
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error en la consulta a Supabase:', error);
    return null;
  }
}

// Función para obtener las fechas de un taller
async function fetchTallerFechas(tallerId: number) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan variables de entorno de Supabase');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('talleres')
    .select('fecha_vivo, fecha_live_build')
    .eq('id', tallerId)
    .single();
  
  if (error) {
    console.error('Error al obtener fechas del taller:', error);
    return null;
  }
  
  return data;
}

// Componente para embeber videos
function VideoEmbed({ url }: { url: string }) {
  if (!url) {
    console.log('No se proporcionó URL de video');
    return null;
  }
  
  try {
    console.log('Procesando URL de video:', url);
    // Procesar URL de YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
      }
      
      console.log('YouTube video ID:', videoId);
      
      if (videoId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full aspect-video rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }
    
    // Procesar URL de Vimeo
    if (url.includes('vimeo.com')) {
      const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0] || '';
      console.log('Vimeo video ID:', vimeoId);
      
      if (vimeoId) {
        return (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            className="w-full aspect-video rounded-lg"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }
    
    // Si no se pudo procesar la URL
    return (
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">No se pudo cargar el video</p>
      </div>
    );
  } catch (error) {
    console.error('Error al procesar URL de video:', error);
    return (
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">Error al cargar el video</p>
      </div>
    );
  }
}

export default function TallerPage({ params }: { params: Promise<{ id: string }> }) {
  // Usar React.use() para desenvolver params (recomendado por Next.js)
  const unwrappedParams = React.use(params) as { id: string };
  const pageIdRaw = unwrappedParams.id;
  
  // Convertir a un entero seguro
  const pageId = safeInteger(pageIdRaw, 0);
  
  // Si el ID no es válido, redirigir a la página principal
  if (pageId === 0) {
    // Usar useEffect para redirigir, ya que redirect() no se puede usar directamente en el cuerpo del componente
    useEffect(() => {
      redirect('/talleres');
    }, []);
    return null;
  }
  
  const [taller, setTaller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTaller() {
      try {
        console.log('Fetching taller with ID:', pageId);
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Faltan variables de entorno de Supabase');
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Obtener el taller con sus datos básicos
        const { data, error: tallerError } = await supabase
          .from('talleres')
          .select('*')
          .eq('id', pageId)
          .single();
        
        if (tallerError) {
          throw tallerError;
        }
        
        if (!data) {
          notFound();
          return;
        }
        
        // Obtener las herramientas asociadas al taller
        let tallerConHerramientas = { ...data };
        
        if (data.herramientas && Array.isArray(data.herramientas)) {
          const { data: herramientasData, error: herramientasError } = await supabase
            .from('herramientas')
            .select('*')
            .in('id', data.herramientas);
          
          if (!herramientasError && herramientasData) {
            tallerConHerramientas.herramientasDetalle = herramientasData;
          }
        }
        
        setTaller(tallerConHerramientas);
      } catch (err) {
        console.error('Error al cargar el taller:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    }
    
    loadTaller();
  }, [pageId]); // Usar pageId en lugar de params.id

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-emerald-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-emerald-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-emerald-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !taller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-slate-200 max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">
            {error ? error.message : 'No se pudo encontrar el taller'}
          </h3>
          <Link href="/" className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-md">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    try {
      return format(new Date(dateString), 'PPP', { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con logo y botón de volver */}
      <header className="bg-[#f0ece7] py-4 px-6 flex justify-between items-center">
        <div>
          <img src="/aztec-logo.svg" alt="Aztec" className="h-10" />
        </div>
        <Link href="/" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
          ← Volver al inicio
        </Link>
      </header>
      
      {/* Banner principal */}
      <div className="bg-[#1a5a4c] text-white py-10 px-6 text-center">
        <h1 className="text-3xl font-bold mb-2">{taller.nombre}</h1>
        <p className="max-w-3xl mx-auto">{taller.descripcion}</p>
      </div>
      
      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Detalles del taller</h2>
          <p className="mb-4">
            <strong>Precio:</strong> {taller.precio ? `$${taller.precio.toLocaleString()}` : 'Gratis'}
          </p>
          <p className="mb-4">
            <strong>Tipo:</strong> {taller.tipo === 'pre_grabado' ? 'Pre-grabado' : 'En vivo'}
          </p>
          
          {taller.video_url && (
            <div className="mt-6 mb-8">
              <h3 className="text-xl font-bold mb-3">Video del taller</h3>
              <VideoEmbed url={taller.video_url} />
            </div>
          )}
          
          {/* Sección de herramientas */}
          {taller.herramientasDetalle && taller.herramientasDetalle.length > 0 && (
            <div className="mt-8 mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Herramientas necesarias
              </h3>
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                <p className="text-slate-600 mb-4">Para este taller necesitarás las siguientes herramientas:</p>
                <div className="flex flex-row overflow-x-auto gap-4 pb-2">
                  {taller.herramientasDetalle.map((herramienta: any) => (
                    <div 
                      key={herramienta.id}
                      className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col flex-shrink-0"
                      style={{ width: '180px' }}
                    >
                      {herramienta.imagen_url ? (
                        <div className="w-full aspect-[4/3] overflow-hidden">
                          <img 
                            src={herramienta.imagen_url} 
                            alt={herramienta.nombre}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/200?text=H';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-[4/3] bg-emerald-100 text-emerald-700 flex items-center justify-center text-4xl font-bold">
                          {herramienta.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="font-medium text-slate-800 text-center">{herramienta.nombre}</h4>
                        <p className="text-xs text-slate-500 mt-1 text-center">{herramienta.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Sección de registro */}
          <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Regístrate para este taller</h2>
              <p className="text-gray-600 mb-6">
                Completa el formulario para reservar tu lugar en este taller.
              </p>
              
              {/* Usa el componente cliente aquí */}
              <RegistrationForm tallerId={pageId} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 