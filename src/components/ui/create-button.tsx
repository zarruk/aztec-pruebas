'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface CreateButtonProps {
  href: string;
  label: string;
}

export function CreateButton({ href, label }: CreateButtonProps) {
  return (
    <Link href={href}>
      <div className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors cursor-pointer shadow-sm">
        <Plus className="h-5 w-5 mr-2" />
        {label}
      </div>
    </Link>
  );
} 