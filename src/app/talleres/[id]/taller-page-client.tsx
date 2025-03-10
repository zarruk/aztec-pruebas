'use client';

import { TallerConHerramientas, Herramienta } from '@/lib/types';
import { VideoEmbed } from '@/components/video-embed';
import { TallerRegistro } from '@/components/taller-registro';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import Image from 'next/image';
import Link from 'next/link';

interface TallerPageClientProps {
  taller: TallerConHerramientas;
  referidoPor?: string;
}

export function TallerPageClient({ taller, referidoPor }: TallerPageClientProps) {
  // Calcular precio en USD (1 USD = 4000 COP)
  const precioUSD = taller.precio ? Math.round((taller.precio / 4000) * 10) / 10 : 0;

  return (
    <div className="bg-[#fffdf9] min-h-screen">
      {/* Navbar - FIJO */}
      <header className="bg-[#fffdf9] py-1 px-3 md:px-4 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="container mx-auto w-full md:w-[65%] flex justify-start items-center">
          <Link href="/" className="flex items-center">
            <img 
              src="/aztec-logo-new.png" 
              alt="Aztec Logo" 
              className="h-12 md:h-16 w-auto object-contain"
            />
          </Link>
        </div>
      </header>

      {/* Espacio para compensar la barra fija */}
      <div className="pt-20"></div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8 w-full md:w-[65%]">
        {/* Encabezado del taller */}
        <div className="bg-[#2a7c60] text-white py-10 px-6 rounded-lg mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">{taller.nombre}</h1>
          <p className="text-lg mb-6">
            {taller.tipo === 'pregrabado' 
              ? 'Sube un extracto bancario y automatiza el seguimiento de tus gastos' 
              : 'Aprende a automatizar procesos y optimizar tu flujo de trabajo'}
          </p>
          <div className="text-center">
            <p className="text-2xl font-bold">
              COP ${taller.precio?.toLocaleString('es-CO') || 0} / USD ${precioUSD}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal - 2/3 del ancho en desktop */}
          <div className="lg:col-span-2 space-y-8">
            {/* Qué aprenderás */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">¿Qué aprenderás?</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: taller.descripcion || '' }} />
            </div>
            
            {/* Video del taller */}
            {taller.video_url && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Video del taller</h2>
                <div className="aspect-video">
                  <VideoEmbed url={taller.video_url} />
                </div>
              </div>
            )}
            
            {/* Herramientas */}
            {taller.herramientas && taller.herramientas.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Herramientas que utilizaremos</h2>
                <div className="flex flex-row overflow-x-auto pb-4 gap-4 md:gap-6 scrollbar-hide -mx-6 px-6">
                  {taller.herramientas.map((herramienta: Herramienta, index: number) => (
                    <div 
                      key={herramienta.id} 
                      className="bg-[#fffdf9] p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center flex-shrink-0"
                      style={{ width: '160px', minWidth: '160px', height: '250px' }}
                    >
                      <div className="flex justify-center items-center mb-4 bg-white p-3 rounded-lg w-24 h-24 border border-gray-200">
                        {herramienta.imagen_url ? (
                          <img 
                            src={herramienta.imagen_url} 
                            alt={herramienta.nombre}
                            className="w-20 h-20 object-contain"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-[#2a7c60] rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <h3 className="text-base font-semibold mb-2 text-[#2a7c60] text-center">{herramienta.nombre}</h3>
                      <p className="text-xs text-gray-600 text-center line-clamp-4">{herramienta.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - 1/3 del ancho en desktop - FIJO */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Componente de registro */}
            <TallerRegistro taller={taller} referidoPor={referidoPor} />
            
            {/* Fechas disponibles para talleres en vivo */}
            {(taller.tipo === 'vivo' || taller.tipo === 'live_build') && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Fecha del taller</h3>
                <div className="space-y-4">
                  {taller.fecha && (
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{format(new Date(taller.fecha), 'EEEE', { locale: es })}</p>
                          <p className="text-sm text-gray-500">{format(new Date(taller.fecha), 'd \'de\' MMMM', { locale: es })}</p>
                          <p className="text-sm text-gray-500">{format(new Date(taller.fecha), 'h:mm a', { locale: es })}</p>
                        </div>
                        <div className="bg-[#2a7c60] text-white text-xs font-medium px-2.5 py-0.5 rounded">
                          {taller.capacidad && taller.capacidad > 0 ? `${taller.capacidad} cupos disponibles` : 'Cupos limitados'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 