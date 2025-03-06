import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Image 
            src="/aztec-logo.svg" 
            alt="Aztec Logo" 
            width={120} 
            height={40}
            priority
            unoptimized
          />
        </Link>
      </div>
      
      <nav className="flex items-center space-x-4">
        <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium">
          <span className="mr-2">Dashboard</span>
        </Link>
        <Link href="/dashboard/talleres" className="flex items-center px-3 py-2 text-sm font-medium">
          <span className="mr-2">Talleres</span>
        </Link>
        <Link href="/dashboard/herramientas" className="flex items-center px-3 py-2 text-sm font-medium">
          <span className="mr-2">Herramientas</span>
        </Link>
      </nav>
    </header>
  );
} 