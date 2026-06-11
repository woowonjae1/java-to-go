'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { ThemeToggle } from './theme-toggle'
import { CommandPalette } from './command-palette'
import { chapters } from '@/lib/data'
import { useState, useRef, useEffect } from 'react'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false)
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-card-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base hover:opacity-80 transition-opacity shrink-0"
        >
          <span className="font-mono font-bold text-foreground tracking-tight">Java ↔ Go</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm text-muted-fg hover:text-foreground transition-colors"
          >
            首页
          </Link>

          {/* Dropdown for chapters */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="px-3 py-1.5 text-sm text-muted-fg hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer">
              <span>学习章节</span>
              <svg className={`w-3 h-3 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 pt-1 z-50">
                <div className="w-80 bg-card border border-card-border rounded-md shadow-md py-1">
                  {chapters.map((ch, idx) => (
                    <Link
                      key={ch.id}
                      href={`/chapters/${ch.id}` as Route}
                      className="flex items-baseline gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <span className="font-mono text-xs text-muted-fg w-5 shrink-0">{idx + 1}.</span>
                      <span className="text-foreground">{ch.title}</span>
                      <span className="text-xs text-muted-fg ml-auto truncate max-w-[120px]">{ch.titleEn}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/project-comparison"
            className="px-3 py-1.5 text-sm text-muted-fg hover:text-foreground transition-colors"
          >
            实战对比
          </Link>
          <Link
            href="/tools"
            className="px-3 py-1.5 text-sm text-muted-fg hover:text-foreground transition-colors"
          >
            可视化工具
          </Link>
          <Link
            href="/examples"
            className="px-3 py-1.5 text-sm text-muted-fg hover:text-foreground transition-colors"
          >
            示例库
          </Link>
          <Link
            href="/java-vs-go"
            className="px-3 py-1.5 text-sm text-muted-fg hover:text-foreground transition-colors"
          >
            速查表
          </Link>
          <Link
            href="/faq"
            className="px-3 py-1.5 text-sm text-muted-fg hover:text-foreground transition-colors"
          >
            FAQ
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          <CommandPalette />
          <ThemeToggle />
          <a
            href="https://github.com/woowonjae1/java-to-go"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-md flex items-center justify-center
                       text-muted-fg hover:text-foreground hover:bg-muted transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>

          {/* Mobile menu button */}
          <button
            className="md:hidden w-8 h-8 rounded-md flex items-center justify-center
                       text-muted-fg hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="菜单"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-card-border bg-card p-2 space-y-0.5">
          {chapters.map((ch, idx) => (
            <Link
              key={ch.id}
              href={`/chapters/${ch.id}` as Route}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
            >
              <span className="font-mono text-xs text-muted-fg w-4">{idx + 1}.</span>
              <span>{ch.title}</span>
            </Link>
          ))}
          <div className="border-t border-card-border my-1.5" />
          <Link href="/project-comparison" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
            实战对比
          </Link>
          <Link href="/tools" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
            可视化工具
          </Link>
          <Link href="/examples" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
            示例库
          </Link>
          <Link href="/java-vs-go" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
            速查表
          </Link>
          <Link href="/faq" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
            FAQ
          </Link>
        </nav>
      )}
    </header>
  )
}
