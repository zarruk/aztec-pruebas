'use client';

import { useEffect } from 'react';

export default function GrammarlyCleaner() {
  useEffect(() => {
    // Función para limpiar atributos de Grammarly
    const cleanGrammarlyAttributes = () => {
      const body = document.body;
      
      // Remover atributos específicos de Grammarly
      if (body.hasAttribute('data-new-gr-c-s-check-loaded')) {
        body.removeAttribute('data-new-gr-c-s-check-loaded');
      }
      
      if (body.hasAttribute('data-gr-ext-installed')) {
        body.removeAttribute('data-gr-ext-installed');
      }
      
      // Observar cambios en el body para limpiar atributos que puedan añadirse después
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'data-new-gr-c-s-check-loaded' || 
                mutation.attributeName === 'data-gr-ext-installed') {
              body.removeAttribute(mutation.attributeName);
            }
          }
        });
      });
      
      observer.observe(body, { attributes: true });
      
      return () => {
        observer.disconnect();
      };
    };
    
    cleanGrammarlyAttributes();
  }, []);
  
  return null;
} 