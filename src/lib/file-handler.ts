import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Tipos de archivo permitidos
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};

// Tamaño máximo de archivo (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateFile(
  file: File,
  allowedTypes: string[] = Object.keys(ALLOWED_FILE_TYPES)
): Promise<FileValidationResult> {
  // Verificar tipo de archivo
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no permitido'
    };
  }

  // Verificar extensión
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = allowedTypes.flatMap(type => ALLOWED_FILE_TYPES[type as keyof typeof ALLOWED_FILE_TYPES]);
  
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: 'Extensión de archivo no permitida'
    };
  }

  // Verificar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'El archivo excede el tamaño máximo permitido (5MB)'
    };
  }

  return { isValid: true };
}

export async function uploadFile(
  file: File,
  bucket: string = 'public',
  folder: string = 'uploads'
): Promise<{ url: string; error: string | null }> {
  try {
    // Validar archivo
    const validation = await validateFile(file);
    if (!validation.isValid) {
      return { url: '', error: validation.error };
    }

    // Generar nombre único para el archivo
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return { url: '', error: error.message };
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error) {
    return { url: '', error: 'Error al subir el archivo' };
  }
}

export async function deleteFile(
  url: string,
  bucket: string = 'public'
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Extraer nombre del archivo de la URL
    const fileName = url.split('/').pop();
    if (!fileName) {
      return { success: false, error: 'URL de archivo inválida' };
    }

    // Eliminar archivo de Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: 'Error al eliminar el archivo' };
  }
}

// Función para escanear archivos por malware (ejemplo)
export async function scanFile(file: File): Promise<boolean> {
  // Aquí se implementaría la lógica de escaneo de malware
  // Por ahora, retornamos true como ejemplo
  return true;
} 