import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Función para obtener un taller específico
async function fetchTaller(id: number) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase
    .from('talleres')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error al obtener el taller:", error);
    return null;
  }
  
  return data;
}

// Función para obtener las fechas de un taller
async function fetchTallerFechas(tallerId: number) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase
    .from('taller_fechas')
    .select('*')
    .eq('taller_id', tallerId)
    .order('fecha', { ascending: true });
  
  if (error) {
    console.error("Error al obtener fechas del taller:", error);
    return [];
  }
  
  return data || [];
}

export default async function TallerPage({ params }: { params: { id: string } }) {
  const taller = await fetchTaller(parseInt(params.id));
  
  if (!taller) {
    return <div>Taller no encontrado</div>;
  }
  
  // Obtener las fechas si es un taller en vivo
  let fechas = [];
  if (taller.tipo === 'vivo') {
    fechas = await fetchTallerFechas(taller.id);
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {taller.imagen_url && (
          <div className="relative h-64 w-full">
            <img 
              src={taller.imagen_url} 
              alt={taller.nombre} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{taller.nombre}</h1>
          <p className="text-gray-700 mb-6">{taller.descripcion}</p>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Detalles del taller</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600"><strong>Tipo:</strong> {taller.tipo === 'vivo' ? 'En vivo' : 'Pregrabado'}</p>
                <p className="text-gray-600"><strong>Precio:</strong> COP ${taller.precio?.toLocaleString()} / USD ${(taller.precio / 4000).toFixed(1)}</p>
                <p className="text-gray-600"><strong>Capacidad:</strong> {taller.capacidad} personas</p>
              </div>
              
              {taller.tipo === 'vivo' && fechas.length > 0 ? (
                <div>
                  <p className="text-gray-600 font-semibold">Fechas disponibles:</p>
                  <ul className="list-disc pl-5 mt-2">
                    {fechas.map((fecha: any, index: number) => (
                      <li key={index} className="text-gray-600">
                        {new Date(fecha.fecha).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : taller.tipo === 'pregrabado' && taller.fecha_live_build ? (
                <p className="text-gray-600">
                  <strong>Fecha del Live Build:</strong> {new Date(taller.fecha_live_build).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              ) : null}
            </div>
          </div>
          
          {taller.video_url && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Video de presentación</h2>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={taller.video_url}
                  title="Video de presentación"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
          
          <div className="flex justify-center mt-8">
            <a 
              href="#inscripcion" 
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-md text-lg font-medium"
            >
              Inscribirme a este taller
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 