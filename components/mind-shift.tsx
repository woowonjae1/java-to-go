'use client'

import { useState } from 'react'

type MindShiftType =
  | 'inheritance-to-composition'
  | 'threads-to-goroutines'
  | 'exceptions-to-errors'
  | 'generics-comparison'

interface MindShiftProps {
  type: MindShiftType
  title: string
  javaConcept: string
  goConcept: string
  description?: string
}

const svgAnimations: Record<MindShiftType, { java: React.ReactNode; go: React.ReactNode }> = {
  'inheritance-to-composition': {
    java: (
      <div className="flex flex-col items-center gap-1">
        <div className="w-24 h-8 rounded bg-muted border border-card-border flex items-center justify-center text-xs font-bold text-foreground">Animal</div>
        <div className="w-px h-4 bg-card-border" />
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-7 rounded bg-muted border border-card-border flex items-center justify-center text-xs font-semibold text-foreground">Dog</div>
            <div className="w-px h-3 bg-card-border" />
            <div className="w-18 h-6 rounded bg-muted border border-card-border flex items-center justify-center text-[10px] font-medium text-muted-fg">GuideDog</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-7 rounded bg-muted border border-card-border flex items-center justify-center text-xs font-semibold text-foreground">Cat</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-7 rounded bg-muted border border-card-border flex items-center justify-center text-xs font-semibold text-foreground">Bird</div>
          </div>
        </div>
        <p className="text-[10px] text-muted-fg mt-2">深层继承树</p>
      </div>
    ),
    go: (
      <div className="flex flex-col items-center gap-2">
        <div className="w-28 h-8 rounded bg-muted border border-card-border flex items-center justify-center text-xs font-bold text-foreground">Animal struct</div>
        <div className="flex gap-2 flex-wrap justify-center">
          <div className="px-2 py-1 rounded bg-muted text-[10px] font-medium text-muted-fg border border-card-border">+ Walker</div>
          <div className="px-2 py-1 rounded bg-muted text-[10px] font-medium text-muted-fg border border-card-border">+ Speaker</div>
          <div className="px-2 py-1 rounded bg-muted text-[10px] font-medium text-muted-fg border border-card-border">+ Flyer</div>
        </div>
        <p className="text-[10px] text-muted-fg mt-1">扁平组合</p>
      </div>
    ),
  },
  'threads-to-goroutines': {
    java: (
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-10 h-14 rounded bg-muted border border-card-border flex flex-col items-center justify-center gap-0.5">
              <div className="w-6 h-6 rounded-full bg-card border border-card-border flex items-center justify-center text-[8px] font-bold text-foreground">T{i}</div>
              <span className="text-[8px] text-muted-fg">2MB</span>
            </div>
          ))}
        </div>
        <div className="w-24 h-6 rounded bg-muted border border-card-border flex items-center justify-center text-[10px] font-medium text-foreground">ThreadPool</div>
        <p className="text-[10px] text-muted-fg">重量级线程</p>
      </div>
    ),
    go: (
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-0.5 flex-wrap justify-center max-w-[140px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-muted border border-card-border flex items-center justify-center">
              <span className="text-[6px] text-muted-fg font-bold">G</span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-muted-fg font-medium">12 goroutines · ~2KB each</div>
        <p className="text-[10px] text-muted-fg">轻量协程</p>
      </div>
    ),
  },
  'exceptions-to-errors': {
    java: (
      <div className="flex flex-col items-center gap-1 text-[10px]">
        <div className="px-3 py-1.5 rounded bg-muted border border-card-border text-foreground font-medium">{`try { ... }`}</div>
        <div className="w-px h-2 bg-card-border" />
        <div className="px-3 py-1.5 rounded bg-muted border border-card-border text-foreground font-medium">{`catch (Ex e)`}</div>
        <div className="w-px h-2 bg-card-border" />
        <div className="px-3 py-1.5 rounded bg-muted border border-card-border text-muted-fg font-medium">{`finally { }`}</div>
        <p className="text-muted-fg mt-1">异常流</p>
      </div>
    ),
    go: (
      <div className="flex flex-col items-center gap-1 text-[10px]">
        <div className="px-3 py-1.5 rounded bg-muted border border-card-border text-foreground font-medium">val, err := fn()</div>
        <div className="w-px h-2 bg-card-border" />
        <div className="px-3 py-1.5 rounded bg-muted border border-card-border text-foreground font-medium">if err != nil</div>
        <div className="w-px h-2 bg-card-border" />
        <div className="px-3 py-1.5 rounded bg-muted border border-card-border text-muted-fg font-medium">defer cleanup()</div>
        <p className="text-muted-fg mt-1">错误即值</p>
      </div>
    ),
  },
  'generics-comparison': {
    java: (
      <div className="flex flex-col items-center gap-1.5 text-[10px]">
        <div className="px-2 py-1 rounded bg-muted border border-card-border text-foreground font-mono">{`List<String>`}</div>
        <div className="px-2 py-1 rounded bg-muted border border-card-border text-foreground font-mono">{`Map<K,V>`}</div>
        <div className="px-2 py-1 rounded bg-muted border border-card-border text-muted-fg font-mono">{`<T extends Comparable>`}</div>
        <p className="text-muted-fg mt-1">类型擦除</p>
      </div>
    ),
    go: (
      <div className="flex flex-col items-center gap-1.5 text-[10px]">
        <div className="px-2 py-1 rounded bg-muted border border-card-border text-foreground font-mono">{`[]string`}</div>
        <div className="px-2 py-1 rounded bg-muted border border-card-border text-foreground font-mono">{`map[K]V`}</div>
        <div className="px-2 py-1 rounded bg-muted border border-card-border text-muted-fg font-mono">{`[T comparable]`}</div>
        <p className="text-muted-fg mt-1">类型具化</p>
      </div>
    ),
  },
}

export function MindShift({ type, title, javaConcept, goConcept, description }: MindShiftProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const anim = svgAnimations[type]

  return (
    <div
      className="my-8 rounded-md overflow-hidden border border-card-border bg-card"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-card-border">
        <h3 className="text-base font-semibold">
          思维转换: {title}
        </h3>
        {description && <p className="text-sm text-muted-fg mt-1">{description}</p>}
      </div>

      {/* Comparison area */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
          {/* Java side */}
          <div
            className={`flex flex-col items-center p-5 rounded-md bg-java-bg border border-java-border
                       min-h-[180px] justify-center transition-opacity ${isFlipped ? 'opacity-40' : 'opacity-100'}`}
          >
            <span className="text-xs font-medium text-java mb-3">{javaConcept}</span>
            {anim.java}
          </div>

          {/* Arrow */}
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div
              className="w-12 h-12 rounded-full bg-muted flex items-center justify-center
                         border border-card-border group-hover:bg-card transition-colors"
            >
              <svg className="w-6 h-6 text-muted-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <span className="text-[10px] text-muted-fg group-hover:text-foreground transition-colors">
              点击切换
            </span>
          </button>

          {/* Go side */}
          <div
            className={`flex flex-col items-center p-5 rounded-md bg-go-bg border border-go-border
                       min-h-[180px] justify-center transition-opacity ${isFlipped ? 'opacity-100' : 'opacity-70'}`}
          >
            <span className="text-xs font-medium text-go mb-3">{goConcept}</span>
            {anim.go}
          </div>
        </div>
      </div>
    </div>
  )
}
