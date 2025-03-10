'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase-browser';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale/es';

// Componente para el aviso intermitente de Live Build
const LiveBuildAlert = () => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(prev => !prev);
    }, 600); // Más rápido para llamar más la atención
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={`absolute bottom-2 right-2 flex items-center ${visible ? 'opacity-100' : 'opacity-60'} transition-opacity duration-300 z-10`}>
      <div className="bg-red-600 text-white font-bold py-1 px-3 rounded-md text-sm flex items-center shadow-lg shadow-red-500/50 border border-red-400">
        <span className="inline-block w-2 h-2 rounded-full bg-white mr-2 animate-ping"></span>
        <span className="uppercase tracking-wide text-xs">Live Build Pronto</span>
      </div>
    </div>
  );
};

// Tipo para los talleres adaptado a la estructura existente
interface Taller {
  id: number;
  nombre: string;
  descripcion: string;
  tipo?: string;
  fecha?: string;
  precio?: number;
  herramientas?: number[];
  capacidad?: number;
  video_url?: string;
  imagen_url?: string;
  [key: string]: any; // Permitir campos adicionales
}

export default function TalleresPage() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonialInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Testimonios
  const testimonios = [
    {
      texto: "Los amé, súper recomendados, para mí que cambié de carrera por la fobia a programar, esto es lo máximo. Valió la pena, me salí de la clase y vi la grabación, pues no me funcionó y me perdí, pero volví a ver la grabación y me dio. Honestamente tenía muchas taras, pues pensé que era un mensaje más del universo diciéndome que la programación no es para mí, pero sí lo logré, me funcionó.",
      autor: "María C.",
      profesion: "Diseñadora UX"
    },
    {
      texto: "El taller estuvo muy bueno para romper la barrera de conocimiento de la interfaz del programa. Me generó muchas ideas para automatizar procesos.",
      autor: "Juan P.",
      profesion: "Gerente de Proyectos"
    },
    {
      texto: "Fue muy útil y me ayudó a expandir mis conocimientos. Ahora veo con más claridad cómo aplicar estas herramientas en diversos proyectos.",
      autor: "Ana M.",
      profesion: "Analista de Datos"
    },
    {
      texto: "Muy buen taller: práctico, sencillo y funcional. Definitivamente me hace pensar en cómo usarlo para automatizar tanto mis tareas personales como las del trabajo.",
      autor: "Carlos R.",
      profesion: "Contador"
    },
    {
      texto: "El taller espectacular, muy útil y rompe esa creencia de que si no sé programar no puedo. Es como esa primera brazada cuando uno aprende a nadar, da confianza para seguir. Lo único es que la expectativa de tiempo era menor, pero lo personalizado del contenido lo ameritaba.",
      autor: "Laura G.",
      profesion: "Emprendedora"
    },
    {
      texto: "Primero agradecer todo el conocimiento que compartieron en el taller. Para mí estuvo muy bueno la verdad, y otro factor que resalto es el nivel de paciencia que tuvo Martin para absolver las dudas de cada persona, ¡me saco el sombrero! Les recomendé el próximo taller a un familiar y ya se inscribió jejeje (así nomás no recomiendo cursos o talleres a nadie).",
      autor: "Diego S.",
      profesion: "Consultor de Marketing"
    }
  ];
  
  // Efecto para el carrusel automático
  useEffect(() => {
    // Iniciar el intervalo para cambiar automáticamente los testimonios
    testimonialInterval.current = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonios.length);
    }, 8000); // Cambiar cada 8 segundos
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      if (testimonialInterval.current) {
        clearInterval(testimonialInterval.current);
      }
    };
  }, [testimonios.length]);
  
  // Función para cambiar manualmente al testimonio anterior
  const prevTestimonial = () => {
    // Reiniciar el intervalo para evitar cambios bruscos
    if (testimonialInterval.current) {
      clearInterval(testimonialInterval.current);
    }
    
    setCurrentTestimonial(prev => 
      prev === 0 ? testimonios.length - 1 : prev - 1
    );
    
    // Reiniciar el intervalo
    testimonialInterval.current = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonios.length);
    }, 8000);
  };
  
  // Función para cambiar manualmente al siguiente testimonio
  const nextTestimonial = () => {
    // Reiniciar el intervalo para evitar cambios bruscos
    if (testimonialInterval.current) {
      clearInterval(testimonialInterval.current);
    }
    
    setCurrentTestimonial(prev => 
      (prev + 1) % testimonios.length
    );
    
    // Reiniciar el intervalo
    testimonialInterval.current = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonios.length);
    }, 8000);
  };
  
  // Función para seleccionar un testimonio específico
  const selectTestimonial = (index: number) => {
    // Reiniciar el intervalo para evitar cambios bruscos
    if (testimonialInterval.current) {
      clearInterval(testimonialInterval.current);
    }
    
    setCurrentTestimonial(index);
    
    // Reiniciar el intervalo
    testimonialInterval.current = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonios.length);
    }, 8000);
  };

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
        fecha: '2024-02-03T18:00:00+00:00',
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
        fecha: '2024-02-10T18:00:00+00:00',
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
        fecha: '2024-01-01T00:00:00+00:00',
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
    return isAfter(fecha, new Date());
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
    return isBefore(fecha, new Date());
  } catch (error) {
    console.error('Error al verificar si la fecha es pasada:', error);
    return false;
  }
};

// Función para formatear la fecha con mejor manejo de errores
const formatearFecha = (fechaISO?: string, tipo?: string) => {
  try {
    // Si es un taller pregrabado con fecha de live build futura, mostrar esa fecha
    if (tipo === 'pregrabado' && fechaISO && esFechaFutura(fechaISO)) {
      const fecha = parseISO(fechaISO);
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
    <div className="min-h-screen bg-[#fffdf9]">
      {/* Navbar */}
      <header className="bg-[#fffdf9] py-1 px-3 md:px-4 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="container mx-auto w-full sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[65%] flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <img 
              src="/aztec-logo-new.png" 
              alt="Aztec Logo" 
              className="h-12 md:h-16 w-auto object-contain"
            />
          </Link>
          <nav>
            <ul className="flex space-x-4 md:space-x-6">
              <li>
                <a href="#talleres" className="text-[#2a7c60] font-medium hover:text-[#1e5a46]">
                  Talleres
                </a>
              </li>
              <li>
                <a href="#instructores" className="text-[#2a7c60] font-medium hover:text-[#1e5a46]">
                  Instructores
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section - Versión mejorada */}
      <section className="bg-gradient-to-br from-[#2a7c60] to-[#1b5e4f] text-white py-16 md:py-24 px-4 md:px-6 relative overflow-hidden">
        {/* Elementos decorativos animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-white opacity-5 animate-float-slow"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white opacity-5 animate-float-medium"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-white opacity-5 animate-float-fast"></div>
          <div className="absolute bottom-1/4 left-1/3 w-24 h-24 rounded-full bg-white opacity-5 animate-float-medium"></div>
        </div>
        
        <div className="container mx-auto w-full sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[65%] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Contenido de texto */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Automatiza tu trabajo y <span className="text-[#8be0c9]">ahorra tiempo</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-xl mx-auto lg:mx-0">
                Aprende a usar herramientas de automatización sin necesidad de saber programar y transforma tu forma de trabajar.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <a 
                  href="#talleres" 
                  className="bg-white text-[#2a7c60] hover:bg-gray-100 transition-colors px-6 py-3 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
                >
                  Ver talleres disponibles
                </a>
                <a 
                  href="#testimonios" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 transition-colors px-6 py-3 rounded-lg font-medium text-lg"
                >
                  Testimonios
                </a>
              </div>
            </div>
            
            {/* Ilustración */}
            <div className="hidden lg:block">
              <div className="relative">
                <img 
                  src="/images/automation-illustration.svg" 
                  alt="Automatización de tareas" 
                  className="w-full max-w-lg mx-auto"
                  onError={(e) => {
                    // Fallback si la imagen no existe
                    e.currentTarget.src = "https://cdn.jsdelivr.net/gh/zarruk/aztec-nuevo@main/public/images/automation-illustration.svg";
                    e.currentTarget.onerror = null;
                  }}
                />
                
                {/* Elementos flotantes alrededor de la ilustración */}
                <div className="absolute -top-4 -right-4 bg-white/20 backdrop-blur-sm p-3 rounded-lg shadow-lg animate-float-slow">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute top-1/2 -left-6 bg-white/20 backdrop-blur-sm p-3 rounded-lg shadow-lg animate-float-medium">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute bottom-4 right-1/4 bg-white/20 backdrop-blur-sm p-3 rounded-lg shadow-lg animate-float-fast">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Onda decorativa en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-auto">
            <path fill="#fffdf9" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </section>

      {/* Añadir estilos para las animaciones */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
      `}</style>

      {/* Listado de Talleres */}
      <section id="talleres" className="py-10 md:py-16 px-4 md:px-6">
        <div className="container mx-auto w-full sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[65%]">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold mb-2">Nuestros Talleres</h2>
            <p className="text-gray-600">Aprende habilidades prácticas en nuestros talleres</p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">Cargando talleres...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {talleres.length > 0 ? (
                talleres.map((taller) => (
                  <div key={taller.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] flex flex-col min-h-[450px] md:min-h-[550px]">
                    <div className="relative">
                      <img 
                        src={obtenerImagenTaller(taller.nombre, taller.tipo || '', taller.imagen_url)}
                        alt={taller.nombre}
                        className="w-full h-48 object-cover"
                      />
                      {taller.tipo === 'pregrabado' && (
                        <div className="absolute top-2 right-2 bg-[#5baa91] text-white font-bold py-1 px-3 rounded-md text-sm">
                          PREGRABADO
                        </div>
                      )}
                      {taller.tipo === 'vivo' && esFechaFutura(taller.fecha) && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white font-bold py-1 px-3 rounded-md text-sm">
                          PRÓXIMAMENTE
                        </div>
                      )}
                      {taller.tipo === 'pregrabado' && esFechaFutura(taller.fecha) && (
                        <LiveBuildAlert />
                      )}
                    </div>
                    <div className="p-6 flex flex-col h-full">
                      <h3 className="text-xl font-bold mb-2">{taller.nombre || 'Taller sin nombre'}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-4 overflow-hidden">{taller.descripcion || 'Sin descripción disponible'}</p>
                      <div className="text-sm text-gray-500 mb-4">
                        {formatearFecha(taller.fecha, taller.tipo)}
                        {formatearFecha(taller.fecha, taller.tipo) && ` • ${obtenerDuracion()}`}
                      </div>
                      
                      {/* Espacio flexible para empujar el precio y botón al fondo */}
                      <div className="flex-grow"></div>
                      
                      {/* Contenedor para precio y botón */}
                      <div className="mt-4">
                        {/* Precio */}
                        <div className="font-medium mb-3">
                          {taller.precio 
                            ? `COP $${Number(taller.precio).toLocaleString()} / USD $${obtenerPrecioUSD(Number(taller.precio))}`
                            : 'Precio no disponible'
                          }
                        </div>
                        
                        {/* Botón Ver más */}
                        <Link 
                          href={`/talleres/${taller.id}`}
                          className="block w-full text-center bg-[#1b5e4f] text-white px-4 py-2 rounded hover:bg-[#0d4a3d] transition-colors"
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
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="py-10 md:py-16 px-4 md:px-6 bg-[#f2efe7]">
        <div className="container mx-auto w-full sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[65%]">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold mb-2">Lo que dicen nuestros estudiantes</h2>
            <p className="text-gray-600">Experiencias reales de participantes de nuestros talleres</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Controles del carrusel */}
            <button 
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 md:-translate-x-8 bg-white rounded-full p-2 shadow-md z-10 focus:outline-none hover:bg-gray-100 transition-colors"
              aria-label="Testimonio anterior"
            >
              <svg className="w-5 h-5 text-[#2a7c60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Contenedor del carrusel con efecto de transición */}
            <div className="overflow-hidden">
              <div 
                className="transition-transform duration-500 ease-in-out" 
                style={{ transform: `translateX(-${currentTestimonial * 100}%)`, display: 'flex' }}
              >
                {testimonios.map((testimonio, index) => (
                  <div 
                    key={index} 
                    className="w-full flex-shrink-0 bg-white rounded-xl shadow-lg p-6 md:p-8"
                  >
                    {/* Icono de comillas */}
                    <div className="text-[#5baa91] mb-4">
                      <svg className="w-10 h-10 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    
                    {/* Texto del testimonio */}
                    <p className="text-gray-700 italic mb-6 text-lg leading-relaxed">
                      "{testimonio.texto}"
                    </p>
                    
                    {/* Información del autor */}
                    <div className="flex items-center mt-4">
                      <div className="w-12 h-12 rounded-full bg-[#5baa91] text-white overflow-hidden flex items-center justify-center mr-4">
                        <span className="text-xl font-bold">{testimonio.autor.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{testimonio.autor}</h4>
                        <p className="text-sm text-gray-500">{testimonio.profesion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Botón siguiente */}
            <button 
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 md:translate-x-8 bg-white rounded-full p-2 shadow-md z-10 focus:outline-none hover:bg-gray-100 transition-colors"
              aria-label="Siguiente testimonio"
            >
              <svg className="w-5 h-5 text-[#2a7c60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Indicadores de posición */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonios.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => selectTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentTestimonial === index ? 'bg-[#2a7c60]' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Ir al testimonio ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instructores */}
      <section id="instructores" className="py-10 md:py-16 px-4 md:px-6">
        <div className="container mx-auto w-full sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[65%]">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold mb-2">Conoce a tus instructores</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mb-4 mx-auto w-48 h-48 overflow-hidden rounded-lg">
                <img 
                  src="/images/instructores/martin.jpg"
                  alt="Martín Vásquez"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Martín Vásquez</h3>
              <p className="text-gray-600 mb-4">
                "Como abogado, nunca imaginé que podría automatizar mi trabajo. Descubrí esto, cómo y transformó mi forma de trabajar. Hoy ayudo a otros profesionales a hacer lo mismo, demostrando que la tecnología está al alcance de todos."
              </p>
              <div className="flex justify-center space-x-4">
                <a href="https://www.linkedin.com/in/martin-vasquez-escobar/" target="_blank" rel="noopener noreferrer" className="text-[#2a7c60]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="https://wa.me/573128511052" target="_blank" rel="noopener noreferrer" className="text-[#2a7c60]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="text-center">
              <div className="mb-4 mx-auto w-48 h-48 overflow-hidden rounded-lg">
                <img 
                  src="/images/instructores/salomon.jpg"
                  alt="Salomón Zarruk"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Salomón Zarruk</h3>
              <p className="text-gray-600 mb-4">
                "Al igual que Martín, yo también soy abogado de profesión. Si yo pude aprender estas herramientas sin tener background técnico, tú también puedes. Mi misión es demostrar que la tecnología no tiene barreras profesionales."
              </p>
              <div className="flex justify-center space-x-4">
                <a href="https://www.linkedin.com/in/zarruk/" target="_blank" rel="noopener noreferrer" className="text-[#2a7c60]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="https://wa.me/573187033333" target="_blank" rel="noopener noreferrer" className="text-[#2a7c60]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2a7c60] text-white py-6 md:py-8 px-4 md:px-6">
        <div className="container mx-auto w-full sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[65%] flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <img 
              src="/aztec-logo-new.png" 
              alt="Aztec Logo" 
              className="h-8 md:h-10 w-auto object-contain invert brightness-0 invert"
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