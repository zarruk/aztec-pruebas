import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/components/auth/auth-provider';

export const metadata = {
  title: "Aztec - Plataforma de Talleres",
  description: "Plataforma para gestionar talleres y herramientas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body style={{backgroundColor: 'white', color: '#1f2937', margin: 0, padding: 0}}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
