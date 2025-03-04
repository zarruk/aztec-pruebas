"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function TableInfoPage() {
  const [tableInfo, setTableInfo] = useState<any[]>([]);
  const [tableName, setTableName] = useState("talleres");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTableInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Faltan variables de entorno de Supabase");
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Ejecutar la función SQL que creamos anteriormente
      const { data, error } = await supabase.rpc('get_table_info', {
        table_name: tableName
      });
      
      if (error) {
        throw error;
      }
      
      setTableInfo(data || []);
    } catch (error: any) {
      console.error("Error al obtener información de la tabla:", error);
      setError(error.message || "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Información de la tabla</h1>
      
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          className="px-3 py-2 border rounded"
          placeholder="Nombre de la tabla"
        />
        <button
          onClick={getTableInfo}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Cargando..." : "Obtener información"}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {tableInfo.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Columna</th>
                <th className="px-4 py-2 border">Tipo</th>
                <th className="px-4 py-2 border">Nullable</th>
                <th className="px-4 py-2 border">Valor por defecto</th>
              </tr>
            </thead>
            <tbody>
              {tableInfo.map((column, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-2 border">{column.column_name}</td>
                  <td className="px-4 py-2 border">{column.data_type}</td>
                  <td className="px-4 py-2 border">{column.is_nullable}</td>
                  <td className="px-4 py-2 border">{column.column_default || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No hay información disponible. Haz clic en "Obtener información" para ver los detalles de la tabla.</p>
      )}
    </div>
  );
} 