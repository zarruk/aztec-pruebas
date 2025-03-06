import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TallerPageClient } from "../taller-page-client";
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

  // Pasamos el referidoPor como prop al componente cliente
  return <TallerPageClient taller={taller as unknown as Taller} referidoPor={params.referidoPor} />;
}
