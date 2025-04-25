import { Metadata } from 'next';
import EditarHerramientaClient from './client';

export const metadata: Metadata = {
  title: 'Editar Herramienta - Backoffice',
  description: 'Editar herramienta en el backoffice'
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditarHerramientaPage({ params }: PageProps) {
  return <EditarHerramientaClient id={params.id} />;
} 