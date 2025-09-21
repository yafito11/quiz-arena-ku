
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-6 py-3 font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark';

  const variantClasses = {
    primary: 'bg-brand-primary hover:bg-indigo-500 text-white focus:ring-indigo-400',
    secondary: 'bg-brand-secondary hover:bg-emerald-500 text-white focus:ring-emerald-400',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-400',
    success: 'bg-green-600 hover:bg-green-500 text-white focus:ring-green-400',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
