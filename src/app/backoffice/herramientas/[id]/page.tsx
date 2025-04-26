import { Suspense } from 'react';
import { EditarHerramientaClient } from './client-component';

export const metadata = {
  title: 'Editar Herramienta - Backoffice Aztec',
  description: 'Editar herramienta en el backoffice de Aztec',
};

export default async function EditarHerramientaPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EditarHerramientaClient id={params.id} />
    </Suspense>
  );
} 