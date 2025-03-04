'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({ 
  children, 
  className, 
  required = false, 
  ...props 
}: FormLabelProps) {
  return (
    <label 
      className={cn(
        "block text-sm font-medium text-slate-900 mb-1",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
} 