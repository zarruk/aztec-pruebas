import EditarHerramienta from '@/components/backoffice/editar-herramienta';

export default function Page({ params }: { params: { id: string } }) {
  return <EditarHerramienta id={params.id} />;
} 