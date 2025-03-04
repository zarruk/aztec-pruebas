'use client';

import { useState, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ value = [], onChange, placeholder = 'Añadir etiqueta...', className }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      // Evitar duplicados
      if (!value.includes(inputValue.trim())) {
        const newTags = [...value, inputValue.trim()];
        onChange(newTags);
      }
      
      setInputValue('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    const newTags = value.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <div 
            key={index} 
            className="inline-flex items-center bg-primary-100 text-primary-800 rounded-md px-2 py-1"
          >
            <span className="text-sm">{tag}</span>
            <button 
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-primary-600 hover:text-primary-800"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
      <p className="text-xs text-slate-500">Presiona Enter para añadir una etiqueta</p>
    </div>
  );
} 