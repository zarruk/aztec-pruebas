import { z } from 'zod';

export const herramientaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  imagen_url: z.string().url('Debe ser una URL válida'),
});

export const tallerFechaSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
});

// Esquema para campos_webhook que acepta tanto objetos como arrays y los convierte a objetos
const camposWebhookSchema = z.union([
  z.record(z.string()),
  z.array(z.any()).transform(() => ({}))
]).default({});

export const tallerSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  video_url: z.string().url('Debe ser una URL válida').or(z.string().length(0)),
  tipo: z.enum(['vivo', 'pregrabado', 'live_build'], {
    required_error: 'Debes seleccionar un tipo de taller',
  }),
  fecha: z.string().min(1, 'La fecha del taller es requerida'),
  herramientas: z.array(z.number()).default([]),
  campos_webhook: camposWebhookSchema,
  capacidad: z.string().optional(),
  precio: z.string().optional(),
  imagen_url: z.string().optional(),
  fechas: z.array(tallerFechaSchema).optional(),
}); 