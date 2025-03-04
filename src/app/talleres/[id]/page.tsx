import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Función para obtener un taller por ID
async function fetchTaller(id: number) {
  console.log('Intentando obtener taller con ID:', id);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Faltan variables de entorno de Supabase');
    throw new Error('Faltan variables de entorno de Supabase');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data, error } = await supabase
      .from('talleres')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error al obtener taller:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error en la consulta a Supabase:', error);
    return null;
  }
}

// Función para obtener las fechas de un taller
async function fetchTallerFechas(tallerId: number) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan variables de entorno de Supabase');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('talleres')
    .select('fecha_vivo, fecha_live_build')
    .eq('id', tallerId)
    .single();
  
  if (error) {
    console.error('Error al obtener fechas del taller:', error);
    return null;
  }
  
  return data;
}

// Componente para embeber videos
function VideoEmbed({ url }: { url: string }) {
  if (!url) {
    console.log('No se proporcionó URL de video');
    return null;
  }
  
  try {
    console.log('Procesando URL de video:', url);
    // Procesar URL de YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
      }
      
      console.log('YouTube video ID:', videoId);
      
      if (videoId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full aspect-video rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }
    
    // Procesar URL de Vimeo
    if (url.includes('vimeo.com')) {
      const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0] || '';
      console.log('Vimeo video ID:', vimeoId);
      
      if (vimeoId) {
        return (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            className="w-full aspect-video rounded-lg"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }
    
    // Si no se pudo procesar la URL
    return (
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">No se pudo cargar el video</p>
      </div>
    );
  } catch (error) {
    console.error('Error al procesar URL de video:', error);
    return (
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">Error al cargar el video</p>
      </div>
    );
  }
}

export default async function TallerPage({ params }: { params: { id: string } }) {
  try {
    // Validar que el ID sea un número
    const id = parseInt(params.id);
    if (isNaN(id)) {
      console.log('ID no válido, redirigiendo a la página principal');
      redirect('/');
    }
    
    console.log('Fetching taller with ID:', id);
    const taller = await fetchTaller(id);
    
    if (!taller) {
      console.log('Taller no encontrado, mostrando página de error');
      return (
        <div className="min-h-screen bg-[#f0ece7]">
          <header className="bg-[#f0ece7] py-4 px-6 flex justify-between items-center">
            <div>
              <img src="/aztec-logo.svg" alt="Aztec" className="h-10" />
            </div>
            <Link href="/" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
              ← Volver al inicio
            </Link>
          </header>
          
          <div className="bg-[#1a5a4c] text-white py-10 px-6 text-center">
            <h1 className="text-3xl font-bold mb-2">Taller no encontrado</h1>
            <p className="max-w-3xl mx-auto">El taller que buscas no existe o ha sido eliminado.</p>
          </div>
          
          <div className="max-w-6xl mx-auto px-4 py-8 text-center">
            <Link href="/" className="inline-block bg-[#1a5a4c] text-white py-2 px-6 rounded-md hover:bg-[#134439] transition-colors">
              Ver todos los talleres disponibles
            </Link>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-[#f0ece7]">
        {/* Header con logo y botón de volver */}
        <header className="bg-[#f0ece7] py-4 px-6 flex justify-between items-center">
          <div>
            <img src="/aztec-logo.svg" alt="Aztec" className="h-10" />
          </div>
          <Link href="/" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
            ← Volver al inicio
          </Link>
        </header>
        
        {/* Banner principal */}
        <div className="bg-[#1a5a4c] text-white py-10 px-6 text-center">
          <h1 className="text-3xl font-bold mb-2">{taller.nombre}</h1>
          <p className="max-w-3xl mx-auto">{taller.descripcion}</p>
        </div>
        
        {/* Contenido principal */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Detalles del taller</h2>
            <p className="mb-4">
              <strong>Precio:</strong> {taller.precio ? `$${taller.precio.toLocaleString()}` : 'Gratis'}
            </p>
            <p className="mb-4">
              <strong>Tipo:</strong> {taller.tipo === 'pre_grabado' ? 'Pre-grabado' : 'En vivo'}
            </p>
            
            {taller.video_url && (
              <div className="mt-6 mb-6">
                <h3 className="text-xl font-bold mb-3">Video del taller</h3>
                <VideoEmbed url={taller.video_url} />
              </div>
            )}
            
            {/* Formulario simplificado */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Registrarse al taller</h3>
              <form className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium mb-1">Nombre completo</label>
                  <input
                    id="nombre"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-[#1a5a4c] text-white py-2 px-4 rounded-md hover:bg-[#134439] transition-colors"
                >
                  Registrarme al taller
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error al procesar la página:', error);
    return (
      <div className="min-h-screen bg-[#f0ece7]">
        {/* Header con logo y botón de volver */}
        <header className="bg-[#f0ece7] py-4 px-6 flex justify-between items-center">
          <div>
            <img src="/aztec-logo.svg" alt="Aztec" className="h-10" />
          </div>
          <Link href="/" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
            ← Volver al inicio
          </Link>
        </header>
        
        {/* Banner principal */}
        <div className="bg-[#1a5a4c] text-white py-10 px-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Error al cargar el taller</h1>
          <p className="max-w-3xl mx-auto">Por favor, intenta más tarde o contacta al administrador.</p>
        </div>
      </div>
    );
  }
} 