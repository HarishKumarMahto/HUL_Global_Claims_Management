import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface MultiSelectDropdownProps {
  label?: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

export function MultiSelectDropdown({
  label,
  placeholder,
  options,
  selected,
  onChange,
  disabled = false,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((item) => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const displayValue = selected.length === 0
    ? placeholder
    : selected.length <= 2
    ? selected.join(', ')
    : `${selected.length} selected`;

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-semibold text-[#133062] mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-[#DEDED7] rounded-lg text-sm text-left flex items-center justify-between transition-all bg-white cursor-pointer focus:ring-2 focus:ring-[#0066CC] outline-none"
      >
        <span className={`truncate ${selected.length === 0 ? 'text-gray-400' : 'text-[#133062]'}`}>
          {displayValue}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-[#DEDED7] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto py-1">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400 italic">No options available</div>
          ) : (
            options.map((opt) => {
              const isChecked = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleToggle(opt)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-[#F6F7F0] cursor-pointer ${
                    isChecked ? 'font-medium text-[#133062]' : 'text-gray-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all border ${
                      isChecked ? 'bg-[#0066CC] border-[#0066CC]' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {opt}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
