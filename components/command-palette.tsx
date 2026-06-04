'use client'

import { useState, useEffect } from 'react'
import { Command } from 'cmdk'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { chapters } from '@/lib/data'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const navigate = (path: Route) => {
    router.push(path)
    setOpen(false)
  }

  return (
    <>
      {/* Trigger button */}
      <button
        id="search-trigger"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-muted-fg
                   text-sm hover:bg-accent-light hover:text-foreground transition-all duration-200
                   border border-card-border"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <span className="hidden sm:inline">搜索...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded
                        bg-card border border-card-border text-[10px] font-mono text-muted-fg">
          ⌘K
        </kbd>
      </button>

      {/* Dialog */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg">
            <Command
              className="rounded-2xl border border-card-border bg-card shadow-2xl overflow-hidden"
              label="全局搜索"
            >
              <Command.Input
                placeholder="搜索概念... 如：泛型、goroutine、interface"
                className="w-full px-5 py-4 border-b border-card-border bg-transparent
                           text-sm outline-none placeholder:text-muted-fg"
                autoFocus
              />
              <Command.List className="max-h-[300px] overflow-y-auto p-2">
                <Command.Empty className="px-4 py-8 text-center text-sm text-muted-fg">
                  未找到相关内容
                </Command.Empty>

                <Command.Group heading="章节" className="px-2 py-1 text-xs font-medium text-muted-fg">
                  {chapters.map((ch) => (
                    <Command.Item
                      key={ch.id}
                      value={`${ch.title} ${ch.titleEn} ${ch.description}`}
                      onSelect={() => navigate(`/chapters/${ch.id}` as Route)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                                 cursor-pointer hover:bg-accent-light data-[selected=true]:bg-accent-light
                                 transition-colors"
                    >
                      <span className="text-lg">{ch.icon}</span>
                      <div>
                        <div className="font-medium">{ch.title} — {ch.titleEn}</div>
                        <div className="text-xs text-muted-fg">{ch.description}</div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="概念跳转" className="px-2 py-1 text-xs font-medium text-muted-fg mt-2">
                  {chapters.flatMap((ch) =>
                    ch.sections.map((sec) => (
                      <Command.Item
                        key={`${ch.id}-${sec.id}`}
                        value={`${sec.title} ${sec.javaConcept} ${sec.goConcept}`}
                        onSelect={() => navigate(`/chapters/${ch.id}#${sec.id}` as Route)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                                   cursor-pointer hover:bg-accent-light data-[selected=true]:bg-accent-light
                                   transition-colors"
                      >
                        <span className="text-xs text-muted-fg">→</span>
                        <div>
                          <div className="font-medium text-sm">{sec.title}</div>
                          <div className="text-xs text-muted-fg">
                            {sec.javaConcept} → {sec.goConcept}
                          </div>
                        </div>
                      </Command.Item>
                    ))
                  )}
                </Command.Group>
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  )
}
