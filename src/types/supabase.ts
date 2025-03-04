export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      herramientas: {
        Row: {
          id: number
          nombre: string
          descripcion: string
          imagen_url: string
          created_at: string
        }
        Insert: {
          id?: number
          nombre: string
          descripcion: string
          imagen_url: string
          created_at?: string
        }
        Update: {
          id?: number
          nombre?: string
          descripcion?: string
          imagen_url?: string
          created_at?: string
        }
      }
      talleres: {
        Row: {
          id: number
          nombre: string
          descripcion: string
          video_url: string
          tipo: string
          fecha_vivo: string | null
          fecha_live_build: string | null
          herramientas: number[]
          campos_webhook: string[]
          capacidad: number
          precio: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          nombre: string
          descripcion: string
          video_url: string
          tipo: string
          fecha_vivo?: string | null
          fecha_live_build?: string | null
          herramientas: number[]
          campos_webhook: string[]
          capacidad: number
          precio: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          nombre?: string
          descripcion?: string
          video_url?: string
          tipo?: string
          fecha_vivo?: string | null
          fecha_live_build?: string | null
          herramientas?: number[]
          campos_webhook?: string[]
          capacidad?: number
          precio?: number
          created_at?: string
          updated_at?: string | null
        }
      }
    }
  }
} 