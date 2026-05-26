import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant hover:bg-primary/10 hover:text-primary transition-all cursor-pointer text-on-surface-variant hover:text-primary"
      title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
    >
      <span className="material-symbols-outlined text-[20px] transition-transform duration-300 active:rotate-45">
        {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
