interface CardProps {
  children: React.ReactNode
  className?: string
  borderColor?: string
}

export default function Card({ children, className = '', borderColor = 'border-neutral-200' }: CardProps) {
  return (
    <div className={`bg-white border ${borderColor} rounded-2xl p-8 ${className}`}>
      {children}
    </div>
  )
}
