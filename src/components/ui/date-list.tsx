'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DateListProps {
  dates: Date[];
  onChange: (dates: Date[]) => void;
}

export function DateList({ dates, onChange }: DateListProps) {
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');

  const handleAddDate = () => {
    if (newDate && newTime) {
      const dateTimeString = `${newDate}T${newTime}:00`;
      const dateObj = new Date(dateTimeString);
      
      if (!isNaN(dateObj.getTime())) {
        const updatedDates = [...dates, dateObj];
        onChange(updatedDates);
        setNewDate('');
        setNewTime('');
      }
    }
  };

  const handleRemoveDate = (index: number) => {
    const updatedDates = [...dates];
    updatedDates.splice(index, 1);
    onChange(updatedDates);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">Fechas disponibles</label>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {dates.length > 0 ? (
            dates.map((date, index) => (
              <div key={index} className="flex items-center bg-gray-100 rounded-md p-2">
                <span className="text-sm">
                  {formatDate(date)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveDate(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay fechas agregadas</p>
          )}
        </div>
        
        <div className="flex items-end gap-2">
          <div className="flex-1 flex gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md"
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-32 p-2 border border-gray-300 rounded-md"
            />
          </div>
          <Button 
            type="button" 
            onClick={handleAddDate}
            disabled={!newDate || !newTime}
          >
            Agregar fecha
          </Button>
        </div>
      </div>
    </div>
  );
} 