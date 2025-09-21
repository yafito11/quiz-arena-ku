
import React from 'react';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="text-center cursor-pointer" onClick={onLogoClick}>
       <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
          Gemini Quiz Arena
        </span>
      </h1>
      <p className="text-gray-400 mt-2">The ultimate AI-powered trivia challenge</p>
    </header>
  );
};

export default Header;
