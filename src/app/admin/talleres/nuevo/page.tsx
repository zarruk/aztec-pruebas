import TallerForm from '@/components/TallerForm';

export default function NuevoTallerPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Nuevo Taller</h1>
      <TallerForm tallerId={null} />
    </div>
  );
} 