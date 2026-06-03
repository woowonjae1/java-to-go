'use client'

import { motion } from 'framer-motion'
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
        <div className="w-24 h-8 rounded bg-orange-400/80 flex items-center justify-center text-xs font-bold text-white">Animal</div>
        <div className="w-px h-4 bg-orange-400/60" />
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-7 rounded bg-orange-300/70 flex items-center justify-center text-xs font-semibold text-white">Dog</div>
            <div className="w-px h-3 bg-orange-300/50" />
            <div className="w-18 h-6 rounded bg-orange-200/60 flex items-center justify-center text-[10px] font-medium text-orange-900">GuideDog</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-7 rounded bg-orange-300/70 flex items-center justify-center text-xs font-semibold text-white">Cat</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-7 rounded bg-orange-300/70 flex items-center justify-center text-xs font-semibold text-white">Bird</div>
          </div>
        </div>
        <p className="text-[10px] text-muted-fg mt-2">深层继承树 🌲</p>
      </div>
    ),
    go: (
      <div className="flex flex-col items-center gap-2">
        <div className="w-28 h-8 rounded bg-cyan-400/80 flex items-center justify-center text-xs font-bold text-white">Animal struct</div>
        <div className="flex gap-2 flex-wrap justify-center">
          <div className="px-2 py-1 rounded bg-cyan-300/30 text-[10px] font-medium text-cyan-300 border border-cyan-400/30">+ Walker</div>
          <div className="px-2 py-1 rounded bg-cyan-300/30 text-[10px] font-medium text-cyan-300 border border-cyan-400/30">+ Speaker</div>
          <div className="px-2 py-1 rounded bg-cyan-300/30 text-[10px] font-medium text-cyan-300 border border-cyan-400/30">+ Flyer</div>
        </div>
        <p className="text-[10px] text-muted-fg mt-1">扁平组合 🧩</p>
      </div>
    ),
  },
  'threads-to-goroutines': {
    java: (
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-10 h-14 rounded bg-orange-400/70 flex flex-col items-center justify-center gap-0.5">
              <div className="w-6 h-6 rounded-full bg-orange-200/80 flex items-center justify-center text-[8px] font-bold text-orange-800">T{i}</div>
              <span className="text-[8px] text-white">2MB</span>
            </div>
          ))}
        </div>
        <div className="w-24 h-6 rounded bg-orange-500/60 flex items-center justify-center text-[10px] font-medium text-white">ThreadPool</div>
        <p className="text-[10px] text-muted-fg">重量级线程 🏋️</p>
      </div>
    ),
    go: (
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-0.5 flex-wrap justify-center max-w-[140px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-cyan-400/70 flex items-center justify-center">
              <span className="text-[6px] text-white font-bold">G</span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-cyan-400 font-medium">12 goroutines · ~2KB each</div>
        <p className="text-[10px] text-muted-fg">轻量协程 🚀</p>
      </div>
    ),
  },
  'exceptions-to-errors': {
    java: (
      <div className="flex flex-col items-center gap-1 text-[10px]">
        <div className="px-3 py-1.5 rounded bg-orange-400/70 text-white font-medium">{`try { ... }`}</div>
        <div className="w-px h-2 bg-orange-400/50" />
        <div className="px-3 py-1.5 rounded bg-orange-300/70 text-white font-medium">{`catch (Ex e)`}</div>
        <div className="w-px h-2 bg-orange-300/50" />
        <div className="px-3 py-1.5 rounded bg-orange-200/70 text-orange-900 font-medium">{`finally { }`}</div>
        <p className="text-muted-fg mt-1">异常流 ⚡</p>
      </div>
    ),
    go: (
      <div className="flex flex-col items-center gap-1 text-[10px]">
        <div className="px-3 py-1.5 rounded bg-cyan-400/70 text-white font-medium">val, err := fn()</div>
        <div className="w-px h-2 bg-cyan-400/50" />
        <div className="px-3 py-1.5 rounded bg-cyan-300/70 text-white font-medium">if err != nil</div>
        <div className="w-px h-2 bg-cyan-300/50" />
        <div className="px-3 py-1.5 rounded bg-cyan-200/70 text-cyan-900 font-medium">defer cleanup()</div>
        <p className="text-muted-fg mt-1">错误即值 📦</p>
      </div>
    ),
  },
  'generics-comparison': {
    java: (
      <div className="flex flex-col items-center gap-1.5 text-[10px]">
        <div className="px-2 py-1 rounded bg-orange-400/70 text-white font-mono">{`List<String>`}</div>
        <div className="px-2 py-1 rounded bg-orange-300/60 text-white font-mono">{`Map<K,V>`}</div>
        <div className="px-2 py-1 rounded bg-orange-200/60 text-orange-900 font-mono">{`<T extends Comparable>`}</div>
        <p className="text-muted-fg mt-1">类型擦除 🧹</p>
      </div>
    ),
    go: (
      <div className="flex flex-col items-center gap-1.5 text-[10px]">
        <div className="px-2 py-1 rounded bg-cyan-400/70 text-white font-mono">{`[]string`}</div>
        <div className="px-2 py-1 rounded bg-cyan-300/60 text-white font-mono">{`map[K]V`}</div>
        <div className="px-2 py-1 rounded bg-cyan-200/60 text-cyan-900 font-mono">{`[T comparable]`}</div>
        <p className="text-muted-fg mt-1">类型具化 🎯</p>
      </div>
    ),
  },
}

export function MindShift({ type, title, javaConcept, goConcept, description }: MindShiftProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const anim = svgAnimations[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="my-8 rounded-2xl overflow-hidden border border-card-border bg-card shadow-[var(--shadow-md)]"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-card-border">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <span className="text-lg">💡</span>
          思维转换: {title}
        </h3>
        {description && <p className="text-sm text-muted-fg mt-1">{description}</p>}
      </div>

      {/* Animation area */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
          {/* Java side */}
          <motion.div
            className="flex flex-col items-center p-5 rounded-xl bg-java-bg border border-java-border
                       min-h-[180px] justify-center"
            animate={{ opacity: isFlipped ? 0.4 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-xs font-medium text-java mb-3">☕ {javaConcept}</span>
            {anim.java}
          </motion.div>

          {/* Arrow */}
          <motion.button
            onClick={() => setIsFlipped(!isFlipped)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <motion.div
              animate={{ x: isFlipped ? 5 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center
                         group-hover:bg-accent/20 transition-colors"
            >
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.div>
            <span className="text-[10px] text-muted-fg group-hover:text-accent transition-colors">
              点击切换
            </span>
          </motion.button>

          {/* Go side */}
          <motion.div
            className="flex flex-col items-center p-5 rounded-xl bg-go-bg border border-go-border
                       min-h-[180px] justify-center"
            animate={{ opacity: isFlipped ? 1 : 0.7, scale: isFlipped ? 1.02 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-xs font-medium text-go mb-3">🐹 {goConcept}</span>
            {anim.go}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
