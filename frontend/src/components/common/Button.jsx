import React from 'react';
import clsx from 'clsx';


export const Button = ({
  children,
  variant = 'primary',
  className,
  isLoading,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 h-12 rounded-full font-bold text-base transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none tracking-wide";

  const variants = {
    primary: "bg-white text-black shadow-lg hover:bg-gray-100",
    secondary: "bg-white/10 text-white backdrop-blur-md border border-white/10 hover:bg-white/20",
    ghost: "bg-transparent text-white/60 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30",
    neon: "bg-neon-green text-black shadow-[0_0_20px_rgba(124,255,178,0.4)] hover:bg-[#9effc5]"
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant] || variants.primary,
        { 'cursor-wait': isLoading },
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
};
