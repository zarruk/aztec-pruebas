import ClientOnly from '@/components/ClientOnly';
import GrammarlySupport from '@/components/GrammarlySupport';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* ... */}
      </head>
      <body 
        style={{ backgroundColor: "white", color: "#1f2937", margin: 0, padding: 0 }}
        suppressHydrationWarning
      >
        <GrammarlySupport />
        <ClientOnly>
          {children}
        </ClientOnly>
      </body>
    </html>
  );
} 