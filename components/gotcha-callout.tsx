'use client'

import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface GotchaCalloutProps {
  level: 'warning' | 'danger' | 'tip'
  title?: string
  children: ReactNode
  javaWay?: string
  goWay?: string
}

const levelConfig = {
  warning: {
    icon: '⚠️',
    defaultTitle: 'Java 肌肉记忆警告',
    borderClass: 'border-warning-border',
    bgClass: 'bg-warning-bg',
    titleColor: 'text-warning-fg',
  },
  danger: {
    icon: '🚨',
    defaultTitle: '致命陷阱',
    borderClass: 'border-danger-border',
    bgClass: 'bg-danger-bg',
    titleColor: 'text-danger-fg',
  },
  tip: {
    icon: '💡',
    defaultTitle: 'Go 最佳实践',
    borderClass: 'border-success-border',
    bgClass: 'bg-success-bg',
    titleColor: 'text-success-fg',
  },
}

export function GotchaCallout({
  level,
  title,
  children,
  javaWay,
  goWay,
}: GotchaCalloutProps) {
  const config = levelConfig[level]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4 }}
      className={`my-6 rounded-xl border-l-4 ${config.borderClass} ${config.bgClass} overflow-hidden`}
    >
      <div className="px-5 py-4">
        {/* Title */}
        <div className={`flex items-center gap-2 mb-3 ${config.titleColor} font-semibold text-sm`}>
          <span className="text-lg">{config.icon}</span>
          {title || config.defaultTitle}
        </div>

        {/* Java vs Go comparison */}
        {javaWay && goWay && (
          <div className="space-y-2 mb-3">
            <div className="flex items-start gap-2">
              <span className="text-red-500 font-bold text-sm mt-0.5">✗</span>
              <div>
                <span className="text-xs font-medium text-muted-fg block mb-1">你的本能反应 (Java 方式)：</span>
                <pre className="text-sm font-mono bg-white/30 dark:bg-black/20 rounded-md px-3 py-2 overflow-x-auto">
                  <code>{javaWay}</code>
                </pre>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 font-bold text-sm mt-0.5">✓</span>
              <div>
                <span className="text-xs font-medium text-muted-fg block mb-1">Go 的正确写法：</span>
                <pre className="text-sm font-mono bg-white/30 dark:bg-black/20 rounded-md px-3 py-2 overflow-x-auto">
                  <code>{goWay}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="text-sm leading-relaxed text-foreground/80">
          {children}
        </div>
      </div>
    </motion.div>
  )
}
