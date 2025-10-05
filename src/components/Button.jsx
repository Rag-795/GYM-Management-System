import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  onClick, 
  disabled = false, 
  loading = false,
  fullWidth = false,
  icon: Icon,
  className = ''
}) => {
  const variants = {
    primary: 'bg-yellow-400 text-black hover:bg-yellow-300 focus:ring-yellow-400',
    secondary: 'bg-transparent text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        px-6 py-3 rounded-lg font-bold
        transition-all duration-200 transform
        hover:scale-105 active:scale-95 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${fullWidth ? 'w-full' : ''}
        ${className}
        flex items-center justify-center gap-2
      `}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="h-5 w-5" />}
          {children}
        </>
      )}
    </button>
  );
};
