import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TallerPageClient } from "../taller-page-client";
import type { Taller, Herramienta, TallerConHerramientas } from "@/lib/types";

export default async function TallerDetalleConReferido({
  params,
}: {
  params: { id: string; referidoPor: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  // Obtener datos del taller
  const { data: taller } = await supabase
    .from("talleres")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!taller) {
    redirect("/talleres");
  }

  // Obtener datos de las herramientas asociadas al taller
  let herramientasData: Herramienta[] = [];
  if (taller.herramientas && taller.herramientas.length > 0) {
    const { data: herramientas } = await supabase
      .from('herramientas')
      .select('*')
      .in('id', taller.herramientas);
    
    if (herramientas) {
      herramientasData = herramientas as Herramienta[];
    }
  }
  
  // Crear un objeto TallerConHerramientas que incluya la información completa de las herramientas
  const tallerConHerramientas: TallerConHerramientas = {
    ...taller,
    herramientas: herramientasData
  };

  // Pasamos el referidoPor como prop al componente cliente
  return <TallerPageClient taller={tallerConHerramientas} referidoPor={params.referidoPor} />;
}
