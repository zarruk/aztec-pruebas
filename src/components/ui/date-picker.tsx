import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '@/lib/utils';
import { CalendarIcon, X } from 'lucide-react';

interface DatePickerInputProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  className,
  error,
  disabled,
}: DatePickerInputProps) {
  return (
    <div className="relative">
      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-destructive" : "border-input",
          className
        )}
        disabled={disabled}
      />
      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

interface MultiDatePickerInputProps {
  dates: Date[];
  onChange: (dates: Date[]) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
}

export function MultiDatePickerInput({
  dates = [],
  onChange,
  placeholder = 'Seleccionar fechas',
  className,
  error,
  disabled,
}: MultiDatePickerInputProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(null);
    
    if (date) {
      // Añadir la fecha al array si no existe ya
      const dateExists = dates.some(d => 
        d.getFullYear() === date.getFullYear() && 
        d.getMonth() === date.getMonth() && 
        d.getDate() === date.getDate()
      );
      
      if (!dateExists) {
        onChange([...dates, date]);
      }
    }
  };

  const removeDate = (index: number) => {
    const newDates = [...dates];
    newDates.splice(index, 1);
    onChange(newDates);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          placeholderText={placeholder}
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-destructive" : "border-input",
            className
          )}
          disabled={disabled}
        />
        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
      
      {dates.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {dates.map((date, index) => (
            <div 
              key={index} 
              className="inline-flex items-center bg-primary-100 text-primary-800 rounded-md px-2 py-1"
            >
              <span className="text-sm">{date.toLocaleDateString()}</span>
              <button
                type="button"
                onClick={() => removeDate(index)}
                className="ml-1 text-primary-600 hover:text-primary-800"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 