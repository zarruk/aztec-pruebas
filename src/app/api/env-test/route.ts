import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Definido' : 'No definido',
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Definido' : 'No definido'
  });
} 