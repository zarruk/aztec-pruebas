'use client';

import { useState, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ 
  value = [],
  onChange, 
  placeholder = "Añadir etiqueta...", 
  className 
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  
  const tags = Array.isArray(value) ? value : [];
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <div 
            key={index} 
            className="inline-flex items-center bg-primary-100 text-primary-800 rounded-md px-2 py-1"
          >
            <span className="text-sm">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-primary-600 hover:text-primary-800"
            >
              <X size={14} />
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
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
      />
    </div>
  );
} 