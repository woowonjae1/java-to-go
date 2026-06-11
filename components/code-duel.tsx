'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Highlight {
  java: string
  go: string
}

export interface OutlineSection {
  name: string
  icon?: string
  javaLine: number
  goLine: number
  description?: string
}

interface CodeDuelProps {
  title: string
  javaCode: string
  goCode: string
  highlights?: Highlight[]
  description?: string
  outline?: OutlineSection[]
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <button
      onClick={copy}
      className="absolute top-3 right-3 px-2.5 py-1.5 rounded-md text-xs
                 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white
                 transition-all duration-200 backdrop-blur-sm
                 flex items-center gap-1.5 z-10 border border-white/5 active:scale-95"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-emerald-400 font-medium">已复制</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          <span>复制</span>
        </>
      )}
    </button>
  )
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeHtmlAttribute(text: string) {
  return escapeHtml(text)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function highlightSyntax(
  code: string,
  language: 'java' | 'go',
  activeHighlight: string | null,
  activeLang: 'java' | 'go' | null,
  highlights: Highlight[]
) {
  const stringTokens: string[] = []
  const commentTokens: string[] = []

  let processed = code

  // 1. Extract block comments
  processed = processed.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    const placeholder = `___BLOCK_COMMENT_TOKEN_${commentTokens.length}___`
    commentTokens.push(match)
    return placeholder
  })

  // 2. Extract line comments
  processed = processed.replace(/\/\/.*$/gm, (match) => {
    const placeholder = `___LINE_COMMENT_TOKEN_${commentTokens.length}___`
    commentTokens.push(match)
    return placeholder
  })

  // 3. Extract double quoted strings
  processed = processed.replace(/"(\\.|[^"\\])*"/g, (match) => {
    const placeholder = `___STR_TOKEN_${stringTokens.length}___`
    stringTokens.push(match)
    return placeholder
  })

  // 4. Extract raw strings for Go (backticks) or single quoted chars for Java
  if (language === 'go') {
    processed = processed.replace(/`[\s\S]*?`/g, (match) => {
      const placeholder = `___STR_TOKEN_${stringTokens.length}___`
      stringTokens.push(match)
      return placeholder
    })
  } else {
    processed = processed.replace(/'(\\.|[^'\\])*'/g, (match) => {
      const placeholder = `___STR_TOKEN_${stringTokens.length}___`
      stringTokens.push(match)
      return placeholder
    })
  }

  // 5. Escape HTML in code code segments
  processed = escapeHtml(processed)

  // 6. Highlight numbers
  processed = processed.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="text-amber-400 font-medium">$1</span>')

  // 7. Highlight annotations (Java only)
  if (language === 'java') {
    processed = processed.replace(/(@\w+)/g, '<span class="text-yellow-500/90 font-medium">$1</span>')
  }

  // 8. Highlight methods/functions (words followed by parenthesis)
  processed = processed.replace(/\b(\w+)(?=\s*\()/g, '<span class="text-sky-400 font-medium">$1</span>')

  // 9. Keywords and Types lists
  const javaKeywords = [
    'public', 'private', 'protected', 'class', 'interface', 'extends', 'implements',
    'static', 'final', 'synchronized', 'volatile', 'try', 'catch', 'throw', 'throws',
    'finally', 'void', 'null', 'new', 'this', 'super', 'instanceof', 'override',
    'var', 'return', 'package', 'import', 'if', 'else', 'for', 'while', 'switch',
    'case', 'default', 'break', 'continue'
  ]

  const goKeywords = [
    'func', 'struct', 'const', 'iota', 'package', 'import', 'defer', 'nil',
    'chan', 'go', 'select', 'range', 'type', 'map', 'interface', 'return',
    'var', 'if', 'else', 'for', 'switch', 'case', 'default', 'break',
    'continue', 'goto'
  ]

  const javaTypes = [
    'String', 'Integer', 'int', 'long', 'Long', 'double', 'Double', 'boolean',
    'Boolean', 'Object', 'Thread', 'Runnable', 'ExecutorService', 'Future',
    'BlockingQueue', 'Lock', 'ArrayList', 'HashMap', 'List', 'Set', 'Iterator',
    'System', 'Math', 'Exception', 'RuntimeException', 'CompletableFuture'
  ]

  const goTypes = [
    'string', 'int', 'int64', 'float64', 'bool', 'any', 'error', 'rune',
    'byte', 'uint8', 'WaitGroup', 'Mutex', 'RWMutex', 'Context', 'Ordered'
  ]

  const keywordsList = language === 'java' ? javaKeywords : goKeywords
  const typesList = language === 'java' ? javaTypes : goTypes

  // 10. Highlight mapped keywords (interactive)
  const mappedJava = highlights.map((h) => h.java)
  const mappedGo = highlights.map((h) => h.go)
  const mappedList = language === 'java' ? mappedJava : mappedGo

  mappedList.forEach((kw) => {
    // Break up any punctuation and match exact keywords
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regexStr = /^\w+$/.test(kw) ? `\\b${escaped}\\b` : escaped
    const regex = new RegExp(regexStr, 'g')
    const escapedKeyword = escapeHtmlAttribute(kw)

    const isCurrentlyActive = activeLang !== null && activeLang !== language && activeHighlight === kw

    processed = processed.replace(regex, (match) => {
      return `<span class="keyword-highlight cursor-pointer font-bold ${
        isCurrentlyActive ? 'keyword-highlight-active' : ''
      }" data-keyword="${escapedKeyword}" data-lang="${language}">${match}</span>`
    })
  })

  // 11. Highlight standard keywords
  keywordsList.forEach((kw) => {
    const regex = new RegExp(`\\b(${kw})\\b(?!([^<]*>))`, 'g')
    processed = processed.replace(regex, '<span class="text-pink-400 font-semibold">$1</span>')
  })

  // 12. Highlight standard types
  typesList.forEach((type) => {
    const regex = new RegExp(`\\b(${type})\\b(?!([^<]*>))`, 'g')
    processed = processed.replace(regex, '<span class="text-teal-400 font-medium">$1</span>')
  })

  // 13. Restore strings & comments
  stringTokens.forEach((str, i) => {
    const placeholder = `___STR_TOKEN_${i}___`
    const highlighted = `<span class="text-emerald-400 font-normal">${escapeHtml(str)}</span>`
    processed = processed.replace(placeholder, highlighted)
  })

  commentTokens.forEach((com, i) => {
    const linePlaceholder = `___LINE_COMMENT_TOKEN_${i}___`
    const blockPlaceholder = `___BLOCK_COMMENT_TOKEN_${i}___`
    const highlighted = `<span class="text-zinc-500 italic">${escapeHtml(com)}</span>`
    processed = processed.replace(linePlaceholder, highlighted)
    processed = processed.replace(blockPlaceholder, highlighted)
  })

  return processed
}

export function CodeDuel({ title, javaCode, goCode, highlights = [], description, outline = [] }: CodeDuelProps) {
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null)
  const [activeLang, setActiveLang] = useState<'java' | 'go' | null>(null)
  const [syncEnabled, setSyncEnabled] = useState(true)
  const [activeMobileTab, setActiveMobileTab] = useState<'java' | 'go'>('java')
  
  const javaLines = javaCode.split('\n')
  const goLines = goCode.split('\n')
  const isLongCode = javaLines.length > 18 || goLines.length > 18
  
  const [isExpanded, setIsExpanded] = useState(!isLongCode)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeOutlineIdx, setActiveOutlineIdx] = useState<number | null>(null)
  const [javaHighlightLine, setJavaHighlightLine] = useState<number | null>(null)
  const [goHighlightLine, setGoHighlightLine] = useState<number | null>(null)

  // Hover states for line numbers & lines
  const [hoveredLine, setHoveredLine] = useState<number | null>(null)
  const [hoveredPanel, setHoveredPanel] = useState<'java' | 'go' | null>(null)

  // Block body scroll when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  const handleOutlineClick = (sec: OutlineSection, idx: number) => {
    setActiveOutlineIdx(idx)
    setIsExpanded(true)

    setTimeout(() => {
      // Find element globally in page or modal
      const javaEl = document.querySelector(`.line-container-${sec.javaLine}`) as HTMLElement
      const goEl = document.querySelector(`.line-container-${sec.goLine}`) as HTMLElement

      if (isFullscreen) {
        if (javaScrollRef.current && javaEl) {
          setJavaHighlightLine(sec.javaLine)
          javaScrollRef.current.scrollTo({
            top: javaEl.offsetTop - 16,
            behavior: 'smooth'
          })
        }

        if (goScrollRef.current && goEl) {
          setGoHighlightLine(sec.goLine)
          goScrollRef.current.scrollTo({
            top: goEl.offsetTop - 16,
            behavior: 'smooth'
          })
        }
      } else {
        if (javaEl) {
          setJavaHighlightLine(sec.javaLine)
          setGoHighlightLine(sec.goLine)
          
          javaEl.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }
      }
    }, 120)

    setTimeout(() => {
      setJavaHighlightLine(null)
      setGoHighlightLine(null)
    }, 2500)
  }

  const containerRef = useRef<HTMLDivElement>(null)
  const javaScrollRef = useRef<HTMLDivElement>(null)
  const goScrollRef = useRef<HTMLDivElement>(null)
  const activeScrollPanel = useRef<'java' | 'go' | null>(null)

  // Double scroll sync
  const handleScroll = (source: 'java' | 'go') => {
    if (!syncEnabled) return
    if (activeScrollPanel.current !== source) return

    const sourceRef = source === 'java' ? javaScrollRef.current : goScrollRef.current
    const targetRef = source === 'java' ? goScrollRef.current : javaScrollRef.current

    if (sourceRef && targetRef) {
      targetRef.scrollTop = sourceRef.scrollTop
      targetRef.scrollLeft = sourceRef.scrollLeft
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement
      if (!target.classList.contains('keyword-highlight')) return
      const keyword = target.dataset.keyword || ''
      const lang = target.dataset.lang as 'java' | 'go'
      setActiveLang(lang)

      const pair = highlights.find(
        (h) => (lang === 'java' ? h.java : h.go) === keyword
      )
      if (pair) {
        setActiveHighlight(lang === 'java' ? pair.go : pair.java)
      }
    }

    const handleMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement
      if (!target.classList.contains('keyword-highlight')) return
      setActiveHighlight(null)
      setActiveLang(null)
    }

    container.addEventListener('mouseenter', handleMouseEnter, true)
    container.addEventListener('mouseleave', handleMouseLeave, true)

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter, true)
      container.removeEventListener('mouseleave', handleMouseLeave, true)
    }
  }, [highlights])

  const javaHtml = highlightSyntax(
    javaCode,
    'java',
    activeLang === 'go' ? activeHighlight : null,
    activeLang,
    highlights
  )
  const goHtml = highlightSyntax(
    goCode,
    'go',
    activeLang === 'java' ? activeHighlight : null,
    activeLang,
    highlights
  )

  const javaHtmlLines = javaHtml.split('\n')
  const goHtmlLines = goHtml.split('\n')

  const renderPanel = (lang: 'java' | 'go', isFullscreenView: boolean) => {
    const isJava = lang === 'java'
    const code = isJava ? javaCode : goCode
    const htmlLines = isJava ? javaHtmlLines : goHtmlLines
    const lines = isJava ? javaLines : goLines
    const highlightLine = isJava ? javaHighlightLine : goHighlightLine
    const scrollRef = isJava ? javaScrollRef : goScrollRef
    const logo = isJava ? '☕' : '🐹'
    const titleText = isJava ? 'Java' : 'Go'
    const fileLabel = isJava ? 'source.java' : 'main.go'
    const panelBg = isJava ? 'bg-java-bg' : 'bg-go-bg'
    const panelText = isJava ? 'text-java' : 'text-go'
    const borderCol = isJava ? 'border-java-border/30' : 'border-go-border/30'
    const isTabActive = activeMobileTab === lang

    // Collapsed settings
    const isCollapsed = !isExpanded && !isFullscreenView && lines.length > 18
    const maxLinesToShow = 15

    return (
      <div
        className={`relative flex flex-col overflow-hidden ${
          isFullscreenView ? 'h-full' : 'h-auto'
        } ${isTabActive ? 'block' : 'hidden lg:flex'}`}
        onMouseEnter={() => {
          activeScrollPanel.current = lang
        }}
      >
        {/* Header decor */}
        <div className={`flex items-center justify-between px-4 py-2 ${panelBg} border-b ${borderCol}`}>
          <div className="flex items-center gap-1.5">
            <span className="text-base">{logo}</span>
            <span className={`text-xs font-bold ${panelText}`}>{titleText}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">{fileLabel}</span>
        </div>

        <div className="relative flex-1 flex overflow-hidden bg-code-bg h-full">
          <CopyButton text={code} />
          <div
            ref={scrollRef}
            onScroll={() => handleScroll(lang)}
            className={`relative w-full p-4 flex flex-col font-mono text-sm leading-relaxed ${
              isFullscreenView
                ? 'overflow-auto h-[calc(100vh-100px)]'
                : isExpanded
                ? 'overflow-visible h-auto max-h-none'
                : 'overflow-hidden max-h-[380px]'
            }`}
          >
            {htmlLines.map((lineHtml, i) => {
              const lineNum = i + 1
              
              if (isCollapsed && lineNum > maxLinesToShow) {
                return null
              }

              const isFlashing = highlightLine === lineNum
              const isHovered = hoveredLine === lineNum && hoveredPanel === lang

              return (
                <div
                  key={i}
                  onMouseEnter={() => {
                    setHoveredLine(lineNum)
                    setHoveredPanel(lang)
                  }}
                  onMouseLeave={() => {
                    setHoveredLine(null)
                    setHoveredPanel(null)
                  }}
                  className={`line-container-${lineNum} flex items-start py-0.5 px-2 -mx-2 rounded transition-all duration-200 relative z-10 code-line-container ${
                    isFlashing ? 'bg-accent/20 border-l-4 border-accent pl-1' : ''
                  } ${isHovered ? 'code-line-hover-active' : ''}`}
                >
                  {/* Line Number */}
                  <div
                    className={`w-8 shrink-0 text-right pr-3 border-r select-none font-mono text-xs leading-[1.75rem] transition-colors duration-200 ${
                      isFlashing
                        ? 'text-accent border-accent/40 font-bold'
                        : isHovered
                        ? 'text-accent border-accent/30 font-bold'
                        : 'text-zinc-600 border-zinc-800'
                    }`}
                  >
                    {lineNum}
                  </div>
                  {/* Code text */}
                  <pre className="flex-1 pl-3 font-mono text-sm text-zinc-300 select-text leading-[1.75rem] code-pre-wrapped">
                    <code dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }} />
                  </pre>
                </div>
              )
            })}
          </div>

          {/* Bottom fade overlay when collapsed and code is long */}
          {isCollapsed && (
            <div
              onClick={() => setIsExpanded(true)}
              className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--code-bg)] via-[var(--code-bg)]/95 to-transparent cursor-pointer flex items-end justify-center pb-4 hover:via-[var(--code-bg)] transition-all z-20"
              title="点击展开完整代码"
            >
              <span className="text-[11px] font-semibold text-accent bg-accent-light/95 border border-accent/20 px-3.5 py-2 rounded-full shadow-md backdrop-blur-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5">
                <span>展开完整代码 (共 {lines.length} 行)</span>
                <svg className="w-3.5 h-3.5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="my-8 rounded-md overflow-hidden border border-card-border bg-card shadow-[var(--shadow-md)]"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-card-border flex items-center justify-between flex-wrap gap-3 bg-card-bg/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {/* macOS window buttons decor */}
          <div className="flex gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
          </div>
          <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 text-foreground/95">
            {title}
          </h3>
          {description && (
            <span className="text-xs text-muted-fg hidden md:block">| {description}</span>
          )}
        </div>

        {/* Sync Controls & Expand Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Fullscreen view trigger */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-2.5 py-1.5 rounded-md border border-card-border text-muted-fg hover:text-foreground hover:bg-muted-hover font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            title="全屏对比代码"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5 5" />
            </svg>
            <span>全屏对比</span>
          </button>

          {isLongCode && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`px-2.5 py-1.5 rounded-md border font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer
                ${isExpanded
                  ? 'bg-accent-light border-accent/20 text-accent hover:bg-accent-light/80'
                  : 'bg-muted border-card-border text-muted-fg hover:text-foreground hover:bg-muted-hover'}`}
              title={isExpanded ? "收起完整代码" : "展开完整代码"}
            >
              {isExpanded ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                  <span>收起代码</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>展开代码</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setSyncEnabled(!syncEnabled)}
            className={`hidden lg:flex px-2.5 py-1.5 rounded-md border font-semibold transition-all duration-200 items-center gap-1 cursor-pointer
              ${syncEnabled
                ? 'bg-accent-light border-accent/20 text-accent hover:bg-accent-light/80'
                : 'bg-muted border-card-border text-muted-fg hover:text-foreground hover:bg-muted-hover'}`}
            title="同步滚动双侧代码"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>同步滚动: {syncEnabled ? '开' : '关'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Outline Stepper */}
      {outline && outline.length > 0 && (
        <div className="flex md:hidden border-b border-card-border bg-muted/10 p-2 overflow-x-auto gap-2 items-center">
          <span className="text-[9px] font-bold text-muted-fg uppercase shrink-0 px-1 border border-card-border rounded bg-muted/20">大纲</span>
          {outline.map((sec, idx) => {
            const isActive = activeOutlineIdx === idx
            return (
              <button
                key={idx}
                onClick={() => handleOutlineClick(sec, idx)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap cursor-pointer transition-all flex items-center gap-1
                  ${isActive 
                    ? 'bg-accent text-white shadow-sm font-semibold' 
                    : 'bg-muted border border-card-border text-muted-fg hover:text-foreground'}`}
              >
                <span>{sec.icon || '📍'}</span>
                <span>{sec.name}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Mobile Tab Selectors */}
      <div className="flex lg:hidden border-b border-card-border bg-muted/40 p-1">
        <button
          onClick={() => setActiveMobileTab('java')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5
            ${activeMobileTab === 'java'
              ? 'bg-card text-java shadow-sm border border-card-border'
              : 'text-muted-fg'}`}
        >
          <span>☕ Java</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-java-bg text-java/80 border border-java-border/30">
            {javaLines.length} 行
          </span>
        </button>
        <button
          onClick={() => setActiveMobileTab('go')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5
            ${activeMobileTab === 'go'
              ? 'bg-card text-go shadow-sm border border-card-border'
              : 'text-muted-fg'}`}
        >
          <span>🐹 Go</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-go-bg text-go/80 border border-go-border/30">
            {goLines.length} 行
          </span>
        </button>
      </div>

      {/* Wrapper flex for Desktop Sidebar and Code Grid */}
      <div className="flex divide-x divide-card-border bg-code-bg">
        {/* Desktop Outline Sidebar */}
        {outline && outline.length > 0 && (
          <div className="hidden md:flex w-52 shrink-0 bg-muted/5 p-3 flex-col border-r border-card-border justify-between select-none">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-fg font-extrabold mb-3 flex items-center gap-1">
                <span>🗺️ 代码分层大纲</span>
              </div>
              <div className="space-y-1.5">
                {outline.map((sec, idx) => {
                  const isActive = activeOutlineIdx === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOutlineClick(sec, idx)}
                      className={`w-full text-left px-2.5 py-2.5 rounded-md text-xs transition-all flex flex-col gap-0.5 cursor-pointer border
                        ${isActive 
                          ? 'bg-accent/15 border-accent/30 text-accent font-semibold shadow-sm' 
                          : 'border-transparent text-muted-fg hover:bg-muted/50 hover:text-foreground'}`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="text-sm">{sec.icon || '📍'}</span>
                        <span>{sec.name}</span>
                      </span>
                      {sec.description && (
                        <span className="text-[10px] opacity-75 font-normal leading-normal truncate max-w-[170px]">
                          {sec.description}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="pt-3 border-t border-card-border/40 text-[9px] text-muted-fg flex items-center gap-1">
              <span>💡 点击节点自动滚屏比对</span>
            </div>
          </div>
        )}

        {/* Code Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-card-border">
          {/* Java panel */}
          {renderPanel('java', false)}

          {/* Go panel */}
          {renderPanel('go', false)}
        </div>
      </div>

      {/* Collapse button at the bottom when expanded */}
      {isExpanded && isLongCode && (
        <div className="flex justify-center py-2.5 bg-muted/20 border-t border-card-border">
          <button
            onClick={() => setIsExpanded(false)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold
                       bg-muted hover:bg-muted-hover text-muted-fg border border-card-border
                       transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            <span>收起代码折叠</span>
          </button>
        </div>
      )}

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden font-sans select-none">
          {/* Fullscreen Header */}
          <div className="px-6 py-4 border-b border-card-border flex items-center justify-between bg-card">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              </div>
              <h2 className="text-base font-bold flex items-center gap-2">
                {title} <span className="text-xs text-muted-fg font-normal">| 双轨全屏比对模式</span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSyncEnabled(!syncEnabled)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer
                  ${syncEnabled
                    ? 'bg-accent-light border-accent/20 text-accent hover:bg-accent-light/80'
                    : 'bg-muted border-card-border text-muted-fg hover:text-foreground hover:bg-muted-hover'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>同步滚动: {syncEnabled ? '开' : '关'}</span>
              </button>

              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/25 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>退出全屏</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="flex-1 flex divide-x divide-card-border bg-code-bg overflow-hidden">
            {outline && outline.length > 0 && (
              <div className="hidden md:flex w-60 shrink-0 bg-card p-4 flex-col justify-between select-none overflow-y-auto border-r border-card-border">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-fg font-extrabold mb-4 flex items-center gap-1">
                    <span>🗺️ 代码分层大纲</span>
                  </div>
                  <div className="space-y-1.5">
                    {outline.map((sec, idx) => {
                      const isActive = activeOutlineIdx === idx
                      return (
                        <button
                          key={idx}
                          onClick={() => handleOutlineClick(sec, idx)}
                          className={`w-full text-left px-3 py-3 rounded-md text-xs transition-all flex flex-col gap-1 cursor-pointer border
                            ${isActive 
                              ? 'bg-accent/15 border-accent/30 text-accent font-semibold shadow-sm' 
                              : 'border-transparent text-muted-fg hover:bg-muted/50 hover:text-foreground'}`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="text-sm">{sec.icon || '📍'}</span>
                            <span>{sec.name}</span>
                          </span>
                          {sec.description && (
                            <span className="text-[10px] opacity-75 font-normal leading-normal whitespace-pre-wrap">
                              {sec.description}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-card-border/40 text-[10px] text-muted-fg flex items-center gap-1">
                  <span>💡 点击节点自动滚屏比对</span>
                </div>
              </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-card-border overflow-hidden">
              {renderPanel('java', true)}
              {renderPanel('go', true)}
            </div>
          </div>
        </div>
      )}

      {/* Hint bar */}
      {highlights.length > 0 && (
        <div className="px-4 py-2.5 bg-accent-light text-[11px] text-accent border-t border-card-border
                        flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>悬停代码中的亮色关键词，可跨栏高亮 Java ↔ Go 对应词汇</span>
          </div>
          <span className="hidden lg:block text-[10px] text-muted-fg font-mono">💡 悬停代码行可高亮显示对应的行号及背景</span>
        </div>
      )}
    </motion.div>
  )
}
