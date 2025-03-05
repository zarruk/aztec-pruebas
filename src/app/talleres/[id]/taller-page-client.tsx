'use client';

import { Taller } from '@/lib/types';
import { VideoEmbed } from '@/components/video-embed';
import { TallerRegistro } from '@/components/taller-registro';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

interface TallerPageClientProps {
  taller: Taller;
}

export function TallerPageClient({ taller }: TallerPageClientProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenido principal - 2/3 del ancho en desktop */}
        <div className="lg:col-span-2 space-y-6">
          {/* Imagen del taller */}
          <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden">
            {taller.imagen_url ? (
              <Image 
                src={taller.imagen_url} 
                alt={taller.nombre}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Sin imagen</p>
              </div>
            )}
          </div>
          
          {/* Título y descripción */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{taller.nombre}</h1>
            <div className="prose max-w-none">
              <p>{taller.descripcion}</p>
            </div>
          </div>
          
          {/* Video del taller */}
          {taller.video_url && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Video del taller</h2>
              <div className="aspect-video">
                <VideoEmbed url={taller.video_url} />
              </div>
            </div>
          )}
          
          {/* Herramientas */}
          {taller.herramientas && taller.herramientas.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Herramientas que utilizaremos</h2>
              <ul className="list-disc pl-5 space-y-1">
                {taller.herramientas.map((herramienta: string, index: number) => (
                  <li key={index}>{herramienta}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Fechas para talleres live */}
          {taller.tipo === 'live' && (taller.fecha_vivo || taller.fecha_live_build) && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Fechas programadas</h2>
              <div className="space-y-2">
                {taller.fecha_vivo && (
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Taller en vivo
                    </span>
                    <span>
                      {format(new Date(taller.fecha_vivo), 'PPP', { locale: es })}
                    </span>
                  </div>
                )}
                {taller.fecha_live_build && (
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Live build
                    </span>
                    <span>
                      {format(new Date(taller.fecha_live_build), 'PPP', { locale: es })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar - 1/3 del ancho en desktop */}
        <div className="space-y-6">
          {/* Componente de registro */}
          <TallerRegistro taller={taller} />
          
          {/* Información adicional */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Información del taller</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Tipo de taller</p>
                <p className="font-medium">
                  {taller.tipo === 'live' ? 'Taller en vivo' : 'Taller pregrabado'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Precio</p>
                <p className="font-medium">
                  {taller.precio > 0 ? `$${taller.precio} MXN` : 'Gratuito'}
                </p>
              </div>
              
              {taller.capacidad > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Capacidad</p>
                  <p className="font-medium">{taller.capacidad} personas</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Logo de Aztec */}
          <div className="flex justify-center p-4">
            <Image 
              src="/aztec-logo.png" 
              alt="Aztec" 
              width={120} 
              height={40}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 