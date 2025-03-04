export type TipoTaller = 'vivo' | 'pregrabado';

export interface Herramienta {
  id: number;
  nombre: string;
  descripcion: string;
  imagen_url: string;
  created_at: string;
}

export interface Taller {
  id?: number;
  nombre: string;
  descripcion: string;
  video_url?: string;
  tipo: 'vivo' | 'pregrabado';
  fecha_vivo?: string;
  fecha_live_build?: string;
  herramientas: number[];
  campos_webhook: string[];
  capacidad?: number;
  precio?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TallerConHerramientas extends Omit<Taller, 'herramientas'> {
  herramientas: Herramienta[];
} 