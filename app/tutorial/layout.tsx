'use client'

import { tutorialChapters } from '@/lib/tutorial-data'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TutorialLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-8 flex flex-col md:flex-row gap-8 relative">
      
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden flex justify-between items-center mb-4 border-b border-card-border pb-4">
        <h2 className="font-bold text-lg">基础语法手册</h2>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="px-3 py-1.5 rounded-md bg-muted text-sm font-medium border border-card-border"
        >
          {mobileMenuOpen ? '收起目录' : '展开目录'}
        </button>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:block w-64 shrink-0">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 custom-scrollbar">
          <h2 className="font-bold text-lg mb-4 text-foreground tracking-tight">基础语法手册</h2>
          <nav className="flex flex-col gap-1 text-sm">
            {tutorialChapters.map((ch) => {
              const isActive = pathname === ch.path || pathname.startsWith(ch.path + '/')
              return (
                <Link
                  key={ch.id}
                  href={ch.path as any}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent font-semibold border-l-2 border-accent'
                      : 'text-muted-fg hover:bg-muted hover:text-foreground border-l-2 border-transparent'
                  }`}
                >
                  {ch.title}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Sidebar (Mobile) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden mb-6"
          >
            <nav className="flex flex-col gap-1 text-sm bg-card p-4 rounded-md border border-card-border">
              {tutorialChapters.map((ch) => {
                const isActive = pathname === ch.path || pathname.startsWith(ch.path + '/')
                return (
                  <Link
                    key={ch.id}
                    href={ch.path as any}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-accent/10 text-accent font-semibold'
                        : 'text-muted-fg hover:bg-muted'
                    }`}
                  >
                    {ch.title}
                  </Link>
                )
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 min-w-0 max-w-4xl">
        {children}
      </main>
    </div>
  )
}
