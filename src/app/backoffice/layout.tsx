'use client';

import React from 'react';
import Link from 'next/link';

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{backgroundColor: 'white', color: 'black', minHeight: '100vh'}}>
      {/* Header/Navbar */}
      <header style={{backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 0'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <img
              src="https://taller-fundamental.web.app/Logo%20Aztec%20(800%20x%20400%20px)%20(2).png"
              alt="Aztec Logo"
              style={{height: '2rem', width: 'auto', objectFit: 'contain'}}
            />
            <h1 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1f2937'}}>Backoffice - Panel de Administración</h1>
          </div>
          <nav>
            <ul style={{display: 'flex', gap: '1.5rem'}}>
              <li>
                <a href="/backoffice" style={{color: '#1f2937', textDecoration: 'none'}}>
                  Inicio
                </a>
              </li>
              <li>
                <a href="/backoffice/talleres" style={{color: '#1f2937', textDecoration: 'none'}}>
                  Talleres
                </a>
              </li>
              <li>
                <a href="/talleres" style={{color: '#1f2937', textDecoration: 'none'}}>
                  Ver Sitio Público
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', backgroundColor: 'white', color: '#1f2937'}}>
        {children}
      </main>
    </div>
  );
} 