import React from 'react';
import clsx from 'clsx';
import './Button.css';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className, 
  isLoading, 
  disabled, 
  ...props 
}) => {
  return (
    <button 
      className={clsx(
        'btn', 
        `btn-${variant}`, 
        { 'btn-loading': isLoading },
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <span className="loader" /> : children}
    </button>
  );
};
