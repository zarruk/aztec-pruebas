'use client';

import { Taller } from '@/lib/types';
import RegistroForm from './registro-form';

export default function TallerDetalle({ taller, referidoPor }: { taller: Taller; referidoPor?: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{taller.nombre}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: taller.descripcion || '' }} />
      </div>
      
      {taller.imagen_url && (
        <div className="mb-8">
          <img 
            src={taller.imagen_url} 
            alt={taller.nombre} 
            className="w-full max-h-96 object-cover rounded-lg"
          />
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Regístrate en este taller</h2>
        <RegistroForm tallerId={taller.id?.toString() || ''} referidoPor={referidoPor} />
      </div>
    </div>
  );
} 