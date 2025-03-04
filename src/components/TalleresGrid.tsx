import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface Taller {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  fecha: string;
  duracion: string;
  tipo: string;
  imagen_url: string;
  [key: string]: any;
}

async function fetchTalleres() {
  console.log("Iniciando carga de talleres...");
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Variables de entorno de Supabase no configuradas");
    return [];
  }
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log("Cliente Supabase creado, obteniendo talleres...");
    
    const { data, error } = await supabase
      .from('talleres')
      .select('*');
    
    if (error) {
      console.error("Error al obtener talleres:", error);
      return [];
    }
    
    console.log(`Talleres obtenidos: ${data?.length || 0}`);
    return data || [];
  } catch (error) {
    console.error("Error inesperado al obtener talleres:", error);
    return [];
  }
}

export default async function TalleresGrid() {
  const talleres = await fetchTalleres();
  
  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-8">Aprende habilidades prácticas en sesiones en vivo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {talleres.map((taller) => (
          <div key={taller.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              <img 
                src={taller.imagen_url || "/placeholder.jpg"} 
                alt={taller.titulo} 
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 bg-emerald-700 text-white px-2 py-1 rounded text-sm">
                • Grabación disponible
              </div>
            </div>
            
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{taller.titulo}</h2>
              <p className="text-gray-600 mb-4">{taller.descripcion}</p>
              
              <div className="text-sm text-gray-500 mb-2">
                {taller.tipo && `Taller ${taller.tipo}`}{taller.duracion && ` • ${taller.duracion}`}
              </div>
              
              {taller.fecha && (
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(taller.fecha).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long'
                  })} • {taller.duracion}
                </div>
              )}
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-gray-700">
                  {taller.precio ? `COP $${taller.precio.toLocaleString()} / USD $${(taller.precio / 4000).toFixed(1)}` : "Precio no disponible"}
                </div>
                <Link href={`/talleres/${taller.id}`} className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded">
                  Ver más
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
} 