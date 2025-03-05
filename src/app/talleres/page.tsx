'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase-browser';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipo para los talleres adaptado a la estructura existente
interface Taller {
  id: number;
  nombre: string;
  descripcion: string;
  tipo?: string;
  fecha_vivo?: string;
  precio?: number;
  herramientas?: number[];
  capacidad?: number;
  video_url?: string;
  imagen_url?: string;
  fecha_live_build?: string;
  [key: string]: any; // Permitir campos adicionales
}

export default function TalleresPage() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchTalleres() {
      try {
        console.log('Iniciando carga de talleres...');
        
        // Verificar que las variables de entorno estén definidas
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        console.log('Variables de entorno:', { 
          url: supabaseUrl ? 'Definida' : 'No definida', 
          key: supabaseKey ? 'Definida' : 'No definida' 
        });
        
        const supabase = createSupabaseClient();
        console.log('Cliente Supabase creado');
        
        const { data, error } = await supabase
          .from('talleres')
          .select('*')
          .order('id', { ascending: true });
          
        console.log('Respuesta de Supabase:', { 
          data: data ? `${data.length} registros` : 'Sin datos', 
          error 
        });
        
        if (error) {
          console.error('Error cargando talleres:', error);
        } else if (data && data.length > 0) {
          console.log('Primer taller:', data[0]);
          setTalleres(data as unknown as Taller[]);
        } else {
          console.log('No se encontraron talleres');
          setTalleres([]);
        }
      } catch (error) {
        console.error('Error inesperado:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTalleres();
  }, []);

  // Si después de cargar no hay talleres, usar datos de ejemplo
  if (talleres.length === 0 && !loading) {
    console.log('Usando datos de ejemplo');
    setTalleres([
      {
        id: 1,
        nombre: 'Tracker de Gastos con Tarjeta (Ejemplo)',
        descripcion: 'Sube un archivo escaneado e inmediatamente los movimientos quedan en un Google Sheets y recibe un WhatsApp con un resumen de los gastos.',
        tipo: 'vivo',
        fecha_vivo: '2024-02-03T18:00:00+00:00',
        precio: 99000,
        capacidad: 20,
        video_url: 'https://www.youtube.com/watch?v=ejemplo1',
        imagen_url: '/images/taller-tracker.jpg'
      },
      {
        id: 2,
        nombre: 'Automatización de Respuesta a Leads (Ejemplo)',
        descripcion: 'Cuando tu cliente llene un formulario online, recibirá seguimiento inmediato por correo y sus datos quedarán registrados en un Sheets',
        tipo: 'vivo',
        fecha_vivo: '2024-02-10T18:00:00+00:00',
        precio: 99000,
        capacidad: 20,
        video_url: 'https://www.youtube.com/watch?v=ejemplo2',
        imagen_url: '/images/taller-leads.jpg'
      },
      {
        id: 3,
        nombre: 'Automatización de Posts en Redes Sociales (Ejemplo)',
        descripcion: 'Programa tus posts en múltiples redes sociales automáticamente y recibe un resumen de tu actividad en WhatsApp',
        tipo: 'pregrabado',
        fecha_vivo: '2024-01-01T00:00:00+00:00',
        precio: 99000,
        capacidad: 50,
        video_url: 'https://www.youtube.com/watch?v=ejemplo4',
        imagen_url: '/images/taller-redes.jpg'
      }
    ]);
  }

// Función para determinar si un taller es pregrabado
const esPregrabado = (tipo: string) => {
  return tipo === 'pregrabado';
};

// Función para obtener el texto de visualización del tipo
const obtenerTextoTipo = (tipo: string) => {
  if (tipo === 'vivo') {
    return "Taller en vivo";
  } else if (tipo === 'pregrabado') {
    return "Taller Pre Grabado";
  }
  return tipo;
};

// Función para verificar si una fecha es futura
const esFechaFutura = (fechaISO?: string) => {
  if (!fechaISO) return false;
  try {
    const fecha = parseISO(fechaISO);
    return fecha > new Date();
  } catch (error) {
    console.error('Error al verificar si la fecha es futura:', error);
    return false;
  }
};

// Función para verificar si una fecha es pasada
const esFechaPasada = (fechaISO?: string) => {
  if (!fechaISO) return false;
  try {
    const fecha = parseISO(fechaISO);
    return fecha < new Date();
  } catch (error) {
    console.error('Error al verificar si la fecha es pasada:', error);
    return false;
  }
};

// Función para formatear la fecha con mejor manejo de errores
const formatearFecha = (fechaISO?: string, tipo?: string, fechaLiveBuild?: string) => {
  try {
    // Si es un taller pregrabado con fecha de live build futura, mostrar esa fecha
    if (tipo === 'pregrabado' && fechaLiveBuild && esFechaFutura(fechaLiveBuild)) {
      const fecha = parseISO(fechaLiveBuild);
      return `Live Build: ${format(fecha, "d 'de' MMMM", { locale: es })}`;
    }
    
    // Si no hay fecha o la fecha es pasada, no mostrar nada para talleres en vivo
    if (!fechaISO || esFechaPasada(fechaISO)) {
      if (tipo === 'pregrabado') {
        return "Taller Pre Grabado";
      }
      return ""; // No mostrar fecha para talleres en vivo con fecha pasada
    }
    
    // Si es un taller pregrabado sin fecha de live build o con fecha pasada
    if (tipo === 'pregrabado') {
      return "Taller Pre Grabado";
    }
    
    // Para talleres en vivo con fecha futura
    const fecha = parseISO(fechaISO);
    return format(fecha, "d 'de' MMMM", { locale: es });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return "";
  }
};

  // Función para obtener la duración estimada
  const obtenerDuracion = () => {
    return "2 horas"; // Valor por defecto ya que no existe en la estructura
  };

  // Función para obtener el precio en USD con mejor manejo de errores
  const obtenerPrecioUSD = (precioCOP?: number) => {
    if (!precioCOP) return "N/A";
    return (precioCOP / 4200).toFixed(1); // Conversión aproximada
  };

  // Función para obtener la imagen del taller
  const obtenerImagenTaller = (nombre: string, tipo: string, imagen_url?: string) => {
    try {
      // Si hay una imagen_url disponible, usarla primero
      if (imagen_url) {
        return imagen_url;
      }
      
      // Lógica de respaldo basada en el nombre del taller
      if (nombre.toLowerCase().includes('gastos') || nombre.toLowerCase().includes('tracker')) {
        return "/images/taller-tracker.jpg";
      } else if (nombre.toLowerCase().includes('leads') || nombre.toLowerCase().includes('respuesta')) {
        return "/images/taller-leads.jpg";
      } else if (nombre.toLowerCase().includes('recibos') || nombre.toLowerCase().includes('firmas')) {
        return "/images/taller-recibos.jpg";
      } else if (nombre.toLowerCase().includes('posts') || nombre.toLowerCase().includes('redes')) {
        return "/images/taller-redes.jpg";
      } else if (nombre.toLowerCase().includes('análisis') || nombre.toLowerCase().includes('fundamental')) {
        return "/images/taller-analisis.jpg";
      } else {
        return "https://placehold.co/400x225/2a6e5e/white?text=Taller";
      }
    } catch (error) {
      return "https://placehold.co/400x225/2a6e5e/white?text=Taller";
    }
  };

  return (
    <div className="min-h-screen bg-[#f2efe7]">
      {/* Navbar */}
      <header className="bg-[#f2efe7] py-4 px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img 
            src="https://taller-fundamental.web.app/Logo%20Aztec%20(800%20x%20400%20px)%20(2).png" 
            alt="Aztec Logo" 
            className="h-10 w-auto"
          />
        </Link>
        <nav className="hidden md:flex space-x-8">
          <Link href="/talleres" className="text-[#2a6e5e] font-medium hover:text-[#1a4e3e]">
            Talleres
          </Link>
          <Link href="/instructores" className="text-[#2a6e5e] font-medium hover:text-[#1a4e3e]">
            Instructores
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-[#2a6e5e] text-white py-16 px-6 md:px-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Automatiza tu trabajo sin escribir código
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto">
          Aprende en talleres prácticos cómo automatizar tareas repetitivas y optimizar tu productividad
        </p>
        
        {/* Estadísticas */}
        <div className="flex flex-col md:flex-row justify-center gap-6 mt-12">
          <div className="bg-[#2a6e5e]/80 p-6 rounded-lg">
            <h2 className="text-3xl font-bold">10x</h2>
            <p>Mejora tu productividad</p>
          </div>
          <div className="bg-[#2a6e5e]/80 p-6 rounded-lg">
            <h2 className="text-3xl font-bold">+300</h2>
            <p>Profesionales capacitados</p>
          </div>
        </div>
      </section>

      {/* Listado de Talleres */}
      <section className="py-16 px-6 md:px-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Nuestros Talleres</h2>
        <p className="text-center text-gray-600 mb-12">Aprende habilidades prácticas en sesiones en vivo</p>
        
        {loading ? (
          <div className="text-center py-12">Cargando talleres...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {talleres.length > 0 ? (
              talleres.map((taller) => (
                <div key={taller.id} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="relative">
                    <img 
                      src={obtenerImagenTaller(taller.nombre || '', taller.tipo || '', taller.imagen_url)}
                      alt={taller.nombre || 'Taller'}
                      className="w-full h-48 object-cover"
                    />
                    {taller.video_url && (
                      <div className="absolute top-3 right-3 bg-[#2a6e5e] text-white text-xs px-2 py-1 rounded">
                        • Grabación disponible
                      </div>
                    )}
                    
                    {/* Indicador de Live Build pendiente - con color más opaco */}
                    {taller.tipo === 'pregrabado' && taller.fecha_live_build && esFechaFutura(taller.fecha_live_build) && (
                      <div className="absolute top-3 left-3 flex items-center">
                        <span className="animate-pulse inline-block w-3 h-3 bg-red-700 rounded-full mr-2"></span>
                        <span className="bg-red-700 text-white text-xs px-2 py-1 rounded">
                          Live Build Pendiente
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{taller.nombre || 'Taller sin nombre'}</h3>
                    <p className="text-gray-600 mb-4">{taller.descripcion || 'Sin descripción disponible'}</p>
                    <div className="text-sm text-gray-500 mb-4">
                      {formatearFecha(taller.fecha_vivo, taller.tipo, taller.fecha_live_build)}
                      {formatearFecha(taller.fecha_vivo, taller.tipo, taller.fecha_live_build) && ` • ${obtenerDuracion()}`}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="font-medium">
                        {taller.precio 
                          ? `COP $${Number(taller.precio).toLocaleString()} / USD $${obtenerPrecioUSD(Number(taller.precio))}`
                          : 'Precio no disponible'
                        }
                      </div>
                      <Link 
                        href={`/talleres/${taller.id}`}
                        className="bg-[#2a6e5e] text-white px-4 py-2 rounded hover:bg-[#1a4e3e] transition-colors"
                      >
                        Ver más
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                No hay talleres disponibles en este momento.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Testimonios */}
      <section className="py-16 px-6 md:px-12 bg-[#f2efe7]">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Lo que dicen nuestros estudiantes</h2>
          <p className="text-gray-600">Experiencias reales de participantes de nuestros talleres</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#5baa91] text-white p-6 rounded-lg">
            <p className="italic mb-4">
              "El taller estuvo muy bueno para romper la barrera de conocimiento de la interfaz del programa. Me generó muchas ideas para automatizar procesos."
            </p>
          </div>
          
          <div className="bg-[#5baa91] text-white p-6 rounded-lg">
            <p className="italic mb-4">
              "Fue muy útil y me ayudó a expandir mis conocimientos. Ahora veo con más claridad cómo aplicar estas herramientas en diversos proyectos."
            </p>
          </div>
          
          <div className="bg-[#5baa91] text-white p-6 rounded-lg">
            <p className="italic mb-4">
              "Muy buen taller: práctico, sencillo y funcional. Definitivamente me hace pensar en cómo usarlo para automatizar tanto mis tareas personales como las del trabajo."
            </p>
          </div>
        </div>
      </section>

      {/* Instructores */}
      <section className="py-16 px-6 md:px-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Conoce a tus instructores</h2>
          <p className="text-gray-600">Expertos en automatización y tecnología</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="mb-4 mx-auto w-48 h-48 overflow-hidden rounded-lg">
              <img 
                src="https://placehold.co/200x200/2a6e5e/white?text=Martin"
                alt="Martín Vásquez"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">Martín Vásquez</h3>
            <p className="text-gray-600 mb-4">
              "Como abogado, nunca imaginé que podría automatizar mi trabajo. Descubrí esto, cómo y transformó mi forma de trabajar. Hoy ayudo a otros profesionales a hacer lo mismo, demostrando que la tecnología está al alcance de todos."
            </p>
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-[#2a6e5e]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="#" className="text-[#2a6e5e]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="text-center">
            <div className="mb-4 mx-auto w-48 h-48 overflow-hidden rounded-lg">
              <img 
                src="https://placehold.co/200x200/2a6e5e/white?text=Salomon"
                alt="Salomón Zarruk"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">Salomón Zarruk</h3>
            <p className="text-gray-600 mb-4">
              "Al igual que Martín, yo también soy abogado de profesión. Si yo pude aprender estas herramientas sin tener background técnico, tú también puedes. Mi misión es demostrar que la tecnología no tiene barreras profesionales."
            </p>
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-[#2a6e5e]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="#" className="text-[#2a6e5e]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2a6e5e] text-white py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <img 
              src="https://taller-fundamental.web.app/Logo%20Aztec%20(800%20x%20400%20px)%20(2).png" 
              alt="Aztec Logo" 
              className="h-10 w-auto invert"
            />
          </div>
          <div className="text-center md:text-right">
            <p>© {new Date().getFullYear()} Aztec. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 