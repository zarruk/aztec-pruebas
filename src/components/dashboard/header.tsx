"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Search, Menu, X, User } from "lucide-react";

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  return (
    <header className="fixed top-0 left-0 right-0 h-[var(--header-height)] bg-white border-b border-gray-200 z-30">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Logo y botón de menú móvil */}
        <div className="flex items-center">
          <button 
            className="md:hidden mr-2 p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-brand-600">TallerGest</span>
          </Link>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="search" 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-brand-500 focus:bg-white"
              placeholder="Buscar..." 
            />
          </div>
        </div>
        
        {/* Acciones */}
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="relative">
            <button 
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                <User size={18} className="text-brand-600" />
              </div>
              <span className="hidden md:inline text-sm font-medium">Admin</span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                <Link href="/dashboard/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Mi perfil
                </Link>
                <Link href="/dashboard/configuracion" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Configuración
                </Link>
                <div className="border-t border-gray-200 my-1"></div>
                <Link href="/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Cerrar sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 