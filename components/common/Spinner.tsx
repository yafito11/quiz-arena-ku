
import React from 'react';

interface SpinnerProps {
    message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-12 h-12 border-4 border-t-brand-primary border-gray-600 rounded-full animate-spin"></div>
      {message && <p className="text-lg font-semibold text-gray-300">{message}</p>}
    </div>
  );
};

export default Spinner;
