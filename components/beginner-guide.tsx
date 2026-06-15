'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { useState } from 'react'

interface BeginnerGuideProps {
  /** 当前章节在路线中的位置 (1-based) */
  stepNumber: number
  /** 当前章节标题 */
  chapterTitle: string
  /** 学这章之前你应该已知道的 Java 概念 */
  javaPrereqs: string[]
  /** 这一章你将解锁的 Go 核心概念 */
  goKeywords: string[]
  /** 一句话点睛：这章最重要的思维转变 */
  mindShift: string
  /** 上一章链接（可选） */
  prevHref?: string
  prevLabel?: string
}

/**
 * BeginnerGuide — 小白导引横幅
 * 放置在每个章节页面顶部，帮助有 Java 基础但刚接触 Go 的读者快速定位自己的位置。
 */
export function BeginnerGuide({
  stepNumber,
  chapterTitle,
  javaPrereqs,
  goKeywords,
  mindShift,
  prevHref,
  prevLabel,
}: BeginnerGuideProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="mb-8 rounded-md border border-green-500/25 bg-green-500/5 overflow-hidden">
      {/* Header bar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-500/5 transition-colors text-left"
      >
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500/20 text-green-400
                          flex items-center justify-center text-xs font-bold font-mono">
          {stepNumber}
        </span>
        <span className="font-semibold text-sm text-green-300 flex-1">
          🐹 新手导引 — {chapterTitle}
        </span>
        <Link
          href="/beginner"
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] text-green-400/70 hover:text-green-400 transition-colors hidden sm:block"
        >
          查看完整入门指南 →
        </Link>
        <svg
          className={`w-4 h-4 text-muted-fg transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-4">
          {/* Mind shift */}
          <div className="flex items-start gap-2.5 p-3 rounded-md bg-green-500/8 border border-green-500/15">
            <span className="text-lg shrink-0">💡</span>
            <div>
              <span className="text-xs font-bold text-green-300 block mb-0.5">本章核心思维转变</span>
              <p className="text-sm text-muted-fg leading-relaxed">{mindShift}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Java prereqs */}
            <div>
              <p className="text-[11px] font-semibold text-muted-fg uppercase tracking-wide mb-2">
                ☕ 你需要已熟悉的 Java 概念
              </p>
              <div className="flex flex-wrap gap-1.5">
                {javaPrereqs.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded text-[11px] font-mono
                               bg-red-500/10 text-red-300 border border-red-500/15"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Go keywords to unlock */}
            <div>
              <p className="text-[11px] font-semibold text-muted-fg uppercase tracking-wide mb-2">
                🐹 本章你将掌握的 Go 概念
              </p>
              <div className="flex flex-wrap gap-1.5">
                {goKeywords.map((k) => (
                  <span
                    key={k}
                    className="px-2 py-0.5 rounded text-[11px] font-mono
                               bg-green-500/10 text-green-300 border border-green-500/15"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation hint */}
          {prevHref && (
            <p className="text-[11px] text-muted-fg">
              💬 建议先完成{' '}
              <Link href={prevHref as Route} className="text-accent hover:underline">
                {prevLabel}
              </Link>{' '}
              再学本章。
            </p>
          )}
        </div>
      )}
    </div>
  )
}
