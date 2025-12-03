import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">{label}</label>}
      <input
        id={id}
        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400
        transition-all duration-200
        focus:outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-gray-100
        disabled:bg-gray-100 disabled:text-gray-400
        ${error ? 'border-black bg-gray-50 focus:ring-gray-200' : ''} 
        ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-gray-800 pl-1 font-bold">{error}</p>}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">{label}</label>}
      <textarea
        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400
        transition-all duration-200
        focus:outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-gray-100
        ${className}`}
        {...props}
      />
    </div>
  );
};