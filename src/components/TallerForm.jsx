import React, { useState, useEffect } from 'react';
import WebhookFieldsEditor from './WebhookFieldsEditor';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function TallerForm({ tallerId = null }) {
  // Estado para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [tipo, setTipo] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tags, setTags] = useState([]);
  const [webhookFields, setWebhookFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tallerIdNumerico, setTallerIdNumerico] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const router = useRouter();

  // Cargar datos del taller si estamos en modo edición
  useEffect(() => {
    const fetchTaller = async () => {
      if (!tallerId) return; // Si no hay ID, estamos en modo creación
      
      try {
        // Convertir tallerId a número y guardarlo
        const idNumerico = parseInt(tallerId, 10);
        if (isNaN(idNumerico)) {
          console.error('ID no válido:', tallerId);
          toast.error('ID de taller no válido');
          return;
        }
        setTallerIdNumerico(idNumerico);
        setDebugInfo(`ID del taller a editar: ${idNumerico} (tipo: ${typeof idNumerico})`);
        
        const supabase = createClientComponentClient();
        console.log("Buscando taller con ID:", idNumerico);
        const { data, error } = await supabase
          .from('talleres')
          .select('*')
          .eq('id', idNumerico)
          .single();
          
        if (error) throw error;
        
        if (data) {
          console.log("Cargando datos del taller:", data);
          console.log("Nombres de campos disponibles:", Object.keys(data));
          
          setNombre(data.nombre || '');
          setDescripcion(data.descripcion || '');
          setPrecio(data.precio ? data.precio.toString() : '');
          setTipo(data.tipo || '');
          setVideoUrl(data.video_url || '');
          setTags(Array.isArray(data.tags) ? data.tags : []);
          
          // Usar campos_webhook en lugar de webhookFields
          const camposWebhook = data.campos_webhook;
          console.log("Campos webhook recibidos:", camposWebhook, "tipo:", typeof camposWebhook);
          
          if (camposWebhook === null || camposWebhook === undefined) {
            setWebhookFields({});
          } else if (typeof camposWebhook === 'object' && !Array.isArray(camposWebhook)) {
            setWebhookFields(camposWebhook);
          } else if (typeof camposWebhook === 'string') {
            try {
              // Intentar parsear si es un string JSON
              const parsed = JSON.parse(camposWebhook);
              setWebhookFields(typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {});
            } catch (e) {
              console.error("Error al parsear campos_webhook:", e);
              setWebhookFields({});
            }
          } else {
            setWebhookFields({});
          }
        }
      } catch (error) {
        console.error('Error al cargar el taller:', error);
        toast.error('Error al cargar los datos del taller');
      }
    };
    
    fetchTaller();
  }, [tallerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const supabase = createClientComponentClient();
      
      // Preparar los datos del taller
      const tallerData = {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        tipo,
        video_url: videoUrl,
        tags,
        campos_webhook: webhookFields,
      };
      
      // MODO ACTUALIZACIÓN
      if (tallerIdNumerico) {
        console.log("Actualizando taller con ID:", tallerIdNumerico);
        
        const { error } = await supabase.rpc('actualizar_taller', {
          p_id: tallerIdNumerico,
          p_nombre: nombre,
          p_descripcion: descripcion,
          p_precio: parseFloat(precio),
          p_tipo: tipo,
          p_video_url: videoUrl,
          p_campos_webhook: webhookFields
        });
        
        if (error) {
          console.error("Error al actualizar con RPC:", error);
          throw error;
        }
        
        console.log("Taller actualizado correctamente con RPC");
        toast.success('Taller actualizado con éxito');
      } 
      // MODO CREACIÓN
      else {
        console.log("MODO CREACIÓN - Creando nuevo taller");
        console.log("Datos a insertar:", JSON.stringify(tallerData));
        
        // Crear nuevo taller
        const { error } = await supabase
          .from('talleres')
          .insert([tallerData]);
        
        if (error) {
          console.error("Error al crear taller:", error);
          throw new Error(`Error al crear: ${error.message}`);
        }
        
        console.log("Nuevo taller creado correctamente");
        toast.success('Taller creado con éxito');
      }
      
      // Redireccionar a la lista de talleres
      setTimeout(() => {
        router.push('/dashboard/talleres');
      }, 1000);
    } catch (error) {
      console.error('Error al guardar el taller:', error);
      toast.error('Error al guardar el taller: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {tallerIdNumerico && (
        <div className="bg-blue-50 p-2 rounded border border-blue-200 mb-4">
          <p className="text-blue-800">
            Editando taller con ID: {tallerIdNumerico}
          </p>
          <p className="text-xs text-blue-600">{debugInfo}</p>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Nombre
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
          rows={4}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Precio
        </label>
        <input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Tipo
        </label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
          required
        >
          <option value="">Seleccionar tipo</option>
          <option value="En vivo">En vivo</option>
          <option value="Grabado">Grabado</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          URL del Video
        </label>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Campos para webhook
        </label>
        <WebhookFieldsEditor
          value={webhookFields}
          onChange={setWebhookFields}
        />
        <p className="text-xs text-gray-500 mt-1">
          Ingresa pares de llave-valor para enviar en las notificaciones webhook
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push('/dashboard/talleres')}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {isSubmitting ? 'Guardando...' : (tallerIdNumerico ? 'Actualizar' : 'Crear')}
        </button>
      </div>
    </form>
  );
} 