'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { chapters } from '@/lib/data'
import { type ReactNode } from 'react'

export default function ChaptersLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-7xl mx-auto flex">
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-sidebar-border bg-sidebar
                         sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
        <nav className="space-y-1">
          {chapters.map((ch, i) => {
            const isActive = pathname === `/chapters/${ch.id}`
            return (
              <div key={ch.id}>
                <Link
                  href={`/chapters/${ch.id}`}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm
                             transition-all duration-200
                             ${isActive
                               ? 'bg-accent-light text-accent font-semibold'
                               : 'text-muted-fg hover:text-foreground hover:bg-muted'
                             }`}
                >
                  <span>{ch.icon}</span>
                  <div>
                    <div className="font-medium">{ch.title}</div>
                    <div className="text-xs opacity-70">{ch.titleEn}</div>
                  </div>
                </Link>

                {/* Sub-sections when active */}
                {isActive && (
                  <div className="ml-8 mt-1 space-y-0.5 border-l-2 border-accent/20 pl-3">
                    {ch.sections.map((sec) => (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        className="block px-2 py-1.5 text-xs text-muted-fg
                                   hover:text-accent transition-colors rounded"
                      >
                        {sec.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 px-4 sm:px-8 py-10 max-w-4xl">
        {children}
      </div>
    </div>
  )
}
