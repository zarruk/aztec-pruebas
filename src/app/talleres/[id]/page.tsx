'use client';

import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import RegistrationForm from '@/components/registration-form';
import { useEffect, useState } from 'react';
import React from 'react';
import { safeInteger } from '@/lib/utils';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import TallerDetalle from './components/taller-detalle';
import type { Taller } from '@/types/types';

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
    // Obtener el taller con sus datos básicos
    const { data, error } = await supabase
      .from('talleres')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error al obtener taller:', error);
      return null;
    }
    
    // Obtener las herramientas asociadas al taller
    if (data && data.herramientas && Array.isArray(data.herramientas)) {
      const { data: herramientasData, error: herramientasError } = await supabase
        .from('herramientas')
        .select('*')
        .in('id', data.herramientas);
      
      if (!herramientasError && herramientasData) {
        // Añadir las herramientas completas al objeto del taller
        return {
          ...data,
          herramientasDetalle: herramientasData
        };
      }
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

export default async function TallerDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  
  // Obtener datos del taller
  const { data: taller } = await supabase
    .from('talleres')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (!taller) {
    redirect('/talleres');
  }
  
  return <TallerDetalle taller={taller as unknown as Taller} />;
} 