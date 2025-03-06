'use client';

import { Taller } from '@/lib/types';
import { VideoEmbed } from '@/components/video-embed';
import { TallerRegistro } from '@/components/taller-registro';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';

interface TallerPageClientProps {
  taller: Taller;
  referidoPor?: string;
}

export function TallerPageClient({ taller, referidoPor }: TallerPageClientProps) {
  // Calcular precio en USD (1 USD = 4000 COP)
  const precioUSD = taller.precio ? Math.round((taller.precio / 4000) * 10) / 10 : 0;

  return (
    <div className="bg-[#f8f5f0] min-h-screen">
      {/* Barra superior con logo y botón de volver */}
      <div className="bg-white py-4 px-6 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Image 
              src="/aztec-logo.png" 
              alt="Aztec" 
              width={120} 
              height={40}
            />
          </div>
          <Link href="/talleres" className="text-emerald-700 hover:text-emerald-800 border border-emerald-700 rounded-md px-4 py-2 text-sm font-medium">
            ← Volver al inicio
          </Link>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Encabezado del taller */}
        <div className="bg-emerald-800 text-white py-10 px-6 rounded-lg mb-8 text-center">
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
                <h2 className="text-xl font-semibold mb-4">Herramientas que utilizaremos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {taller.herramientas.map((herramientaId: number, index: number) => {
                    // Determinar la imagen de la herramienta basada en el ID
                    const herramientaImg = `/herr-${herramientaId}.png`;
                    
                    return (
                      <div key={index} className="bg-[#f8f5f0] p-4 rounded-lg text-center">
                        <div className="flex justify-center items-center h-16 mb-2">
                          <Image 
                            src={herramientaImg}
                            alt={`Herramienta ${index + 1}`}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        </div>
                        <p className="text-sm font-medium">Herramienta {herramientaId}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - 1/3 del ancho en desktop */}
          <div className="space-y-6">
            {/* Componente de registro */}
            <TallerRegistro taller={taller} referidoPor={referidoPor} />
            
            {/* Fechas disponibles para talleres en vivo */}
            {(taller.tipo === 'vivo' || taller.tipo === 'live_build') && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Fechas disponibles</h3>
                <div className="space-y-4">
                  {taller.fecha_vivo && (
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{format(new Date(taller.fecha_vivo), 'EEEE', { locale: es })}</p>
                          <p className="text-sm text-gray-500">{format(new Date(taller.fecha_vivo), 'd \'de\' MMMM', { locale: es })}</p>
                          <p className="text-sm text-gray-500">{format(new Date(taller.fecha_vivo), 'h:mm a', { locale: es })}</p>
                        </div>
                        <div className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {taller.capacidad && taller.capacidad > 0 ? `${taller.capacidad} cupos disponibles` : 'Cupos limitados'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {taller.fecha_live_build && (
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{format(new Date(taller.fecha_live_build), 'EEEE', { locale: es })}</p>
                          <p className="text-sm text-gray-500">{format(new Date(taller.fecha_live_build), 'd \'de\' MMMM', { locale: es })}</p>
                          <p className="text-sm text-gray-500">{format(new Date(taller.fecha_live_build), 'h:mm a', { locale: es })}</p>
                        </div>
                        <div className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          No hay cupos disponibles
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