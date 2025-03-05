'use client';

import { useEffect, useState } from 'react';

export default function SupressHydrationWarning({ children }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <style jsx global>{`
        body[data-new-gr-c-s-check-loaded],
        body[data-gr-ext-installed] {
          /* Mantener los estilos existentes */
        }
      `}</style>
      {children}
    </>
  );
} 