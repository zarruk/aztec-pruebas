import { z } from 'zod';

export const herramientaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  imagen_url: z.string().url('Debe ser una URL válida'),
});

export const tallerFechaSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
});

export const tallerSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  video_url: z.string().url('Debe ser una URL válida').or(z.string().length(0)),
  tipo: z.enum(['vivo', 'pregrabado', 'live_build'], {
    required_error: 'Debes seleccionar un tipo de taller',
  }),
  fecha_vivo: z.string().optional(),
  fecha_live_build: z.string().optional(),
  herramientas: z.array(z.number()).default([]),
  campos_webhook: z.record(z.string()).default({}),
  capacidad: z.string().optional(),
  precio: z.string().optional(),
  imagen_url: z.string().optional(),
  fechas: z.array(tallerFechaSchema).optional(),
}).refine((data) => {
  if (data.tipo === 'vivo') {
    return !!data.fecha_vivo;
  }
  return true;
}, {
  message: "La fecha del taller en vivo es requerida para talleres en vivo",
  path: ["fecha_vivo"]
}).refine((data) => {
  if (data.tipo === 'live_build') {
    return !!data.fecha_live_build;
  }
  return true;
}, {
  message: "La fecha del Live Build es requerida para talleres de tipo Live Build",
  path: ["fecha_live_build"]
}); 