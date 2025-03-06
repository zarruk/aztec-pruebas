'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function GeneradorReferidos() {
  const [tallerId, setTallerId] = useState('');
  const [userId, setUserId] = useState('');
  const [urlReferido, setUrlReferido] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generarUrl = async () => {
    if (!tallerId || !userId) {
      toast.error('Debes ingresar el ID del taller y del usuario');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/talleres/referido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tallerId,
          userId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al generar URL');
      }

      setUrlReferido(data.url);
      toast.success('URL de referido generada con éxito');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar URL de referido');
    } finally {
      setIsLoading(false);
    }
  };

  const copiarUrl = () => {
    navigator.clipboard.writeText(urlReferido);
    toast.success('URL copiada al portapapeles');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Generador de URLs de Referidos</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Generar nueva URL de referido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ID del Taller</label>
              <Input
                type="text"
                value={tallerId}
                onChange={(e) => setTallerId(e.target.value)}
                placeholder="Ej: 6"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">ID del Usuario</label>
              <Input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Ej: 1"
              />
            </div>
            
            <Button 
              onClick={generarUrl} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Generando...' : 'Generar URL de Referido'}
            </Button>
            
            {urlReferido && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <p className="font-medium mb-2">URL generada:</p>
                <div className="flex items-center gap-2">
                  <Input value={urlReferido} readOnly />
                  <Button onClick={copiarUrl} variant="outline">Copiar</Button>
                </div>
                <p className="mt-2 text-sm">
                  <a href={urlReferido} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Abrir en nueva pestaña
                  </a>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
