'use client'

import { motion } from 'framer-motion'
import { getChapterProgress, getTotalProgress } from '@/lib/progress'
import { chapters } from '@/lib/data'
import { ChapterIcon, chapterColorMap } from '@/components/chapter-icon'
import { useClientMounted } from '@/lib/use-client-mounted'

export function ProgressTracker() {
  const mounted = useClientMounted()

  if (!mounted) return null

  const total = getTotalProgress()
  const chapterProgress = Object.fromEntries(
    chapters.map((chapter) => [chapter.id, getChapterProgress(chapter.id)])
  )

  return (
    <div className="space-y-3">
      {/* Total progress */}
      <div className="flex items-center gap-3 mb-1">
        <span className="text-sm font-medium text-muted-fg">总进度</span>
        <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${total}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-accent to-go"
          />
        </div>
        <span className="text-sm font-bold text-accent">{total}%</span>
      </div>

      {/* Per-chapter progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {chapters.map((ch) => {
          const p = chapterProgress[ch.id] || 0
          const colors = chapterColorMap[ch.id] || { gradient: 'from-accent to-go', text: 'text-foreground', bg: 'bg-muted' }
          return (
            <div
              key={ch.id}
              className="p-3 rounded-xl bg-muted/50 border border-card-border"
            >
              <div className="flex items-center gap-2 mb-2 min-w-0">
                <span className={`${colors.text} shrink-0`}>
                  <ChapterIcon id={ch.id} className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold truncate">{ch.title}</span>
              </div>
              <div className="bg-muted rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                  className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                />
              </div>
              <span className="text-[10px] text-muted-fg mt-1 block">{p}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
