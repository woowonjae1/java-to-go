'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { markQuizDone } from '@/lib/progress'

interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface ChapterQuizProps {
  id: string
  title: string
  questions: QuizQuestion[]
}

export function ChapterQuiz({ id, title, questions }: ChapterQuizProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const q = questions[currentQ]

  const handleCheck = () => {
    if (selected === null) return
    setChecked(true)
    if (selected === q.correctIndex) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setSelected(null)
      setChecked(false)
    } else {
      setFinished(true)
      if (score + (selected === q.correctIndex ? 1 : 0) >= questions.length * 0.6) {
        markQuizDone(id)
      }
    }
  }

  const handleRetry = () => {
    setCurrentQ(0)
    setSelected(null)
    setChecked(false)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    const finalScore = score
    const passed = finalScore >= questions.length * 0.6
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-8 rounded-2xl border border-card-border bg-card shadow-[var(--shadow-md)] p-8 text-center"
      >
        <div className="text-5xl mb-4">{passed ? '🎉' : '💪'}</div>
        <h3 className="text-xl font-bold mb-2">
          {passed ? '恭喜通过！' : '再接再厉！'}
        </h3>
        <p className="text-muted-fg mb-4">
          得分：{finalScore}/{questions.length}
        </p>
        <div className="w-full bg-muted rounded-full h-3 mb-6 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(finalScore / questions.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${passed ? 'bg-green-500' : 'bg-orange-500'}`}
          />
        </div>
        {!passed && (
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 rounded-lg bg-accent text-white font-medium
                       hover:bg-accent-hover transition-colors"
          >
            再试一次
          </button>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="my-8 rounded-2xl border border-card-border bg-card shadow-[var(--shadow-md)] overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-card-border flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <span className="text-lg">📝</span>
          {title}
        </h3>
        <span className="text-xs text-muted-fg">
          {currentQ + 1}/{questions.length}
        </span>
      </div>

      {/* Progress dots */}
      <div className="px-5 py-3 flex gap-1.5 border-b border-card-border">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < currentQ ? 'bg-accent' : i === currentQ ? 'bg-accent/50' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm font-medium mb-4 leading-relaxed">{q.question}</p>

            <div className="space-y-2.5">
              {q.options.map((option, i) => {
                let optionClass = 'border-card-border bg-muted/30 hover:bg-muted'
                if (checked) {
                  if (i === q.correctIndex) {
                    optionClass = 'border-green-500 bg-success-bg'
                  } else if (i === selected) {
                    optionClass = 'border-red-500 bg-danger-bg'
                  }
                } else if (i === selected) {
                  optionClass = 'border-accent bg-accent-light'
                }

                return (
                  <button
                    key={i}
                    onClick={() => !checked && setSelected(i)}
                    disabled={checked}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm
                               transition-all duration-200 flex items-center gap-3
                               ${optionClass}
                               ${!checked ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
                                     flex-shrink-0 ${
                                       checked && i === q.correctIndex
                                         ? 'border-green-500 text-green-500'
                                         : checked && i === selected
                                         ? 'border-red-500 text-red-500'
                                         : i === selected
                                         ? 'border-accent text-accent bg-accent/10'
                                         : 'border-muted-fg/30 text-muted-fg'
                                     }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{option}</span>
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {checked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 rounded-xl bg-accent-light text-sm leading-relaxed"
                >
                  <span className="font-medium text-accent">💬 解析：</span>{' '}
                  <span className="text-foreground/80">{q.explanation}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-card-border flex justify-end gap-3">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white
                       bg-accent hover:bg-accent-hover disabled:opacity-40
                       disabled:cursor-not-allowed transition-all duration-200"
          >
            检查答案 ✓
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white
                       bg-accent hover:bg-accent-hover transition-all duration-200
                       flex items-center gap-1.5"
          >
            {currentQ < questions.length - 1 ? '下一题 →' : '查看结果'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
