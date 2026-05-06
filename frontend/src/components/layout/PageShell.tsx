interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export default function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <main className={`min-h-screen bg-white ${className}`}>
      {children}
    </main>
  )
}
