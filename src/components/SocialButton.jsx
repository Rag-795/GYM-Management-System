import React from 'react';

export const SocialButton = ({ provider, icon: Icon, onClick }) => {
  const providers = {
    google: 'hover:bg-red-600',
    facebook: 'hover:bg-blue-600',
    github: 'hover:bg-gray-700'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center justify-center gap-3
        w-full px-4 py-3 
        bg-gray-800 border border-gray-700
        rounded-lg font-semibold text-gray-300
        transition-all duration-200
        hover:border-yellow-400/50 hover:text-white
        ${providers[provider.toLowerCase()]}
      `}
    >
      <Icon className="h-5 w-5" />
      <span>Continue with {provider}</span>
    </button>
  );
};