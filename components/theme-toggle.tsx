'use client'

import { useTheme } from 'next-themes'
import { useClientMounted } from '@/lib/use-client-mounted'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useClientMounted()

  if (!mounted) return <div className="w-10 h-10" />

  const isDark = theme === 'dark'

  return (
    <button
      id="theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-10 h-10 rounded-full flex items-center justify-center
                 bg-muted hover:bg-accent-light transition-all duration-300
                 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
      aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
    >
      {/* Sun */}
      <svg
        className={`absolute w-5 h-5 transition-all duration-500 ${
          isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      {/* Moon */}
      <svg
        className={`absolute w-5 h-5 transition-all duration-500 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    </button>
  )
}
