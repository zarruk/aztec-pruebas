'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  defaultImage?: string;
}

export function ImageUpload({ onImageUploaded, defaultImage }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Para simplificar, usaremos una URL externa en lugar de subir a Supabase
    setIsUploading(true);
    try {
      // Simular una carga
      setTimeout(() => {
        // Usar un servicio de placeholder para simular la URL de la imagen
        const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(file.name)}`;
        onImageUploaded(placeholderUrl);
        toast.success('Imagen "subida" correctamente (simulado)');
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      toast.error('Error al subir la imagen. Por favor, intenta de nuevo.');
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        {previewUrl ? (
          <div className="relative w-full max-w-md mb-4">
            <img 
              src={previewUrl} 
              alt="Vista previa" 
              className="w-full h-48 object-cover rounded-md border border-gray-200"
            />
            <button
              type="button"
              onClick={() => {
                setPreviewUrl(null);
                onImageUploaded('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md h-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center mb-4 bg-gray-50">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-1 text-sm text-gray-600">Imagen del taller</p>
            </div>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <Button
          type="button"
          onClick={handleButtonClick}
          disabled={isUploading}
          className="mt-2"
        >
          {isUploading ? 'Subiendo...' : previewUrl ? 'Cambiar imagen' : 'Subir imagen'}
        </Button>
      </div>
    </div>
  );
} 