'use client';

import { useState, useEffect } from 'react';

interface VideoEmbedProps {
  url: string;
}

export function VideoEmbed({ url }: VideoEmbedProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError('No se proporcionó URL de video');
      return;
    }

    try {
      // Procesar URL de YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        
        if (url.includes('youtube.com/watch')) {
          const urlParams = new URL(url).searchParams;
          videoId = urlParams.get('v') || '';
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
          videoId = url.split('youtube.com/embed/')[1].split('?')[0];
        }
        
        if (videoId) {
          setEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
        } else {
          setError('No se pudo extraer el ID del video de YouTube');
        }
      }
      // Procesar URL de Vimeo
      else if (url.includes('vimeo.com')) {
        const vimeoId = url.split('vimeo.com/')[1].split('?')[0];
        if (vimeoId) {
          setEmbedUrl(`https://player.vimeo.com/video/${vimeoId}`);
        } else {
          setError('No se pudo extraer el ID del video de Vimeo');
        }
      }
      // Procesar URL de Loom
      else if (url.includes('loom.com')) {
        if (url.includes('/share/')) {
          const loomId = url.split('/share/')[1].split('?')[0];
          setEmbedUrl(`https://www.loom.com/embed/${loomId}`);
        } else {
          setError('Formato de URL de Loom no reconocido');
        }
      }
      // Si ya es una URL de embed, usarla directamente
      else if (url.includes('/embed/')) {
        setEmbedUrl(url);
      }
      // Si no se reconoce el formato
      else {
        setError('Formato de URL de video no soportado');
      }
    } catch (err) {
      console.error('Error al procesar URL de video:', err);
      setError('Error al procesar la URL del video');
    }
  }, [url]);

  if (error) {
    return (
      <div className="w-full h-full min-h-[200px] bg-gray-100 flex items-center justify-center rounded">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className="w-full h-full min-h-[200px] bg-gray-100 flex items-center justify-center rounded">
        <p className="text-gray-500">Cargando video...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-0 pb-[56.25%]">
      <iframe
        src={embedUrl}
        className="absolute top-0 left-0 w-full h-full rounded"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video embed"
      />
    </div>
  );
} 