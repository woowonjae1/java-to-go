'use client'

import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { CommandPalette } from './command-palette'
import { chapters } from '@/lib/data'
import { useState } from 'react'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-card-border glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg hover:opacity-80 transition-opacity shrink-0"
        >
          <span className="gradient-text">Java → Go</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/"
            className="px-3 py-2 rounded-lg text-sm font-medium text-muted-fg hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            首页
          </Link>

          {/* Mega-menu dropdown for chapters */}
          <div className="relative group">
            <button className="px-3 py-2 rounded-lg text-sm font-medium text-muted-fg hover:text-foreground hover:bg-muted transition-all duration-200 flex items-center gap-1.5 cursor-pointer">
              <span>学习章节</span>
              <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown panel */}
            <div className="absolute top-[100%] left-1/2 -translate-x-1/2 mt-1 w-[520px] bg-card border border-card-border rounded-2xl shadow-xl p-4 hidden group-hover:grid grid-cols-2 gap-3 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
              {chapters.map((ch, idx) => (
                <Link
                  key={ch.id}
                  href={`/chapters/${ch.id}`}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/60 border border-transparent hover:border-card-border transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${ch.color} flex items-center justify-center text-lg shadow-sm shrink-0`}>
                    {ch.icon}
                  </div>
                  <div>
                    <div className="text-xs text-muted-fg font-mono mb-0.5">Chapter {idx + 1}</div>
                    <div className="text-sm font-semibold text-foreground">{ch.title}</div>
                    <div className="text-[11px] text-muted-fg leading-relaxed mt-0.5 truncate max-w-[180px]">{ch.titleEn}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/examples"
            className="px-3 py-2 rounded-lg text-sm font-medium text-muted-fg hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            示例库
          </Link>
          <Link
            href="/java-vs-go"
            className="px-3 py-2 rounded-lg text-sm font-medium text-muted-fg hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            速查表
          </Link>
          <Link
            href="/faq"
            className="px-3 py-2 rounded-lg text-sm font-medium text-muted-fg hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            FAQ
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <CommandPalette />
          <ThemeToggle />
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center
                       bg-muted hover:bg-accent-light transition-all duration-200"
            aria-label="GitHub"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>

          {/* Mobile menu button */}
          <button
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center
                       bg-muted hover:bg-accent-light transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="菜单"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <nav className="md:hidden border-t border-card-border bg-card p-4 space-y-1">
          {chapters.map((ch) => (
            <Link
              key={ch.id}
              href={`/chapters/${ch.id}`}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <span className="mr-2">{ch.icon}</span>
              {ch.title} — {ch.titleEn}
            </Link>
          ))}
          <div className="border-t border-card-border my-2" />
          <Link href="/examples" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-sm hover:bg-muted transition-colors">
            <span className="mr-2">📚</span>实战示例库
          </Link>
          <Link href="/java-vs-go" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-sm hover:bg-muted transition-colors">
            <span className="mr-2">🔄</span>Java vs Go 速查表
          </Link>
          <Link href="/faq" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-sm hover:bg-muted transition-colors">
            <span className="mr-2">❓</span>常见困惑 FAQ
          </Link>
        </nav>
      )}
    </header>
  )
}
