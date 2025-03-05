import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getNextId } from '@/lib/getNextId';

const TallerForm = ({ tallerId }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log("TallerForm inicializado con ID:", tallerId);
    console.log("Tipo de tallerId:", typeof tallerId);
    
    const tallerIdNumerico = tallerId ? parseInt(tallerId.toString(), 10) : null;
    console.log("ID convertido a número:", tallerIdNumerico);
    console.log("¿Es un número válido?", !isNaN(tallerIdNumerico) && tallerIdNumerico > 0);
    
    setIsEditing(!!tallerIdNumerico && !isNaN(tallerIdNumerico) && tallerIdNumerico > 0);
  }, [tallerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Botón de envío clickeado");
    
    if (Object.keys(errors).length > 0) {
      console.log("Errores de formulario:", errors);
      return;
    }
    
    console.log("Datos del formulario:", {
      nombre,
      descripcion,
      video_url: videoUrl,
      tipo,
      fecha_vivo: fechaVivo,
      precio,
      campos_webhook: webhookFields
    });
    
    const tallerIdNumerico = tallerId ? parseInt(tallerId.toString(), 10) : null;
    const isValidId = !!tallerIdNumerico && !isNaN(tallerIdNumerico) && tallerIdNumerico > 0;
    
    console.log("=== DEPURACIÓN DETALLADA ===");
    console.log("ID a procesar:", tallerIdNumerico);
    console.log("Tipo de ID:", typeof tallerIdNumerico);
    console.log("¿Es un ID válido para actualizar?", isValidId);
    
    try {
      const tallerData = {
        nombre,
        descripcion,
        video_url: videoUrl,
        tipo,
        fecha_vivo: fechaVivo || null,
        precio: parseFloat(precio),
        campos_webhook: webhookFields || {}
      };
      
      console.log("Datos a guardar:", JSON.stringify(tallerData, null, 2));
      
      let result;
      
      if (isValidId) {
        console.log(`Actualizando taller con ID: ${tallerIdNumerico}`);
        
        const { data, error, status } = await supabase
          .from('talleres')
          .update(tallerData)
          .eq('id', tallerIdNumerico)
          .select();
        
        console.log("Respuesta de actualización:", { data, error, status });
        
        if (error) {
          throw new Error(`Error al actualizar taller: ${error.message}`);
        }
        
        result = data;
        console.log("Taller actualizado exitosamente:", result);
      } else {
        console.log("Creando nuevo taller...");
        const nextId = await getNextId('talleres');
        console.log("ID asignado para el nuevo taller:", nextId);
        
        const { data, error } = await supabase
          .from('talleres')
          .insert({ ...tallerData, id: nextId })
          .select();
        
        if (error) {
          throw new Error(`Error al crear taller: ${error.message}`);
        }
        
        result = data;
        console.log("Taller creado exitosamente:", result);
      }
      
      setMessage(isValidId ? "Taller actualizado correctamente" : "Taller creado correctamente");
      
      setTimeout(() => {
        router.push('/dashboard/talleres');
        router.refresh();
      }, 1500);
      
    } catch (error) {
      console.error("Error:", error.message);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      {/* Renderiza el formulario */}
    </div>
  );
};

export default TallerForm; 