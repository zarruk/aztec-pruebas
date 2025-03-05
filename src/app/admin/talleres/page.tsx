import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function TalleresPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Obtener la lista de talleres
  const { data: talleres, error } = await supabase
    .from('talleres')
    .select('*')
    .order('id', { ascending: false });
  
  if (error) {
    console.error('Error al cargar talleres:', error);
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administración de Talleres</h1>
        <Link 
          href="/admin/talleres/nuevo" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Nuevo Taller
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error al cargar los talleres. Por favor, intenta de nuevo.
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {talleres && talleres.length > 0 ? (
              talleres.map((taller) => (
                <tr key={taller.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{taller.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{taller.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Intl.NumberFormat('es-CO').format(taller.precio)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{taller.tipo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      href={`/admin/talleres/editar/${taller.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </Link>
                    <Link 
                      href={`/talleres/${taller.id}`}
                      target="_blank"
                      className="text-green-600 hover:text-green-900"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  {error ? 'Error al cargar talleres' : 'No hay talleres disponibles'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 