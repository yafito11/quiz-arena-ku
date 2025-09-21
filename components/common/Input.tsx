
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <input
        id={id}
        className="w-full bg-gray-900/50 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
        {...props}
      />
    </div>
  );
};

export default Input;
