import * as React from 'react';
import { ChevronDown } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  badge?: string;
  disabled?: boolean;
}

export interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: Option[];
  error?: string;
  hint?: string;
  containerClassName?: string;
  selectClassName?: string;
}

export default function CustomSelect({
  label,
  options,
  error,
  hint,
  children,
  className = '',
  containerClassName = '',
  selectClassName = '',
  id,
  disabled,
  ...props
}: CustomSelectProps) {
  const generatedId = React.useId();
  const selectId = id || generatedId;

  return (
    <div className={`relative flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-bold text-[#1c1d1a] uppercase tracking-wider flex items-center justify-between"
        >
          <span>{label}</span>
          {hint && <span className="text-[11px] font-normal text-[#78756e] normal-case tracking-normal">{hint}</span>}
        </label>
      )}

      <div className="relative w-full">
        <select
          id={selectId}
          disabled={disabled}
          className={`w-full appearance-none -webkit-appearance-none bg-white hover:bg-[#FAF8F3] text-[#1c1d1a] font-sans text-xs sm:text-sm font-medium rounded-xl border transition-all duration-200 pl-4 pr-10 py-2.5 sm:py-3 cursor-pointer outline-none ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-[#E2DCD0] hover:border-[#1c1d1a]/60 focus:border-[#E87535] focus:ring-2 focus:ring-[#E87535]/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-neutral-100' : 'shadow-2xs'} ${selectClassName} ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled} className="text-[#1c1d1a] bg-white py-1">
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {/* Custom Chevron Indicator */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#78756e] transition-transform duration-200">
          <ChevronDown size={16} strokeWidth={2.2} />
        </div>
      </div>

      {error && <span className="text-xs font-medium text-red-600 mt-0.5">{error}</span>}
    </div>
  );
}

