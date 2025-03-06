'use client';

import { Taller, TallerConHerramientas } from '@/lib/types';
import { VideoEmbed } from '@/components/video-embed';
import { TallerRegistro } from '@/components/taller-registro';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Componente para el aviso intermitente de Live Build
const LiveBuildAlert = () => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(prev => !prev);
    }, 800);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={`bg-red-600 text-white font-bold py-1 px-3 rounded-md text-sm ${visible ? 'opacity-100' : 'opacity-50'} transition-opacity duration-300`}>
      LIVE BUILD PRONTO
    </div>
  );
};

interface TallerPageClientProps {
  taller: TallerConHerramientas;
  referidoPor?: string;
}

export function TallerPageClient({ taller, referidoPor }: TallerPageClientProps) {
  // Calcular precio en USD (1 USD = 4000 COP)
  const precioUSD = taller.precio ? Math.round((taller.precio / 4000) * 10) / 10 : 0;

  // Función para verificar si una fecha es futura
  const esFechaFutura = (fechaISO?: string) => {
    if (!fechaISO) return false;
    try {
      const fecha = parseISO(fechaISO);
      return fecha > new Date();
    } catch (error) {
      console.error('Error al parsear fecha:', error);
      return false;
    }
  };

  return (
    <div className="bg-[#f8f5f0] min-h-screen">
      {/* Barra superior con logo y botón de volver - FIJA */}
      <div className="bg-[#f2efe7] py-1 px-3 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto w-[65%] flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/aztec-logo-new.png" 
              alt="Logo de Aztec - Plataforma de talleres y cursos" 
              width={200} 
              height={70}
              priority
              unoptimized
            />
          </Link>
          <Link href="/talleres" className="text-[#1b5e4f] hover:text-[#0d4a3d] border border-[#1b5e4f] rounded-md px-3 py-1 text-sm font-medium transition-all duration-300 hover:bg-[#1b5e4f] hover:text-white">
            ← Volver al inicio
          </Link>
        </div>
      </div>

      {/* Espacio para compensar la barra fija */}
      <div className="pt-16"></div>

      {/* Contenido principal */}
      <div className="container mx-auto w-[65%] px-4 py-8">
        {/* Encabezado del taller */}
        <div className="bg-[#1b5e4f] text-white py-6 px-6 rounded-lg mb-8 text-center relative">
          {esFechaFutura(taller.fecha_live_build) && (
            <div className="absolute top-2 left-2">
              <LiveBuildAlert />
            </div>
          )}
          <h1 className="text-2xl font-bold mb-3">{taller.nombre}</h1>
          <p className="text-base mb-4">
            {taller.tipo === 'pregrabado' 
              ? 'Sube un extracto bancario y automatiza el seguimiento de tus gastos' 
              : 'Aprende a automatizar procesos y optimizar tu flujo de trabajo'}
          </p>
          <div className="text-center">
            <p className="text-xl font-bold">
              COP ${taller.precio?.toLocaleString('es-CO') || 0} / USD ${precioUSD}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal - 2/3 del ancho en desktop */}
          <div className="lg:col-span-2 space-y-8">
            {/* Qué aprenderás */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-2xl font-bold mb-4">¿Qué aprenderás?</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: taller.descripcion || '' }} />
            </div>
            
            {/* Video del taller */}
            {taller.video_url && (
              <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Video del taller</h2>
                <div className="aspect-video">
                  <VideoEmbed url={taller.video_url} />
                </div>
              </div>
            )}
            
            {/* Herramientas */}
            {taller.herramientas && taller.herramientas.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Herramientas que utilizaremos</h2>
                <div className="flex overflow-x-auto pb-4 space-x-6" style={{ scrollbarWidth: 'thin' }}>
                  {taller.herramientas.map((herramienta, index) => {
                    // Usar la imagen de la base de datos si existe, o la imagen local como respaldo
                    const imagenUrl = herramienta.imagen_url || `/images/herramientas/herr-default.svg`;
                    
                    return (
                      <div 
                        key={herramienta.id || index} 
                        className="flex-shrink-0 bg-[#f8f5f0] p-3 rounded-lg text-center flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:transform hover:-translate-y-1 hover:bg-white cursor-pointer group"
                        style={{ width: '200px', minHeight: '220px' }}
                      >
                        <div className="flex justify-center items-center h-36 mb-2">
                          <div className="border border-black p-2 rounded-lg bg-white transition-all duration-300 hover:border-[#1b5e4f] hover:border-2">
                            <Image 
                              src={imagenUrl}
                              alt={`Herramienta: ${herramienta.nombre || 'Herramienta para el taller'}`}
                              width={100}
                              height={140}
                              className="object-contain transition-transform duration-300 group-hover:scale-105"
                              unoptimized
                            />
                          </div>
                        </div>
                        <h3 className="text-base font-bold mb-1 text-[#1b5e4f] transition-colors duration-300 hover:text-[#0d4a3d]">{herramienta.nombre}</h3>
                        <p className="text-sm text-gray-600" style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>{herramienta.descripcion}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - 1/3 del ancho en desktop - FIJO */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Componente de registro */}
            <TallerRegistro taller={taller as any} referidoPor={referidoPor} />
            
            {/* Fechas disponibles para talleres en vivo */}
            {(taller.tipo === 'vivo' || taller.tipo === 'live_build') && (
              <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Fechas disponibles</h3>
                <div className="space-y-4">
                  {taller.fecha_vivo && (
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#1b5e4f] text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Próxima sesión</div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(taller.fecha_vivo), "d 'de' MMMM, yyyy", { locale: es })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Detalles del taller */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Detalles del taller</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#1b5e4f] text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Duración</div>
                    <div className="text-sm text-gray-600">2 horas aproximadamente</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-[#1b5e4f] text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Capacidad</div>
                    <div className="text-sm text-gray-600">{taller.capacidad || 20} participantes</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-[#1b5e4f] text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Nivel</div>
                    <div className="text-sm text-gray-600">Principiante - No se requiere experiencia previa</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 