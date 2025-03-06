'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function RegistroForm({ tallerId, referidoPor }: { tallerId: string; referidoPor?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      // Preparar los datos para enviar, incluyendo el referido si existe
      const registroData = {
        ...data,
        tallerId: tallerId,
        referidoPor: referidoPor || null,
      };
      
      // Enviar los datos a la API en lugar de usar supabase directamente
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registroData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrarse');
      }
      
      toast.success('Registro completado con éxito');
      // reset(); // Descomenta si tienes una función reset definida
    } catch (error) {
      console.error('Error al registrarse:', error);
      toast.error(error instanceof Error ? error.message : 'Error al completar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Renderiza el formulario aquí */}
    </div>
  );
} 