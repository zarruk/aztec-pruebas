"use client";

import React from 'react';
import TallerForm from '@/components/TallerForm';

interface EditarTallerPageProps {
  params: Promise<any>;
}

export default function EditarTallerPage({ params }: EditarTallerPageProps) {
  // Convertir params a Promise si no lo es
  const paramsPromise = params instanceof Promise ? params : Promise.resolve(params);
  const unwrappedParams = React.use(paramsPromise);
  
  const id = unwrappedParams.id;
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Taller</h1>
      <TallerForm tallerId={id} />
    </div>
  );
} 