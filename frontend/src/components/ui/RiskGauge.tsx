interface RiskGaugeProps {
  score: number // 0-100
  size?: 'sm' | 'md' | 'lg'
}

export default function RiskGauge({ score, size = 'md' }: RiskGaugeProps) {
  const getColor = (score: number) => {
    if (score >= 70) return 'text-status-block'
    if (score >= 40) return 'text-status-warn'
    return 'text-status-safe'
  }

  const sizeClasses = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-4xl',
  }

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="#E8E7E4"
          strokeWidth="8"
        />
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke={score >= 70 ? '#9B1C1C' : score >= 40 ? '#B45309' : '#1A7A4A'}
          strokeWidth="8"
          strokeDasharray={`${score * 2.83} 283`}
          strokeLinecap="round"
        />
      </svg>
      <span className={`font-instrument ${getColor(score)}`}>
        {score}
      </span>
    </div>
  )
}
