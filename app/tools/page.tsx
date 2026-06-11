'use client'

import { useState } from 'react'

type ActiveTool = 'concurrency' | 'project' | 'escape' | 'benchmarks' | 'gotchas'

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ActiveTool>('concurrency')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-muted-fg font-mono mb-2 block">Interactive Visualizers</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          可视化交互工具
        </h1>
        <p className="text-base text-muted-fg mt-2 max-w-3xl leading-relaxed">
          通过沙盒与动态仿真，具象化地理解 Go 语言的核心心智模型：CSP 并发管道模型、逃逸分析内存状态、物理目录划分、性能跑分以及经典的编译/运行陷阱。
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-card-border mb-8 gap-2">
        {(
          [
            { id: 'concurrency', name: 'CSP 并发模拟器' },
            { id: 'project', name: '工程目录树映射' },
            { id: 'escape', name: '逃逸分析与内存' },
            { id: 'benchmarks', name: '性能基准仪表盘' },
            { id: 'gotchas', name: '避坑挑战沙盒' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTool(tab.id)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer ${
              activeTool === tab.id
                ? 'border-accent text-foreground'
                : 'border-transparent text-muted-fg hover:text-foreground'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tool Container */}
      <div className="bg-card border border-card-border rounded-md p-6 min-h-[500px]">
        {activeTool === 'concurrency' && <ConcurrencyVisualizer />}
        {activeTool === 'project' && <ProjectStructureVisualizer />}
        {activeTool === 'escape' && <EscapeAnalysisVisualizer />}
        {activeTool === 'benchmarks' && <BenchmarksVisualizer />}
        {activeTool === 'gotchas' && <GotchasSandbox />}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// 1. CSP Concurrency Visualizer
// ---------------------------------------------------------------------
function ConcurrencyVisualizer() {
  const [bufferSize, setBufferSize] = useState<0 | 3>(0) // 0 for unbuffered, 3 for buffered
  const [queue, setQueue] = useState<string[]>([])
  const [producerState, setProducerState] = useState<'idle' | 'sending' | 'blocked'>('idle')
  const [consumerState, setConsumerState] = useState<'idle' | 'receiving' | 'blocked'>('idle')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 8)])
  }

  const sendPacket = () => {
    if (bufferSize === 0) {
      setProducerState('sending')
      addLog('Goroutine 1 (发送端) 尝试向无缓冲通道发送消息 "data"')
      
      if (consumerState === 'blocked') {
        setTimeout(() => {
          setQueue(['data'])
          setProducerState('idle')
          setConsumerState('receiving')
          addLog('匹配到接收者，消息瞬时同步交付')
          setTimeout(() => {
            setQueue([])
            setConsumerState('idle')
          }, 800)
        }, 500)
      } else {
        setProducerState('blocked')
        addLog('通道无接收者就绪，发送端 Goroutine 进入阻塞状态')
      }
    } else {
      if (queue.length < bufferSize) {
        setProducerState('sending')
        const nextQueue = [...queue, `data-${queue.length + 1}`]
        addLog(`Goroutine 1 向缓冲通道发送消息 "${nextQueue[nextQueue.length - 1]}"`)
        setTimeout(() => {
          setQueue(nextQueue)
          setProducerState('idle')
          addLog(`缓冲未满 (${nextQueue.length}/3)，消息已入队`)
        }, 600)
      } else {
        setProducerState('blocked')
        addLog('通道缓冲区已满，发送端 Goroutine 阻塞挂起')
      }
    }
  }

  const receivePacket = () => {
    if (bufferSize === 0) {
      setConsumerState('receiving')
      addLog('Goroutine 2 (接收端) 尝试从无缓冲通道读取消息')
      
      if (producerState === 'blocked') {
        setTimeout(() => {
          setQueue([])
          setProducerState('idle')
          setConsumerState('idle')
          addLog('匹配到阻塞的发送端，成功读取并同步唤醒发送端协程')
        }, 500)
      } else {
        setConsumerState('blocked')
        addLog('通道中无就绪数据，接收端 Goroutine 进入阻塞状态')
      }
    } else {
      if (queue.length > 0) {
        setConsumerState('receiving')
        const packet = queue[0]
        addLog(`Goroutine 2 从缓冲通道中读取到 "${packet}"`)
        setTimeout(() => {
          const nextQueue = queue.slice(1)
          setQueue(nextQueue)
          setConsumerState('idle')
          addLog('消息出队，通道剩余槽位已释放')
          if (producerState === 'blocked') {
            setProducerState('idle')
            addLog('检测到阻塞的发送端，缓冲区释放槽位并唤醒发送端协程')
          }
        }, 600)
      } else {
        setConsumerState('blocked')
        addLog('通道缓冲区为空，接收端 Goroutine 阻塞等待')
      }
    }
  }

  const changeBufferSize = (size: 0 | 3) => {
    setBufferSize(size)
    setQueue([])
    setProducerState('idle')
    setConsumerState('idle')
    const time = new Date().toLocaleTimeString()
    setLogs([`[${time}] 切换通道配置：${size === 0 ? '无缓冲通道 (同步)' : '带缓冲通道 (容量 3)'}`])
  }

  return (
    <div className="space-y-6 select-none">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">CSP 并发与 Channel 通道模拟</h3>
        <p className="text-sm text-muted-fg leading-relaxed">
          模拟 Go 语言中生产者协程与消费者协程通过通道 (Channel) 交换数据包的同步行为。注意在无缓冲下通道不存储任何数据，发送与接收必须强同步就绪。
        </p>
      </div>

      <div className="flex gap-4 border border-card-border p-4 rounded-md bg-muted/20">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-fg uppercase tracking-wider">通道配置</span>
          <div className="flex gap-2">
            <button
              onClick={() => changeBufferSize(0)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold border cursor-pointer ${
                bufferSize === 0
                  ? 'bg-accent text-card border-accent'
                  : 'bg-card text-muted-fg border-card-border hover:text-foreground'
              }`}
            >
              无缓冲 (make(chan int))
            </button>
            <button
              onClick={() => changeBufferSize(3)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold border cursor-pointer ${
                bufferSize === 3
                  ? 'bg-accent text-card border-accent'
                  : 'bg-card text-muted-fg border-card-border hover:text-foreground'
              }`}
            >
              有缓冲 (make(chan int, 3))
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] border border-card-border rounded-md p-8 bg-code-bg min-h-[220px] items-center gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs font-mono text-muted-fg">Goroutine 1 (发送端)</div>
          <div
            className={`w-28 h-20 rounded-md border flex flex-col items-center justify-center transition-all ${
              producerState === 'idle'
                ? 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
                : producerState === 'sending'
                ? 'border-indigo-500 bg-indigo-950/20 text-indigo-400'
                : 'border-red-900/80 bg-red-950/15 text-red-500 font-semibold'
            }`}
          >
            <span className="text-sm">{producerState === 'idle' ? '挂起 / 空闲' : producerState === 'sending' ? '发送中' : '阻塞挂起'}</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-1">sender()</span>
          </div>
          <button
            onClick={sendPacket}
            className="px-4 py-2 bg-zinc-800 text-foreground hover:bg-zinc-700 text-xs font-bold border border-zinc-700 rounded-md cursor-pointer transition-all"
          >
            发送数据 chan &lt;-
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-mono text-muted-fg">Channel 管道</div>
          <div className="w-48 h-12 border border-zinc-800 rounded-md flex items-center justify-center gap-1.5 bg-zinc-950 px-2">
            {bufferSize === 0 ? (
              <div className="text-[10px] text-zinc-600 font-semibold tracking-wide">
                {queue.length > 0 ? (
                  <div className="h-7 w-20 rounded bg-indigo-950 border border-indigo-900 text-indigo-400 text-xs flex items-center justify-center font-bold">
                    数据交付中
                  </div>
                ) : (
                  '无缓冲 (零存储)'
                )}
              </div>
            ) : (
              <div className="flex w-full gap-2 justify-center">
                {Array.from({ length: 3 }).map((_, idx) => {
                  const hasData = idx < queue.length
                  return (
                    <div
                      key={idx}
                      className={`h-7 w-12 rounded border flex items-center justify-center transition-all duration-300 text-[10px] font-bold ${
                        hasData
                          ? 'border-indigo-900 bg-indigo-950 text-indigo-400'
                          : 'border-zinc-800 bg-zinc-900/10 text-zinc-700'
                      }`}
                    >
                      {hasData ? '数据' : '空'}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            {bufferSize === 0 ? 'make(chan int)' : `缓冲区: ${queue.length} / 3`}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="text-xs font-mono text-muted-fg">Goroutine 2 (接收端)</div>
          <div
            className={`w-28 h-20 rounded-md border flex flex-col items-center justify-center transition-all ${
              consumerState === 'idle'
                ? 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
                : consumerState === 'receiving'
                ? 'border-indigo-500 bg-indigo-950/20 text-indigo-400'
                : 'border-red-900/80 bg-red-950/15 text-red-500 font-semibold'
            }`}
          >
            <span className="text-sm">{consumerState === 'idle' ? '挂起 / 空闲' : consumerState === 'receiving' ? '读取中' : '阻塞挂起'}</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-1">receiver()</span>
          </div>
          <button
            onClick={receivePacket}
            className="px-4 py-2 bg-zinc-800 text-foreground hover:bg-zinc-700 text-xs font-bold border border-zinc-700 rounded-md cursor-pointer transition-all"
          >
            接收数据 &lt;- chan
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-bold text-muted-fg uppercase tracking-wider">执行日志 (Channel Event Console)</div>
        <div className="border border-card-border rounded-md p-4 bg-zinc-950 font-mono text-xs text-zinc-400 min-h-[160px] flex flex-col gap-1.5 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className={index === 0 ? 'text-foreground font-bold' : ''}>
              {log}
            </div>
          ))}
          {logs.length === 0 && <div className="text-zinc-600 italic">等待操作...</div>}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// 2. ProjectStructureVisualizer
// ---------------------------------------------------------------------
interface DirectoryInfo {
  path: string
  description: string
  goEquivalent?: string
  guideline: string
}

function ProjectStructureVisualizer() {
  const [activeLang, setActiveLang] = useState<'java' | 'go'>('java')
  const [selectedDir, setSelectedDir] = useState<string>('')

  const javaDirs: Record<string, DirectoryInfo> = {
    'pom.xml': {
      path: 'pom.xml',
      description: 'Maven 依赖声明及插件配置文件，定义项目坐标、组件依赖和打包规则。',
      goEquivalent: 'go.mod / go.sum',
      guideline: 'Go 使用 go.mod 进行包依赖的版本描述，不需要 XML 等冗长结构，通过简单的文本声明及依赖下载。',
    },
    'src/main/java': {
      path: 'src/main/java',
      description: 'Java 源代码根路径。所有的包（如 com.company.project）和类文件都从这里层层展开。',
      goEquivalent: 'cmd/ & internal/ & pkg/',
      guideline: 'Go 提倡扁平化的目录管理。可执行入口放 cmd/，核心业务封装放 internal/（包外只读保护）。',
    },
    'src/main/resources': {
      path: 'src/main/resources',
      description: '静态资源及配置文件路径（application.yml, mapper/*.xml）。',
      goEquivalent: 'configs/ & cmd/ 邻近静态目录',
      guideline: 'Go 是编译型单一二进制，静态配置文件通常单独放置于 configs/ 中，并在运行时读取，或通过 go:embed 直接内嵌到二进制中。',
    },
    'com.company.controller': {
      path: 'src/main/java/.../controller',
      description: 'Web 路由及 HTTP 接口定义控制层。',
      goEquivalent: 'internal/handler/ 或 api/',
      guideline: 'Go 中通常在 api/ 或 internal/handler/ 中定义路由解析和参数校验。',
    },
    'com.company.service': {
      path: 'src/main/java/.../service',
      description: '业务逻辑层，习惯使用 Service 接口加 ServiceImpl 实现类的结构。',
      goEquivalent: 'internal/service/',
      guideline: 'Go 不需要为了多态无脑手写 Service 接口，直接提供业务 struct 和方法；只有当包外部需要依赖注入解耦时才定义接口。',
    },
    'com.company.model': {
      path: 'src/main/java/.../model',
      description: '实体层（Entity / DTO / VO），通常带有大量 Lombok 注解。',
      goEquivalent: 'internal/model/',
      guideline: 'Go 使用 struct 表示数据模型，通过 struct tags（如 json:"id" gorm:"primaryKey"）控制序列化与持久化映射。',
    },
  }

  const goDirs: Record<string, DirectoryInfo> = {
    'go.mod': {
      path: 'go.mod',
      description: 'Go Modules 模块依赖配置文件，列出所依赖的第三方包及对应版本。',
      goEquivalent: 'pom.xml',
      guideline: '管理依赖非常简单，执行 go get 命令会自动下载并记录在 go.mod 与版本锁定文件 go.sum 中。',
    },
    'cmd/': {
      path: 'cmd/',
      description: '应用入口目录。通常每个服务有一个独立的子目录（如 cmd/api/main.go），这里不做业务实现，只做对象装配和初始化启动。',
      goEquivalent: 'src/main/java 中的主启动类 Application.java',
      guideline: '在 main.go 中显式连线依赖，注入并运行 Web 服务器，保持入口高度清爽。',
    },
    'internal/': {
      path: 'internal/',
      description: 'Go 特有的私有代码目录。编译器强制限制 internal/ 下的代码只能被其父级包导入，外部项目无法直接 import。',
      goEquivalent: '包私有访问修饰符 (package-private)',
      guideline: '核心业务逻辑、数据库访问层等应妥善封存在 internal/ 里，防止接口污染和意外依赖。',
    },
    'pkg/': {
      path: 'pkg/',
      description: '可导出的公共代码库目录，放置通用的工具包、中间件封装等（非强制）。',
      goEquivalent: 'common 共享 jar 包',
      guideline: '如果你写的内容打算被第三方项目引用，才应该放到 pkg/ 目录，否则一律塞进 internal/ 下。',
    },
    'configs/': {
      path: 'configs/',
      description: '放置配置文件模板、yaml 等资源配置。',
      goEquivalent: 'src/main/resources',
      guideline: '通常在 main 启动时通过 flag 或环境变量读取该目录下的配置并注入配置结构体。',
    },
  }

  const activeDirs = activeLang === 'java' ? javaDirs : goDirs
  const selectedInfo = activeDirs[selectedDir]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">工程目录树映射与设计习惯</h3>
        <p className="text-sm text-muted-fg leading-relaxed">
          对比 Spring Boot 微服务包管理和 Go Modules 标准物理目录结构布局。Go 的限制机制能够有效强制做出清晰的依赖隔离。
        </p>
      </div>

      <div className="flex border-b border-card-border mb-4">
        <button
          onClick={() => {
            setActiveLang('java')
            setSelectedDir('')
          }}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer ${
            activeLang === 'java' ? 'border-accent text-foreground' : 'border-transparent text-muted-fg'
          }`}
        >
          Spring Boot (Maven)
        </button>
        <button
          onClick={() => {
            setActiveLang('go')
            setSelectedDir('')
          }}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer ${
            activeLang === 'go' ? 'border-accent text-foreground' : 'border-transparent text-muted-fg'
          }`}
        >
          Go Modules Layout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Tree */}
        <div className="border border-card-border rounded-md p-5 bg-code-bg font-mono text-sm min-h-[300px] flex flex-col justify-start">
          <span className="text-xs text-zinc-500 mb-3 block"># 点击节点查看工程职责映射</span>
          
          <div className="space-y-2">
            {Object.keys(activeDirs).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedDir(key)}
                className={`w-full text-left px-3 py-1.5 rounded-md transition-all hover:bg-zinc-800/40 cursor-pointer ${
                  selectedDir === key ? 'bg-zinc-800 text-foreground border border-zinc-700' : 'text-muted-fg border border-transparent'
                }`}
              >
                📂 {key}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info Card */}
        <div className="border border-card-border rounded-md p-6 bg-muted/20 flex flex-col justify-between min-h-[300px]">
          {selectedInfo ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-accent font-mono block mb-1">物理路径 / Path</span>
                <span className="text-sm font-semibold font-mono text-foreground">{selectedInfo.path}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-muted-fg block mb-1">职责描述 / Description</span>
                <p className="text-sm text-muted-fg leading-relaxed">{selectedInfo.description}</p>
              </div>
              {selectedInfo.goEquivalent && (
                <div>
                  <span className="text-xs font-bold text-muted-fg block mb-1">平替概念 / Equivalent</span>
                  <span className="text-sm font-mono text-foreground font-semibold">{selectedInfo.goEquivalent}</span>
                </div>
              )}
              <div className="border-t border-card-border/60 pt-3">
                <span className="text-xs font-bold text-foreground block mb-1">迁移指南与思想转换</span>
                <p className="text-xs text-muted-fg leading-relaxed font-mono">{selectedInfo.guideline}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-zinc-500 italic">
              请点击左侧节点查看相应的物理分层职责
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// 3. Escape Analysis Visualizer
// ---------------------------------------------------------------------
function EscapeAnalysisVisualizer() {
  const [allocationType, setAllocationType] = useState<'stack' | 'heap'>('stack')
  const [activeStep, setActiveStep] = useState(1)

  const codeExamples = {
    stack: `// 示例 A：直接返回值。数据分配在栈区
func createUser() User {
    u := User{Name: "Alice"}
    return u // 复制一份副本返回，生命周期结束，安全销毁
}`,
    heap: `// 示例 B：返回局部变量的指针。数据发生逃逸到堆区
func createUser() *User {
    u := User{Name: "Alice"}
    return &u // 指针逃向外部使用，无法在栈底销毁，逃逸至堆
}`,
  }

  const resetStepper = (type: 'stack' | 'heap') => {
    setAllocationType(type)
    setActiveStep(1)
  }

  const stepsInfo = {
    stack: [
      '1. 调用 createUser()：为函数在 STACK 上分配一个栈帧，局部变量 u 被压入栈帧中。',
      '2. 在栈帧中为结构体 u 分配空间并赋初值 {"Name": "Alice"}，状态正常。',
      '3. return u：函数通过寄存器或预留空间复制一份完整的 u 副本返回给调用者。',
      '4. 函数返回，createUser 栈帧瞬间销毁回收。由于没有外部指针引用该空间，内存完美回收。',
    ],
    heap: [
      '1. 调用 createUser()：在 STACK 上分配栈帧。Go 编译器在编译期静态分析发现返回值是一个局部指针 &u。',
      '2. 指针将会逃逸出当前函数栈帧。为了保证安全，Go 逃逸分析将 u 变量的内存分配决定修改为：在 HEAP（堆）上进行分配。',
      '3. return &u：将堆中分配的 u 地址（如 0xc000）复制一份返回给主函数使用。',
      '4. 函数返回，createUser 栈帧销毁。但由于局部变量 u 实际上存放在堆上，它的生命周期继续存在，等待垃圾回收（GC）检测。',
    ],
  }

  const activeSteps = stepsInfo[allocationType]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">逃逸分析与栈堆内存交互仿真</h3>
        <p className="text-sm text-muted-fg leading-relaxed">
          Go 在编译期会静态分析每个变量生命周期。如果发现局部变量的地址逸出到当前函数外部，就会强制将其分配在全局堆中。
        </p>
      </div>

      <div className="flex gap-4 border border-card-border p-4 rounded-md bg-muted/20">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-fg uppercase tracking-wider">选择内存分配场景</span>
          <div className="flex gap-2">
            <button
              onClick={() => resetStepper('stack')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold border cursor-pointer ${
                allocationType === 'stack' ? 'bg-accent text-card border-accent' : 'bg-card text-muted-fg border-card-border'
              }`}
            >
              直接返回值 (栈分配)
            </button>
            <button
              onClick={() => resetStepper('heap')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold border cursor-pointer ${
                allocationType === 'heap' ? 'bg-accent text-card border-accent' : 'bg-card text-muted-fg border-card-border'
              }`}
            >
              返回指针 (堆逃逸)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <pre className="p-4 rounded-md bg-code-bg border border-card-border text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre">
            <code>{codeExamples[allocationType]}</code>
          </pre>
          
          <div className="flex gap-2 justify-between items-center border border-card-border rounded-md p-3 bg-muted/10">
            <button
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded border border-zinc-700 text-foreground cursor-pointer disabled:opacity-35"
            >
              上一步
            </button>
            <span className="text-xs text-muted-fg font-mono">步骤: {activeStep} / 4</span>
            <button
              onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
              disabled={activeStep === 4}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded border border-zinc-700 text-foreground cursor-pointer disabled:opacity-35"
            >
              下一步
            </button>
          </div>
        </div>

        <div className="border border-card-border rounded-md p-5 bg-code-bg flex flex-col justify-between gap-4">
          <div className="text-xs font-mono text-zinc-500 tracking-wider uppercase">内存物理布局 (Physical Memory Simulator)</div>
          
          <div className="grid grid-cols-2 gap-4 flex-1 items-center">
            {/* Stack */}
            <div className="border border-zinc-800 rounded-md p-4 bg-zinc-950/60 min-h-[140px] flex flex-col justify-between relative">
              <span className="text-[10px] font-mono text-zinc-600 font-bold">STACK (栈区)</span>
              
              {activeStep >= 1 && (
                <div className="h-20 border border-zinc-800 rounded bg-zinc-900 flex flex-col justify-center items-center relative">
                  <span className="text-xs font-mono text-zinc-400">createUser() Frame</span>
                  {activeStep === 2 && (
                    <div
                      className={`h-7 w-16 rounded text-[10px] font-bold flex items-center justify-center border ${
                        allocationType === 'stack'
                          ? 'border-emerald-900 bg-emerald-950/80 text-emerald-400'
                          : 'border-red-900 bg-red-950/80 text-red-400'
                      }`}
                    >
                      u User
                    </div>
                  )}
                  {activeStep === 3 && allocationType === 'stack' && (
                    <div className="h-7 w-16 rounded text-[10px] font-bold flex items-center justify-center border border-emerald-950 bg-emerald-950/40 text-emerald-500">
                      u (值拷贝)
                    </div>
                  )}
                </div>
              )}

              <div className="text-[10px] text-zinc-600 font-mono mt-2 text-center">
                {activeStep === 4 ? 'Frame Reclaimed' : '栈帧活跃'}
              </div>
            </div>

            {/* Heap */}
            <div className="border border-zinc-800 rounded-md p-4 bg-zinc-950/60 min-h-[140px] flex flex-col justify-between relative">
              <span className="text-[10px] font-mono text-zinc-600 font-bold">HEAP (堆区)</span>
              
              <div className="flex-1 flex items-center justify-center">
                {activeStep >= 3 && allocationType === 'heap' && (
                  <div className="h-12 w-20 rounded border border-red-900 bg-red-950/80 text-red-400 text-xs flex flex-col items-center justify-center font-bold">
                    <span>u (Escaped)</span>
                    <span className="text-[8px] font-mono text-red-500/80 mt-0.5">Address: 0xc000</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-zinc-600 font-mono mt-2 text-center">
                {activeStep >= 3 && allocationType === 'heap' ? 'GC 跟踪中' : '无逃逸发生'}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-3 text-xs text-zinc-400 font-mono min-h-[44px]">
            {activeSteps[activeStep - 1]}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// 4. BenchmarksVisualizer
// ---------------------------------------------------------------------
interface BenchmarkMetric {
  id: string
  metric: string
  desc: string
  javaVal: number
  goVal: number
  javaLabel: string
  goLabel: string
  higherIsBetter?: boolean
}

function BenchmarksVisualizer() {
  const metrics: BenchmarkMetric[] = [
    {
      id: 'startup',
      metric: '启动耗时 / Startup Time (secs)',
      desc: '冷启动到服务就绪的时间。Spring Boot 需要加载大量的类、反射扫描并注入 Bean；Go 则是单一静态二进制直接加载。',
      javaVal: 5.2,
      goVal: 0.08,
      javaLabel: '5.20 秒',
      goLabel: '0.08 秒',
    },
    {
      id: 'mem_idle',
      metric: '空载内存占用 / Idle RSS Memory (MB)',
      desc: '服务启动后但无任何请求时的内存开销。JVM 运行时、元数据空间等存在基础开销；Go 协程运行时基础开销极低。',
      javaVal: 320,
      goVal: 12,
      javaLabel: '320 MB',
      goLabel: '12 MB',
    },
    {
      id: 'mem_load',
      metric: '高并发负载内存占用 / Under Load RSS Memory (MB)',
      desc: '在 10,000 QPS 下的堆内存开销。Java 线程池线程栈占用大，且 GC 堆容量门槛高；Go 每个 Goroutine 仅 2KB。',
      javaVal: 850,
      goVal: 45,
      javaLabel: '850 MB',
      goLabel: '45 MB',
    },
    {
      id: 'image_size',
      metric: 'Docker 部署镜像体积 / Docker Image Size (MB)',
      desc: '微服务发布时生成的最终容器体积。Java 需要嵌入打包 JRE 运行环境；Go 可以采用 scratch 镜像做纯物理二进制发布。',
      javaVal: 220,
      goVal: 18,
      javaLabel: '220 MB',
      goLabel: '18 MB',
    },
  ]

  const [activeMetricIdx, setActiveMetricIdx] = useState(0)
  const currentMetric = metrics[activeMetricIdx]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">性能跑分与基准对比仪表盘</h3>
        <p className="text-sm text-muted-fg leading-relaxed">
          基于生产环境典型 HTTP CRUD 接口配置在同等硬件配置下的基准性能对比。Go 在降低基础设施物理消耗方面具备绝对优势。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <div className="flex flex-col gap-2">
          {metrics.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setActiveMetricIdx(idx)}
              className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold border cursor-pointer transition-all ${
                activeMetricIdx === idx
                  ? 'bg-accent text-card border-accent'
                  : 'bg-card text-muted-fg border-card-border hover:text-foreground'
              }`}
            >
              {m.metric.split(' / ')[0]}
            </button>
          ))}
        </div>

        <div className="border border-card-border rounded-md p-6 bg-muted/20 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="text-[10px] font-bold text-muted-fg uppercase tracking-wider mb-3">性能跑分 (Real-time Metric Chart)</div>
            <h4 className="text-sm font-bold text-foreground mb-1 font-mono">{currentMetric.metric}</h4>
            <p className="text-xs text-muted-fg leading-relaxed mb-6">{currentMetric.desc}</p>
            
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-fg font-mono">
                  <span>Spring Boot (Java)</span>
                  <span className="font-bold">{currentMetric.javaLabel}</span>
                </div>
                <div className="w-full bg-zinc-800/40 rounded-full h-3.5 overflow-hidden">
                  <div
                    style={{
                      width: currentMetric.higherIsBetter
                        ? `${(currentMetric.javaVal / currentMetric.goVal) * 100}%`
                        : '100%',
                    }}
                    className="h-full bg-zinc-500 rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-foreground font-mono">
                  <span>Gin / GORM (Go)</span>
                  <span className="font-bold">{currentMetric.goLabel}</span>
                </div>
                <div className="w-full bg-zinc-800/40 rounded-full h-3.5 overflow-hidden">
                  <div
                    style={{
                      width: currentMetric.higherIsBetter
                        ? '100%'
                        : `${(currentMetric.goVal / currentMetric.javaVal) * 100}%`,
                    }}
                    className="h-full bg-foreground rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-card-border/40 text-xs text-muted-fg leading-relaxed font-mono">
            <strong>底层机制：</strong>
            {currentMetric.id === 'startup' && 'Go 编译的二进制文件是直接由底层操作系统装载并运行的，没有虚拟机和 JIT 编译启动的暖机时间，内存映射完成后立即开始服务，这对于 Serveless 架构极其关键。'}
            {currentMetric.id === 'mem_idle' && 'Java 基础运行时由于 JVM 运行时所需的类加载器信息（Metaspace）、堆边界申请等，即使空载也有较重底噪；Go 为编译物理代码，运行时除了极小的调度运行时外几乎没有开销。'}
            {currentMetric.id === 'mem_load' && '在海量并发时，Spring 传统的 ThreadPool 阻塞模式需要大量的系统线程堆叠，每个线程占用 1MB~2MB 物理栈空间；Go 仅为协程分配 2KB，并由逻辑调度器复用少量物理线程，大大节省了内存。'}
            {currentMetric.id === 'image_size' && '发布发布时 Java 必须带有一整套 JRE runtime（除非使用 JDK 9 裁剪的 jlink 或 GraalVM 静态编译，但成本高）；Go 二进制没有外部共享依赖，打包进最精简容器中直接能够独立启动执行。'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// 5. GotchasSandbox
// ---------------------------------------------------------------------
interface GotchaQuestion {
  id: string
  title: string
  code: string
  question: string
  options: string[]
  correctIdx: number
  explanation: string
}

function GotchasSandbox() {
  const gotchas: GotchaQuestion[] = [
    {
      id: 'nil_interface',
      title: '1. 带类型的 nil 接口陷阱',
      code: `var err error
var p *MyError = nil
err = p

if err != nil {
    fmt.Println("Error is not nil!")
}`,
      question: '上述代码运行后，if 条件会成立吗？会打印出东西吗？',
      options: [
        'A. 不会成立。因为指针 p 是 nil，赋值后 err 当然也是 nil。',
        'B. 会成立。虽然指针值是 nil，但接口 err 内包含了类型信息 (*MyError)，接口值不等于全局 nil。',
        'C. 编译报错，*MyError 不能直接赋值给 error 接口变量。',
      ],
      correctIdx: 1,
      explanation: 'Go 的接口变量在底层是一个双指针结构 iface (tab 类型元数据, data 数据值)。只有当类型 tab 和数值 data 均为 nil 时，接口 == nil 才成立。当赋值 err = p 后，接口变为了 (*MyError, nil)，它不是 nil！为避免此坑，务必直接返回内置 nil，或强制返回声明类型为 error 的变量。',
    },
    {
      id: 'loop_capture',
      title: '2. 循环变量捕获陷阱 (Go < 1.22)',
      code: `values := []int{1, 2, 3}
for _, v := range values {
    go func() {
        fmt.Print(v, " ")
    }()
}`,
      question: '在 Go 1.21 编译器下，这段代码打印输出最可能是什么？',
      options: [
        'A. 1 2 3 （或者其无序排列，如 3 2 1）',
        'B. 3 3 3 （三个相同的最大值）',
        'C. 编译期 panic 报错',
      ],
      correctIdx: 1,
      explanation: '在 Go 1.22 之前，for range 循环的迭代变量 v 是复用同一个物理内存地址的。在并发 go func 闭包引用时，多个协程极大概率共享了迭代到最后的同一份值 3。为安全起见，需要在循环体内部加上显式的 v := v 重绑定，或直接升级到 Go 1.22+，它默认将每轮循环的变量重新拷贝物理地址分配。',
    },
    {
      id: 'map_concurrent',
      title: '3. Map 并发读写冲突',
      code: `m := make(map[string]int)
go func() { m["a"] = 1 }()
go func() { m["b"] = 2 }()`,
      question: '上述两行协程对同一个 map 进行并发写入操作，会发生什么？',
      options: [
        'A. 正常写完，两个 key 均能写入，但存在概率性的可见性延迟。',
        'B. 编译器会阻塞第二个写入协程，直到第一个协程写完释放内置锁。',
        'C. 直接崩溃：fatal error: concurrent map writes。',
      ],
      correctIdx: 2,
      explanation: 'Go 的原生 map 是没有内置互斥锁保证并发安全访问的。在写写或读写并发时，运行时的哈希写标志位检查会直接触发不可恢复的系统 crash 奔溃，这与 Java 抛出 ConcurrentModificationException 仅做检测不同。并发写需要使用 sync.Mutex 互斥锁包覆，或使用安全型的 sync.Map。',
    },
  ]

  const [currentQ, setCurrentQ] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)

  const activeGotcha = gotchas[currentQ]

  const selectOption = (idx: number) => {
    if (isAnswered) return
    setSelectedOpt(idx)
  }

  const checkAnswer = () => {
    if (selectedOpt === null) return
    setIsAnswered(true)
  }

  const nextQuestion = () => {
    setCurrentQ(prev => (prev + 1) % gotchas.length)
    setSelectedOpt(null)
    setIsAnswered(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">Go 核心机制避坑挑战沙盒</h3>
        <p className="text-sm text-muted-fg leading-relaxed">
          测试你在将 Java 心智模型平稳过渡至 Go 时，是否能绕过那些看似合乎直觉但会导致死锁、内存泄露或崩溃的底层陷阱。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="text-sm font-semibold font-mono text-foreground border-b border-card-border pb-2">
            {activeGotcha.title}
          </div>
          <pre className="p-4 rounded-md bg-code-bg border border-card-border text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre">
            <code>{activeGotcha.code}</code>
          </pre>
        </div>

        <div className="border border-card-border rounded-md p-6 bg-muted/20 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="text-xs font-bold text-muted-fg uppercase tracking-wider mb-2">挑战问题 / Challenge</div>
            <p className="text-sm font-semibold text-foreground mb-4 leading-relaxed">{activeGotcha.question}</p>

            <div className="space-y-2">
              {activeGotcha.options.map((opt, idx) => {
                let btnClass = 'border-card-border bg-card hover:bg-zinc-800/40 text-muted-fg'
                if (selectedOpt === idx) {
                  btnClass = 'border-accent bg-accent/10 text-accent font-semibold'
                }
                if (isAnswered) {
                  if (idx === activeGotcha.correctIdx) {
                    btnClass = 'border-green-500 bg-green-500/10 text-green-500 font-semibold'
                  } else if (selectedOpt === idx) {
                    btnClass = 'border-red-500 bg-red-500/10 text-red-500 font-semibold'
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => selectOption(idx)}
                    disabled={isAnswered}
                    className={`w-full text-left px-4 py-3 border rounded-md text-xs cursor-pointer transition-all ${btnClass}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>

            {isAnswered && (
              <div className="p-4 rounded-md bg-accent-light border border-card-border text-xs leading-relaxed text-muted-fg mt-4">
                <span className="font-bold text-accent">剖析机制：</span> {activeGotcha.explanation}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end mt-6 border-t border-card-border/60 pt-4">
            {!isAnswered ? (
              <button
                onClick={checkAnswer}
                disabled={selectedOpt === null}
                className="px-4 py-2 bg-zinc-800 text-foreground hover:bg-zinc-700 text-xs font-bold border border-zinc-700 rounded-md cursor-pointer disabled:opacity-45 transition-all"
              >
                确定提交
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-4 py-2 bg-zinc-800 text-foreground hover:bg-zinc-700 text-xs font-bold border border-zinc-700 rounded-md cursor-pointer transition-all"
              >
                {currentQ === gotchas.length - 1 ? '重新开始' : '下一题'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}