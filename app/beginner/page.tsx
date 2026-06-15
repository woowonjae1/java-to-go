'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

// ——— 思维转变卡片数据 ———
const mindShifts = [
  {
    icon: '📦',
    java: '包装类 Integer / Long',
    go: '直接用 int / int64',
    tip: 'Go 没有基础类型和包装类的区分，int 本身就是"一等公民"，不用担心装箱/拆箱。',
  },
  {
    icon: '🚫',
    java: 'try-catch 捕获异常',
    go: 'if err != nil 显式检查',
    tip: 'Go 把错误当成普通返回值。函数会同时返回结果和错误，你需要在调用处立刻判断。',
  },
  {
    icon: '🧬',
    java: 'class + extends 继承树',
    go: 'struct + interface 组合',
    tip: 'Go 没有继承。用"组合"替代：把小模块像乐高一样拼在一起，关系更清晰。',
  },
  {
    icon: '⚡',
    java: 'Thread + synchronized 多线程',
    go: 'goroutine + channel 协程',
    tip: 'goroutine 比 Thread 轻得多，启动一个只需写 go。channel 像管道一样安全传递数据。',
  },
  {
    icon: '🔓',
    java: 'public / private / protected',
    go: '首字母大写 = 公开，小写 = 包内私有',
    tip: '不需要写修饰符关键字。AccountService 公开，accountService 包私有，就这么简单。',
  },
  {
    icon: '🏗️',
    java: '@Autowired Spring 自动注入',
    go: '构造函数手动传入依赖',
    tip: 'Go 没有运行时反射容器。依赖关系在 main() 里手动连线，一眼看清，便于单元测试。',
  },
]

// ——— 学习路线步骤 ———
const roadmap = [
  {
    step: 1,
    emoji: '🌱',
    title: '基础篇',
    subtitle: 'Types & Variables',
    desc: '零值、指针、字符串 UTF-8、切片与 Map',
    href: '/chapters/basics',
    duration: '约 45 min',
    tags: ['零值', '指针 *&', '[]string', 'map'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    step: 2,
    emoji: '🧩',
    title: '结构篇',
    subtitle: 'OOP → Composition',
    desc: '用 struct 和接口替代继承，鸭子类型解耦',
    href: '/chapters/oop',
    duration: '约 60 min',
    tags: ['struct', 'interface', '嵌入', '包可见性'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    step: 3,
    emoji: '🚨',
    title: '异常篇',
    subtitle: 'try-catch → error',
    desc: '错误是普通值，defer 替代 finally',
    href: '/chapters/errors',
    duration: '约 45 min',
    tags: ['if err != nil', 'defer', 'errors.Is', 'panic'],
    color: 'from-orange-500 to-red-500',
  },
  {
    step: 4,
    emoji: '⚡',
    title: '并发篇',
    subtitle: 'Threads → Goroutines',
    desc: 'goroutine 超轻量并发，channel 安全通信',
    href: '/chapters/concurrency',
    duration: '约 60 min',
    tags: ['goroutine', 'channel', 'WaitGroup', 'context'],
    color: 'from-green-500 to-emerald-500',
  },
  {
    step: 5,
    emoji: '🌐',
    title: 'Web 篇',
    subtitle: 'Spring → Gin',
    desc: 'Gin 路由、中间件、JSON 绑定与校验',
    href: '/chapters/web',
    duration: '约 60 min',
    tags: ['Gin', '路由', '中间件', 'ShouldBind'],
    color: 'from-rose-500 to-red-500',
  },
]

// ——— 快速对比速查 ———
const quickCompare = [
  { concept: '打印输出', java: 'System.out.println("hi")', go: 'fmt.Println("hi")' },
  { concept: '变量声明', java: 'String name = "Go";', go: 'name := "Go"' },
  { concept: '定义函数', java: 'public int add(int a, int b)', go: 'func add(a, b int) int' },
  { concept: '实例化对象', java: 'User u = new User();', go: 'u := User{}' },
  { concept: 'for 循环', java: 'for (int i=0; i<10; i++)', go: 'for i := 0; i < 10; i++' },
  { concept: '空值判断', java: 'if (obj == null)', go: 'if obj == nil' },
  { concept: '错误处理', java: 'try { } catch (e) { }', go: 'val, err := fn(); if err != nil { }' },
  { concept: '并发启动', java: 'new Thread(task).start()', go: 'go task()' },
]

export default function BeginnerPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-green-500/10 text-green-400 text-sm font-medium mb-8
                          border border-green-500/20">
            <span className="text-base">🐹</span>
            专为「有 Java 基础的 Go 新手」定制
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            欢迎踏上{' '}
            <span className="gradient-text">Go 语言</span>
            <br />
            <span className="text-foreground/80 text-2xl sm:text-3xl md:text-4xl font-bold">
              的第一步 👋
            </span>
          </h1>

          <p className="text-lg text-muted-fg max-w-2xl mx-auto mb-8 leading-relaxed">
            你已经懂 Java，这是巨大的优势。Go 的很多概念跟 Java 相似——
            只是更简洁、更直接。本指南帮你<strong className="text-foreground">快速建立 Go 的思维模型</strong>，
            而不是从零开始。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chapters/basics"
              className="px-7 py-3 rounded-md text-white font-semibold
                         bg-gradient-to-r from-green-500 to-emerald-500
                         hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]
                         transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              直接开始学习
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/java-vs-go"
              className="px-7 py-3 rounded-md font-semibold border border-card-border
                         hover:bg-muted transition-all duration-300 flex items-center gap-2 text-sm"
            >
              📋 Java vs Go 速查表
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 为什么 Go ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 rounded-md bg-card border border-card-border"
        >
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
            🤔 我已经会 Java 了，为什么还要学 Go？
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: '🚀',
                title: '编译快、启动快',
                desc: 'Go 程序直接编译为原生二进制，启动时间是毫秒级。告别 JVM 预热的漫长等待。',
              },
              {
                icon: '🧠',
                title: '语法极简，专注业务',
                desc: '没有注解魔法、没有泛型复杂约束（1.18 之前）、没有继承链。代码量减少 30-50%。',
              },
              {
                icon: '💡',
                title: '并发是一等公民',
                desc: '用 go 关键字一行启动协程，Channel 像管道一样传数据，不需要 synchronized 大法。',
              },
            ].map((f) => (
              <div key={f.title} className="flex flex-col gap-2">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-fg leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 思维转变 ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-14">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl font-bold mb-2"
        >
          🔄 从 Java 切换到 Go，需要转变 6 个思维
        </motion.h2>
        <p className="text-muted-fg text-sm mb-8">
          这是最容易「踩坑」的地方，先建立直觉，再深入细节。
        </p>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {mindShifts.map((ms) => (
            <motion.div
              key={ms.title}
              variants={item}
              className="p-5 rounded-md bg-card border border-card-border
                         hover:border-accent/30 hover:shadow-[var(--shadow-glow)]
                         transition-all duration-300 group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {ms.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[11px] font-mono border border-red-500/20">
                      ☕ {ms.java}
                    </span>
                    <span className="text-muted-fg text-xs">→</span>
                    <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[11px] font-mono border border-green-500/20">
                      🐹 {ms.go}
                    </span>
                  </div>
                  <p className="text-xs text-muted-fg leading-relaxed">{ms.tip}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── 快速语法对比 ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 rounded-md bg-card border border-card-border"
        >
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            ⚡ 30 秒语法速查：Java 翻译成 Go
          </h2>
          <p className="text-xs text-muted-fg mb-5">你最常用的 Java 写法，在 Go 里怎么写</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-2 pb-3 font-semibold text-muted-fg w-1/5 font-sans">概念</th>
                  <th className="text-left py-2 pb-3 font-semibold text-red-400 w-2/5">☕ Java</th>
                  <th className="text-left py-2 pb-3 font-semibold text-green-400 w-2/5">🐹 Go</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/40">
                {quickCompare.map((row) => (
                  <tr key={row.concept} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-sans font-medium text-muted-fg text-[11px]">{row.concept}</td>
                    <td className="py-2.5 text-red-300/80">{row.java}</td>
                    <td className="py-2.5 text-green-300">{row.go}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <Link
              href="/java-vs-go"
              className="text-xs text-accent hover:underline"
            >
              查看完整速查表 →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 推荐学习路线 ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl font-bold mb-2"
        >
          🗺️ 推荐学习路线（先学这 5 章）
        </motion.h2>
        <p className="text-muted-fg text-sm mb-8">
          每章都有 Java vs Go 代码对照、在线练习题和知识测验，按顺序学效果最好。
        </p>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col gap-4"
        >
          {roadmap.map((ch) => (
            <motion.div key={ch.step} variants={item}>
              <Link
                href={ch.href as Route}
                className="flex items-start gap-4 p-5 rounded-md bg-card border border-card-border
                           hover:border-accent/30 hover:shadow-[var(--shadow-lg)]
                           transition-all duration-300 group"
              >
                {/* Step number */}
                <div className={`w-12 h-12 rounded-md bg-gradient-to-br ${ch.color}
                                 flex items-center justify-center shrink-0 text-white font-bold text-lg
                                 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  {ch.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <span className="text-xs text-muted-fg font-mono">Step {ch.step}</span>
                    <h3 className="font-bold group-hover:text-accent transition-colors">
                      {ch.title} — {ch.subtitle}
                    </h3>
                    <span className="text-xs text-muted-fg ml-auto">{ch.duration}</span>
                  </div>
                  <p className="text-sm text-muted-fg mb-3">{ch.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ch.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-muted text-[11px] font-mono text-muted-fg"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <svg
                  className="w-4 h-4 text-muted-fg group-hover:text-accent group-hover:translate-x-1
                             transition-all duration-300 shrink-0 self-center"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
      {/* ── 外部参考资源 ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 rounded-md bg-card border border-card-border"
        >
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            📚 推荐外部资源
          </h2>
          <p className="text-sm text-muted-fg mb-5 leading-relaxed">
            我们的指南侧重于从 Java 到 Go 的<strong>思维转变与实战避坑</strong>。如果你想从零开始，系统地过一遍 Go 语言的每一个基础语法点，强烈建议搭配以下教程食用：
          </p>
          <a
            href="https://www.runoob.com/go/go-tutorial.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-md border border-card-border hover:border-accent/50 hover:bg-muted/50 transition-all group"
          >
            <div className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-300">
              📖
            </div>
            <div>
              <h3 className="font-semibold group-hover:text-accent transition-colors">
                菜鸟教程：Go 语言教程
              </h3>
              <p className="text-xs text-muted-fg mt-1">
                非常详尽的基础语法词典，适合新手查漏补缺，随时作为案头手册参考。
              </p>
            </div>
          </a>
        </motion.div>
      </section>

      {/* ── 底部 CTA ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-md bg-gradient-to-br from-accent/10 to-go/10
                     border border-accent/20 text-center"
        >
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold mb-3">准备好了吗？</h2>
          <p className="text-muted-fg mb-6 max-w-md mx-auto text-sm leading-relaxed">
            每章都配有可以直接运行的在线练习。不需要安装任何东西，打开浏览器就能写代码。
          </p>
          <Link
            href="/chapters/basics"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md
                       text-white font-semibold bg-gradient-to-r from-accent to-go
                       hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]
                       transition-all duration-300 hover:scale-105"
          >
            从第一章开始
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
