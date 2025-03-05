"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueInputProps {
  value: KeyValuePair[];
  onChange: (value: KeyValuePair[]) => void;
  placeholder?: string;
  className?: string;
}

export function KeyValueInput({
  value = [],
  onChange,
  placeholder = "Añadir campo...",
  className
}: KeyValueInputProps) {
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  
  // Asegurarse de que value siempre sea un array
  const pairs = Array.isArray(value) ? value : [];
  
  const handleAddPair = () => {
    if (keyInput.trim() !== "") {
      // Verificar que no exista ya la clave
      if (!pairs.some(pair => pair.key === keyInput.trim())) {
        onChange([...pairs, { key: keyInput.trim(), value: valueInput.trim() }]);
      }
      setKeyInput("");
      setValueInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPair();
    }
  };

  const removePair = (index: number) => {
    const newPairs = [...pairs];
    newPairs.splice(index, 1);
    onChange(newPairs);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {pairs.map((pair, index) => (
          <div 
            key={index} 
            className="inline-flex items-center bg-primary-100 text-primary-800 rounded-md px-2 py-1"
          >
            <span className="text-sm font-medium">{pair.key}</span>
            <span className="text-sm mx-1">:</span>
            <span className="text-sm">{pair.value}</span>
            <button
              type="button"
              onClick={() => removePair(index)}
              className="ml-1 text-primary-600 hover:text-primary-800"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Clave"
          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
        <input
          type="text"
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Valor"
          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
        <button
          type="button"
          onClick={handleAddPair}
          className="px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Añadir
        </button>
      </div>
    </div>
  );
} 