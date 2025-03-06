import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TallerDetalle from "../components/taller-detalle";
import type { Taller } from "@/lib/types";

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

  // En lugar de intentar establecer cookies directamente, pasamos el referidoPor como prop
  return <TallerDetalle taller={taller as unknown as Taller} referidoPor={params.referidoPor} />;
}
