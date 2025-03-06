import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistroForm({ tallerId, referidoPor }: { tallerId: string; referidoPor?: string }) {
  const router = useRouter();
  const supabase = createServerComponentClient({ cookies });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: RegistroFormValues) => {
    setIsLoading(true);
    
    try {
      // Preparar los datos para enviar, incluyendo el referido si existe
      const registroData = {
        ...data,
        taller_id: tallerId,
        referido_por: referidoPor || null,
      };
      
      const { error } = await supabase.from('registros').insert(registroData);
      
      if (error) throw error;
      
      toast.success('Registro completado con éxito');
      reset();
    } catch (error) {
      console.error('Error al registrarse:', error);
      toast.error('Error al completar el registro');
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