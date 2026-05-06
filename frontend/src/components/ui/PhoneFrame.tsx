interface PhoneFrameProps {
  children: React.ReactNode
  className?: string
}

export default function PhoneFrame({ children, className = '' }: PhoneFrameProps) {
  return (
    <div className={`inline-block bg-neutral-900 rounded-[3rem] p-4 shadow-2xl ${className}`}>
      <div className="bg-white rounded-[2.5rem] overflow-hidden w-[300px] h-[600px]">
        {children}
      </div>
    </div>
  )
}
