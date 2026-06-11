'use client'

import { getChapterProgress, getTotalProgress } from '@/lib/progress'
import { chapters } from '@/lib/data'
import { useClientMounted } from '@/lib/use-client-mounted'

export function ProgressTracker() {
  const mounted = useClientMounted()

  if (!mounted) return null

  const total = getTotalProgress()
  const chapterProgress = Object.fromEntries(
    chapters.map((chapter) => [chapter.id, getChapterProgress(chapter.id)])
  )

  return (
    <div className="space-y-4">
      {/* Total progress */}
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs font-semibold text-muted-fg">全局学习进度</span>
          <span className="text-xs font-bold text-foreground">{total}%</span>
        </div>
        <div className="bg-muted rounded h-1.5 overflow-hidden">
          <div
            style={{ width: `${total}%` }}
            className="h-full rounded bg-foreground transition-all duration-500"
          />
        </div>
      </div>

      {/* Per-chapter progress */}
      <div className="grid grid-cols-2 gap-2">
        {chapters.filter(ch => ch.id !== 'project').map((ch) => {
          const p = chapterProgress[ch.id] || 0
          return (
            <div
              key={ch.id}
              className="p-2 rounded border border-card-border bg-card/50"
            >
              <div className="text-[10px] font-medium truncate mb-1 text-muted-fg">{ch.title}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded h-1 overflow-hidden">
                  <div
                    style={{ width: `${p}%` }}
                    className="h-full rounded bg-muted-fg/60 transition-all duration-500"
                  />
                </div>
                <span className="text-[9px] font-mono text-muted-fg font-semibold shrink-0">{p}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
