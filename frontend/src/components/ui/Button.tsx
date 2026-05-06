import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const variantClasses = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-700',
  secondary: 'bg-neutral-0 text-neutral-900 border border-neutral-300 hover:bg-neutral-100',
  ghost: 'text-neutral-600 hover:text-neutral-900',
}

const sizeClasses = {
  sm: 'px-4 py-2 text-body-sm',
  md: 'px-6 py-3 text-body-sm',
  lg: 'px-6 py-4 text-heading-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`font-medium rounded-full transition-colors duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
