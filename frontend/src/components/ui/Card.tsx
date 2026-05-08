interface CardProps {
  children: React.ReactNode
  className?: string
  borderColor?: string
}

export default function Card({ children, className = '', borderColor = 'border-neutral-200' }: CardProps) {
  return (
    <div className={`bg-white border ${borderColor} rounded-2xl ${className}`}>
      {children}
    </div>
  )
}
