'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

// Asegúrate de que el cliente de Supabase esté correctamente inicializado
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan las variables de entorno de Supabase');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export default function NuevoTaller() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taller, setTaller] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    tipo: 'presencial',
    ubicacion: '',
    // Otros campos necesarios...
  });

  // Función para manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaller(prev => ({ ...prev, [name]: value }));
  };

  // Función de envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado");
    
    if (!taller.titulo || !taller.descripcion) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Asegúrate de que los datos estén en el formato correcto
      const tallerData = {
        titulo: taller.titulo,
        descripcion: taller.descripcion,
        precio: parseFloat(taller.precio) || 0,
        tipo: taller.tipo || 'presencial',
        ubicacion: taller.ubicacion || '',
        // Otros campos necesarios...
      };
      
      console.log("Datos a enviar:", tallerData);
      
      // Insertar en Supabase
      const { data, error } = await supabase
        .from('talleres')
        .insert([tallerData])
        .select();
        
      if (error) {
        throw error;
      }
      
      console.log("Taller creado:", data);
      toast.success('Taller creado exitosamente');
      // Redireccionar después de crear
      router.push('/talleres');
    } catch (error) {
      console.error('Error al crear taller:', error);
      toast.error('Error al crear el taller');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return taller.titulo.trim() !== '' && 
           taller.descripcion.trim() !== '' && 
           taller.precio.trim() !== '';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Nuevo Taller</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={taller.titulo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            required
          />
        </div>
        
        {/* Otros campos del formulario */}
        
        <button 
          type="submit" 
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando...' : 'Crear taller'}
        </button>
      </form>

      <button 
        type="button" 
        className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
        onClick={() => {
          console.log("Botón de prueba clickeado");
          alert("Botón de prueba funciona");
        }}
      >
        Botón de prueba
      </button>
    </div>
  );
} 