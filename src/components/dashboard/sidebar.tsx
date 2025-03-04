"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Tool, 
  Users, 
  Settings,
  ChevronDown,
  ChevronRight
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Talleres",
    href: "/dashboard/talleres",
    icon: Calendar,
    submenu: [
      { title: "Todos los talleres", href: "/dashboard/talleres" },
      { title: "Nuevo taller", href: "/dashboard/talleres/nuevo" },
      { title: "Calendario", href: "/dashboard/talleres/calendario" },
    ]
  },
  {
    title: "Herramientas",
    href: "/dashboard/herramientas",
    icon: Tool,
    submenu: [
      { title: "Inventario", href: "/dashboard/herramientas" },
      { title: "Nueva herramienta", href: "/dashboard/herramientas/nueva" },
      { title: "Categorías", href: "/dashboard/herramientas/categorias" },
    ]
  },
  {
    title: "Participantes",
    href: "/dashboard/participantes",
    icon: Users,
  },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  
  // Expandir automáticamente el menú activo
  useEffect(() => {
    const newExpandedMenus = { ...expandedMenus };
    
    menuItems.forEach(item => {
      if (item.submenu && item.submenu.some(subitem => pathname === subitem.href)) {
        newExpandedMenus[item.title] = true;
      }
    });
    
    setExpandedMenus(newExpandedMenus);
  }, [pathname]);
  
  const toggleSubmenu = (title: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };
  
  const isActive = (href: string) => pathname === href;
  
  return (
    <aside className="fixed left-0 top-[var(--header-height)] bottom-0 w-[var(--sidebar-width)] bg-white border-r border-gray-200 overflow-y-auto z-20">
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg font-medium ${
                      pathname.startsWith(item.href)
                        ? "text-brand-700 bg-brand-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon size={18} className="mr-3" />
                      {item.title}
                    </div>
                    {expandedMenus[item.title] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  
                  {expandedMenus[item.title] && (
                    <div className="mt-1 ml-6 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={`block px-3 py-2 text-sm rounded-lg ${
                            isActive(subitem.href)
                              ? "text-brand-700 bg-brand-50 font-medium"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {subitem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm rounded-lg font-medium ${
                    isActive(item.href)
                      ? "text-brand-700 bg-brand-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon size={18} className="mr-3" />
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
} 