import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose }) => {
  const types = {
    success: {
      bg: 'bg-green-900/20',
      border: 'border-green-500',
      text: 'text-green-400',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-red-900/20',
      border: 'border-red-500',
      text: 'text-red-400',
      icon: AlertCircle
    },
    info: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-500',
      text: 'text-blue-400',
      icon: Info
    },
    warning: {
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-500',
      text: 'text-yellow-400',
      icon: AlertCircle
    }
  };

  const style = types[type];
  const IconComponent = style.icon;

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-4 mb-4 flex items-start justify-between`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`h-5 w-5 ${style.text} flex-shrink-0 mt-0.5`} />
        <p className={`${style.text} text-sm`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${style.text} hover:opacity-70 transition-opacity`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};