import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 h-[60px] bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-3 h-3 bg-neutral-900 rounded-full" />
          <span className="font-instrument text-xl">SafeSwitch</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/demo" className="text-body-sm text-neutral-600 hover:text-neutral-900">Demo</Link>
          <Link to="/dashboard" className="text-body-sm text-neutral-600 hover:text-neutral-900">Dashboard</Link>
        </div>

        <div className="flex items-center gap-3">
          <a href="https://github.com/kawacukennedy/safeswitch.git" target="_blank" rel="noopener noreferrer" className="text-body-sm text-neutral-600 hover:text-neutral-900 hidden sm:block">View on GitHub</a>
          <Link to="/demo" className="hidden sm:block">
            <button className="bg-neutral-900 text-white text-body-sm font-medium rounded-full px-6 py-2.5 hover:bg-neutral-700 transition-colors duration-200">
              Try Live Demo
            </button>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-neutral-600 transition-transform duration-200 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-neutral-600 transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-neutral-600 transition-transform duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white/95 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
            <Link to="/demo" onClick={() => setMobileOpen(false)} className="text-body-md text-neutral-700 hover:text-neutral-900">Demo</Link>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-body-md text-neutral-700 hover:text-neutral-900">Dashboard</Link>
            <Link to="/demo" onClick={() => setMobileOpen(false)}>
              <button className="w-full bg-neutral-900 text-white text-body-sm font-medium rounded-full px-6 py-2.5 hover:bg-neutral-700 transition-colors duration-200">
                Try Live Demo
              </button>
            </Link>
            <a href="https://github.com/kawacukennedy/safeswitch.git" target="_blank" rel="noopener noreferrer" className="text-body-md text-neutral-500 hover:text-neutral-700">View on GitHub</a>
          </div>
        </div>
      )}
    </nav>
  )
}
