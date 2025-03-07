export type TipoTaller = 'vivo' | 'pregrabado' | 'live_build';

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
  tipo: TipoTaller;
  fecha: string;
  herramientas: number[];
  campos_webhook?: Record<string, string>;
  capacidad?: number;
  precio?: number;
  imagen_url?: string;
  created_at?: string;
  updated_at?: string;
  fechas?: TallerFecha[];
}

export interface TallerFecha {
  id?: number;
  taller_id: number;
  fecha: string;
  created_at?: string;
}

export interface TallerConHerramientas extends Omit<Taller, 'herramientas'> {
  herramientas: Herramienta[];
} 