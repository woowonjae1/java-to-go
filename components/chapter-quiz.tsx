'use client'

import { useState } from 'react'
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
      <div className="my-8 rounded-md border border-card-border bg-card p-8 text-center">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 border ${
          passed ? 'bg-success-bg text-success-fg border-success-border' : 'bg-danger-bg text-danger-fg border-danger-border'
        }`}>
          {passed ? '已通过' : '未通过'}
        </div>
        <h3 className="text-xl font-bold mb-2">
          {passed ? '测验通过' : '测验未通过'}
        </h3>
        <p className="text-muted-fg mb-4">
          得分：{finalScore}/{questions.length}
        </p>
        <div className="w-full bg-muted rounded-full h-3 mb-6 overflow-hidden">
          <div
            style={{ width: `${(finalScore / questions.length) * 100}%` }}
            className={`h-full rounded-full transition-all duration-500 ${passed ? 'bg-green-500' : 'bg-orange-500'}`}
          />
        </div>
        {!passed && (
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 rounded-md bg-accent text-white font-medium
                       hover:bg-accent-hover transition-colors"
          >
            再试一次
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="my-8 rounded-md border border-card-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-card-border flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2">
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
        <div>
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
                  className={`w-full text-left px-4 py-3 rounded-md border text-sm
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
          {checked && (
            <div className="mt-4 p-4 rounded-md bg-accent-light text-sm leading-relaxed">
              <span className="font-semibold text-accent">解析：</span>{' '}
              <span className="text-foreground/85">{q.explanation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-card-border flex justify-end gap-3">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            className="px-5 py-2 rounded-md text-sm font-medium text-white
                       bg-accent hover:bg-accent-hover disabled:opacity-40
                       disabled:cursor-not-allowed transition-all duration-200"
          >
            检查答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-md text-sm font-medium text-white
                       bg-accent hover:bg-accent-hover transition-all duration-200
                       flex items-center gap-1.5"
          >
            {currentQ < questions.length - 1 ? '下一题 →' : '查看结果'}
          </button>
        )}
      </div>
    </div>
  )
}

