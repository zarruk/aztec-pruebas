import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Tipos de archivo permitidos
const ALLOWED_FILE_TYPES = {
  'image/jpeg': true,
  'image/png': true,
  'image/gif': true,
  'image/webp': true,
  'application/pdf': true,
};

// Tamaño máximo de archivo (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadFile(
  file: File,
  bucket: string = 'public'
): Promise<FileUploadResult> {
  try {
    // Validar tipo de archivo
    if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
      return {
        success: false,
        error: 'Tipo de archivo no permitido',
      };
    }

    // Validar tamaño de archivo
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'El archivo excede el tamaño máximo permitido (5MB)',
      };
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Obtener URL pública del archivo
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al subir el archivo',
    };
  }
}

export async function deleteFile(
  fileName: string,
  bucket: string = 'public'
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    return !error;
  } catch (error) {
    return false;
  }
}

export function validateFileType(file: File): boolean {
  return ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES] || false;
}

export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

// Función para sanitizar nombres de archivo
export function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
} 