'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TallerForm } from '@/app/dashboard/talleres/components/taller-form';
import { Taller } from '@/lib/types';

interface TallerEditorClientProps {
  taller: Taller;
}

export function TallerEditorClient({ taller }: TallerEditorClientProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!taller) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>No se pudo cargar el taller</p>
        <button 
          onClick={() => router.back()} 
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      <TallerForm taller={taller} onError={setError} />
    </>
  );
} 