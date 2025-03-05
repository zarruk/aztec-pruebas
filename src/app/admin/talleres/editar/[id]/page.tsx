import TallerForm from '@/components/TallerForm';

interface EditarTallerPageProps {
  params: {
    id: string;
  };
}

export default function EditarTallerPage({ params }: EditarTallerPageProps) {
  const { id } = params;
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Taller</h1>
      <TallerForm tallerId={id} />
    </div>
  );
} 