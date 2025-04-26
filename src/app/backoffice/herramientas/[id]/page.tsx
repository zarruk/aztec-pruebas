import { Metadata } from 'next';
import { EditarHerramientaClient } from './client';

export const metadata: Metadata = {
  title: 'Editar Herramienta - Backoffice Aztec',
  description: 'Editar herramienta en el backoffice de Aztec',
};

interface Props {
  params: {
    id: string;
  };
}

export default function EditarHerramientaPage({ params }: Props) {
  return <EditarHerramientaClient id={params.id} />;
} 