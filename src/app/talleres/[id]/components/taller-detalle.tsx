export default function TallerDetalle({ taller, referidoPor }: { taller: Taller; referidoPor?: string }) {
  // ... código existente
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... contenido existente */}
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Regístrate en este taller</h2>
        <RegistroForm tallerId={taller.id} referidoPor={referidoPor} />
      </div>
    </div>
  );
} 