import { z } from 'zod';

export const herramientaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  imagen_url: z.string().url('Debe ser una URL válida'),
});

export const tallerSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  video_url: z.string().url('Debe ser una URL válida'),
  tipo: z.enum(['vivo', 'pregrabado'], {
    required_error: 'Debes seleccionar un tipo de taller',
  }),
  fecha_vivo: z.string().optional(),
  fecha_live_build: z.string().optional(),
  herramientas: z.array(z.number()).default([]),
  campos_webhook: z.array(z.string()).default([]),
  capacidad: z.string().min(1, 'La capacidad es requerida'),
  precio: z.string().min(1, 'El precio es requerido'),
}).refine(
  (data) => {
    if (data.tipo === 'vivo' && !data.fecha_vivo) {
      return false;
    }
    if (data.tipo === 'pregrabado' && !data.fecha_live_build) {
      return false;
    }
    return true;
  },
  {
    message: 'Debes especificar la fecha correspondiente según el tipo de taller',
    path: ['fecha_vivo', 'fecha_live_build'],
  }
); 