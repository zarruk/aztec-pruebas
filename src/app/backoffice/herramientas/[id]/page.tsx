import { Metadata } from 'next';
import EditarHerramienta from '@/components/backoffice/editar-herramienta';

export const metadata: Metadata = {
  title: 'Editar Herramienta - Backoffice',
  description: 'Editar herramienta en el backoffice'
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditarHerramientaPage({ params }: PageProps) {
  return <EditarHerramienta id={params.id} />;
} 