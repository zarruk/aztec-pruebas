"use client";

import React from 'react';
import TallerForm from '@/components/TallerForm';

interface EditarTallerPageProps {
  params: Promise<any> | { id: string };
}

export default function EditarTallerPage({ params }: EditarTallerPageProps) {
  const unwrappedParams = params instanceof Promise ? React.use(params) : params;
  
  const id = unwrappedParams.id;
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Taller</h1>
      <TallerForm tallerId={id} />
    </div>
  );
} 