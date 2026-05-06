import { Link, useLocation } from 'react-router-dom'
import { Link as ScrollLink } from 'react-scroll'

export default function Navbar() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <nav className="sticky top-0 z-50 h-[60px] bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-3 h-3 bg-neutral-900 rounded-full" />
          <span className="font-instrument text-xl">SafeSwitch</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {isLanding ? (
            <>
              <ScrollLink to="how-it-works" smooth offset={-60} className="text-body-sm text-neutral-600 hover:text-neutral-900 cursor-pointer">Demo</ScrollLink>
              <ScrollLink to="how-it-works" smooth offset={-60} className="text-body-sm text-neutral-600 hover:text-neutral-900 cursor-pointer">Architecture</ScrollLink>
              <Link to="/dashboard" className="text-body-sm text-neutral-600 hover:text-neutral-900">Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/demo" className="text-body-sm text-neutral-600 hover:text-neutral-900">Demo</Link>
              <Link to="/architecture" className="text-body-sm text-neutral-600 hover:text-neutral-900">Architecture</Link>
              <Link to="/dashboard" className="text-body-sm text-neutral-600 hover:text-neutral-900">Dashboard</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <a href="https://github.com" target="_blank" rel="noopener" className="text-body-sm text-neutral-600 hover:text-neutral-900 hidden sm:block">View on GitHub</a>
          <Link to="/demo">
            <button className="bg-neutral-900 text-white text-body-sm font-medium rounded-full px-6 py-2.5 hover:bg-neutral-700 transition-colors duration-200">
              Try Live Demo
            </button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
