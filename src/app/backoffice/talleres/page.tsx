'use client';

import React from 'react';
import { BackofficeTalleresList } from '@/components/backoffice/talleres-list';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BackofficeTalleresPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Talleres</h1>
          <p className="text-muted-foreground">
            Gestiona los talleres disponibles en la plataforma
          </p>
        </div>
        
        <Button 
          asChild
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md shadow-md"
        >
          <Link href="/backoffice/talleres/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Taller
          </Link>
        </Button>
      </div>
      
      <BackofficeTalleresList />
      
      <div className="flex justify-center mt-8">
        <a 
          href="/backoffice/talleres/nuevo" 
          className="inline-flex items-center justify-center px-6 py-4 bg-emerald-700 text-white font-medium text-lg rounded-md hover:bg-emerald-800 transition-colors shadow-md"
        >
          <PlusCircle className="mr-2 h-6 w-6" />
          Crear Nuevo Taller
        </a>
      </div>
    </div>
  );
} 