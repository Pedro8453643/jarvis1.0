import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, className = '', id, options, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">{label}</label>}
      <div className="relative">
        <select
          id={id}
          className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 appearance-none
          transition-all duration-200
          focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black
          disabled:bg-gray-100 disabled:text-gray-400
          ${error ? 'border-red-500 bg-red-50' : ''} 
          ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600 pl-1">{error}</p>}
    </div>
  );
};