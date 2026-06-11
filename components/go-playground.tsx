'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { go } from '@codemirror/lang-go'
import { oneDark } from '@codemirror/theme-one-dark'
import { markExerciseDone } from '@/lib/progress'

interface GoPlaygroundProps {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  description: string
  starterCode: string
  solution: string
  expectedOutput: string
  hints?: string[]
}

const difficultyConfig = {
  easy: { label: '入门', color: 'text-muted-fg', bg: 'bg-muted border border-card-border' },
  medium: { label: '进阶', color: 'text-muted-fg', bg: 'bg-muted border border-card-border' },
  hard: { label: '挑战', color: 'text-foreground font-semibold', bg: 'bg-card border border-card-border' },
  expert: { label: '地狱', color: 'text-foreground font-semibold', bg: 'bg-accent-light border border-accent/20' },
}

export function GoPlayground({
  id,
  title,
  difficulty,
  description,
  starterCode,
  solution,
  expectedOutput,
  hints = [],
}: GoPlaygroundProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const diff = difficultyConfig[difficulty]

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return

    const state = EditorState.create({
      doc: starterCode,
      extensions: [
        basicSetup,
        go(),
        oneDark,
        EditorView.theme({
          '&': { fontSize: '14px', maxHeight: '400px' },
          '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--font-geist-mono), monospace' },
          '.cm-content': { padding: '12px 0' },
        }),
        EditorView.lineWrapping,
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [starterCode])

  const getCode = useCallback(() => {
    return viewRef.current?.state.doc.toString() || starterCode
  }, [starterCode])

  const resetCode = useCallback(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: starterCode },
    })
    setOutput('')
    setIsCorrect(null)
    setShowSolution(false)
    setShowHints(false)
    setCurrentHintIndex(0)
  }, [starterCode])

  const loadSolution = useCallback(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: solution },
    })
    setShowSolution(true)
  }, [solution])

  const runCode = useCallback(async () => {
    setIsRunning(true)
    setOutput('')
    setHasError(false)
    setIsCorrect(null)

    try {
      const res = await fetch('/api/run-go', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: getCode() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setOutput(data.error || '运行失败')
        setHasError(true)
        return
      }

      setOutput(data.output)
      setHasError(data.hasError)

      if (!data.hasError && expectedOutput) {
        const isMatch = data.output.trim() === expectedOutput.trim()
        setIsCorrect(isMatch)
        if (isMatch) {
          markExerciseDone(id)
        }
      }
    } catch {
      setOutput('网络错误，请检查连接后重试')
      setHasError(true)
    } finally {
      setIsRunning(false)
    }
  }, [getCode, expectedOutput, id])

  return (
    <div className="my-8 rounded-md overflow-hidden border border-card-border bg-card">
      {/* Header */}
      <div className="px-5 py-4 border-b border-card-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold flex items-center gap-2">
            {title}
          </h3>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${diff.color} ${diff.bg}`}>
            {diff.label}
          </span>
        </div>
        <p className="text-sm text-muted-fg">{description}</p>
      </div>

      {/* Editor */}
      <div className="border-b border-card-border">
        <div ref={editorRef} className="min-h-[200px]" />
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 border-b border-card-border flex flex-wrap items-center gap-2">
        <button
          onClick={runCode}
          disabled={isRunning}
          className="px-4 py-2 rounded-md text-sm font-medium text-white
                     bg-accent hover:bg-accent-hover
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              编译运行中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              运行
            </>
          )}
        </button>

        <button
          onClick={resetCode}
          className="px-3 py-2 rounded-md text-sm text-muted-fg hover:text-foreground
                     bg-muted hover:bg-accent-light transition-all duration-200
                     flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          重置
        </button>

        {hints.length > 0 && (
          <button
            onClick={() => {
              setShowHints(true)
              setCurrentHintIndex(Math.min(currentHintIndex, hints.length - 1))
            }}
            className="px-3 py-2 rounded-md text-sm text-muted-fg hover:text-foreground
                       bg-muted hover:bg-accent-light transition-all duration-200
                       flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            提示 ({currentHintIndex + 1}/{hints.length})
          </button>
        )}

        <button
          onClick={() => showSolution ? resetCode() : loadSolution()}
          className="px-3 py-2 rounded-md text-sm text-muted-fg hover:text-foreground
                     bg-muted hover:bg-accent-light transition-all duration-200
                     flex items-center gap-1.5 ml-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {showSolution ? '隐藏答案' : '查看答案'}
        </button>
      </div>

      {/* Hints */}
      {showHints && hints.length > 0 && (
        <div className="border-b border-card-border">
          <div className="px-5 py-3 bg-accent-light">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-accent">提示 {currentHintIndex + 1}</span>
              {currentHintIndex < hints.length - 1 && (
                <button
                  onClick={() => setCurrentHintIndex(currentHintIndex + 1)}
                  className="text-xs text-accent hover:underline"
                >
                  下一个提示 →
                </button>
              )}
            </div>
            <p className="text-sm text-muted-fg">{hints[currentHintIndex]}</p>
          </div>
        </div>
      )}

      {/* Output */}
      {(output || isCorrect !== null) && (
        <div className="border-t border-card-border">
          <div className="px-4 py-2.5 text-xs font-medium text-muted-fg bg-muted/50 flex items-center gap-2">
            输出
          </div>
          <pre className={`px-4 py-3 text-sm font-mono overflow-x-auto whitespace-pre-wrap ${
            hasError ? 'text-red-400 bg-danger-bg' : 'bg-code-bg text-gray-300'
          }`}>
            {output || '(无输出)'}
          </pre>

          {/* Result feedback */}
          {isCorrect !== null && (
            <div
              className={`px-4 py-3 flex items-center gap-2 text-sm font-medium ${
                isCorrect
                  ? 'bg-success-bg text-success-fg border-t border-success-border'
                  : 'bg-danger-bg text-danger-fg border-t border-danger-border'
              }`}
            >
              {isCorrect ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  完美！输出匹配预期结果！
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  输出与预期不匹配，预期: <code className="px-1.5 py-0.5 rounded bg-white/10">{expectedOutput}</code>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

