'use client'

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
    defaultTitle: 'Java 肌肉记忆警告',
    borderClass: 'border-l-2 border-card-border bg-muted/40',
    titleColor: 'text-foreground',
  },
  danger: {
    defaultTitle: '致命陷阱',
    borderClass: 'border-l-2 border-card-border bg-muted/40',
    titleColor: 'text-foreground',
  },
  tip: {
    defaultTitle: 'Go 最佳实践',
    borderClass: 'border-l-2 border-card-border bg-muted/40',
    titleColor: 'text-foreground',
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
    <div
      className={`my-6 rounded-md border ${config.borderClass} overflow-hidden`}
    >
      <div className="px-5 py-4">
        {/* Title */}
        <div className={`mb-3 ${config.titleColor} font-bold text-sm`}>
          {title || config.defaultTitle}
        </div>

        {/* Java vs Go comparison */}
        {javaWay && goWay && (
          <div className="space-y-2.5 mb-3.5">
            <div className="flex items-start gap-2">
              <span className="text-muted-fg font-bold text-sm mt-0.5">✗</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-muted-fg block mb-1">Java 惯用思路：</span>
                <pre className="text-xs font-mono bg-muted rounded-md px-3 py-2 overflow-x-auto text-muted-fg">
                  <code>{javaWay}</code>
                </pre>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-foreground font-bold text-sm mt-0.5">✓</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-foreground block mb-1">Go 正确表达：</span>
                <pre className="text-xs font-mono bg-muted border border-card-border rounded-md px-3 py-2 overflow-x-auto text-foreground">
                  <code>{goWay}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="text-sm leading-relaxed text-muted-fg">
          {children}
        </div>
      </div>
    </div>
  )
}
