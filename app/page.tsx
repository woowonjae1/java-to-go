'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { motion } from 'framer-motion'
import { chapters } from '@/lib/data'
import { ProgressTracker } from '@/components/progress-tracker'
import { ChapterIcon, chapterColorMap } from '@/components/chapter-icon'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-go/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-java/3 rounded-full blur-[150px]" />
      </div>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                       bg-accent-light text-accent text-sm font-medium mb-8
                       border border-accent/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            为 Java 程序员量身打造的 Go 学习之路
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="gradient-text">Java → Go</span>
            <br />
            <span className="text-foreground/90 text-3xl sm:text-4xl md:text-5xl font-bold">
              交互式学习平台
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-fg max-w-2xl mx-auto mb-10 leading-relaxed">
            不只是代码对比——<strong className="text-foreground">思维模型转换</strong>、
            <strong className="text-foreground">在线实操练习</strong>、
            <strong className="text-foreground">避坑指南</strong>，
            帮你从 Java 到 Go 的无缝切换。
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chapters/basics"
              className="px-8 py-3.5 rounded-md text-white font-semibold text-base
                         bg-gradient-to-r from-accent to-go
                         hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]
                         transition-all duration-300 transform hover:scale-105
                         flex items-center gap-2"
            >
              开始学习
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/beginner"
              className="px-8 py-3.5 rounded-md font-semibold text-base
                         bg-green-500/10 hover:bg-green-500/20 border border-green-500/30
                         text-green-400 hover:text-green-300
                         transition-all duration-300 flex items-center gap-2"
            >
              🐹 我是 Go 新手
            </Link>
            <a
              href="https://github.com/woowonjae1/java-to-go"
              className="px-8 py-3.5 rounded-md font-semibold text-base
                         bg-muted hover:bg-accent-light border border-card-border
                         transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16"
        >
          {[
            { icon: '⚔️', title: '双轨对比', desc: 'Java vs Go 代码并排，关键词联动高亮' },
            { icon: '🧠', title: '思维转换', desc: '动画展示 OOP → 组合 范式转移' },
            { icon: '🏗️', title: '在线实操', desc: '内嵌 Go Playground，写完即跑' },
          ].map((f, i) => (
            <div
              key={i}
              className="p-5 rounded-md bg-card border border-card-border
                         hover:shadow-[var(--shadow-glow)] transition-all duration-300
                         hover:border-accent/30 group"
            >
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </span>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-fg">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Progress Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-6 rounded-md bg-card border border-card-border"
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            📊 学习进度
          </h2>
          <ProgressTracker />
        </motion.div>
      </section>

      {/* Go Proverbs Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 rounded-md bg-card border border-card-border shadow-[var(--shadow-sm)]"
        >
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            💡 Gopher 核心信条 (Go Proverbs)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                proverb: "Clear is better than clever.",
                trans: "清晰胜过聪明。",
                javaVsGo: "Java 崇尚注解、反射、Spring 运行时动态代理等‘聪明’魔法；Go 拒绝魔法，极力推推代码的显式声明和确定性，宁可写繁复代码也绝不搞隐式暗门。"
              },
              {
                proverb: "Don't communicate by sharing memory; share memory by communicating.",
                trans: "不要通过共享内存来通信，而要通过通信来共享内存。",
                javaVsGo: "Java 习惯用 synchronized / Lock 控制多线程对堆中同一对象的读写竞争；Go 提倡 CSP 模型，使用通道 (Channel) 像传送带一样进行数据所有权的移交。"
              },
              {
                proverb: "The bigger the interface, the weaker the abstraction.",
                trans: "接口越大，抽象越弱。",
                javaVsGo: "Java 习惯定义庞大的接口规范（如包含十几个方法的 UserService）；Go 提倡单方法小接口（如 Reader/Writer），利用隐式实现的鸭子类型拼装多态。"
              },
              {
                proverb: "Errors are values.",
                trans: "错误是普通的值。",
                javaVsGo: "Java 用异常中断整个调用流，依赖异常冒泡逃逸拦截；Go 把错误视为函数返回的普通数据对象，迫使程序员在调用处第一时间直面和处理失败。"
              },
              {
                proverb: "A little copying is better than a little dependency.",
                trans: "少量的复制好过少量的依赖。",
                javaVsGo: "Java Maven 极其庞大且允许极其复杂的深层嵌套导入包；Go 对编译期有极高的洁癖，宁可手工复制少量通用工具方法，也绝不为了一个小功能去拉入沉重的第三方包。"
              },
              {
                proverb: "Design the architecture, don't just code.",
                trans: "设计架构，而非堆砌代码。",
                javaVsGo: "Java 的类继承让父子类型紧密耦合；Go 强制解耦，只保留嵌入（Embedding）的横向字段提升，迫使 gopher 使用松耦合的隐式接口进行高层次架构设计。"
              }
            ].map((p, idx) => (
              <div
                key={idx}
                className="p-4 rounded-md bg-muted/40 hover:bg-muted/80 hover:shadow-md border border-card-border hover:border-accent/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="text-accent font-mono text-xs font-semibold mb-1">Proverb #{idx + 1}</div>
                  <div className="font-bold text-sm font-sans tracking-tight text-foreground/90 leading-snug">“{p.proverb}”</div>
                  <div className="text-xs font-medium text-muted-fg mt-1 mb-3">—— {p.trans}</div>
                </div>
                <div className="text-[11px] text-muted-fg leading-relaxed border-t border-card-border/40 pt-2.5 mt-2">
                  <strong className="text-foreground/80">Java ↔ Go：</strong>{p.javaVsGo}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Beginner Track Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4
                     p-5 rounded-md border border-green-500/25 bg-green-500/5
                     hover:border-green-500/40 hover:bg-green-500/8 transition-all duration-300"
        >
          <div className="text-4xl shrink-0">🐹</div>
          <div className="flex-1">
            <h3 className="font-bold text-green-300 mb-1">第一次学 Go？从这里开始</h3>
            <p className="text-sm text-muted-fg leading-relaxed">
              专为有 Java 基础的 Go 新手设计的入门引导——思维转变总结、语法速查对照表、推荐学习路线，帮你少走弯路。
            </p>
          </div>
          <Link
            href="/beginner"
            className="shrink-0 px-5 py-2.5 rounded-md text-sm font-semibold
                       bg-green-500/15 hover:bg-green-500/25 border border-green-500/30
                       text-green-300 hover:text-green-200 transition-all duration-300
                       flex items-center gap-1.5 whitespace-nowrap"
          >
            查看入门指南
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </section>

      {/* Chapter Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl font-bold mb-8 text-center"
        >
          学习路线
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {chapters.map((ch, index) => (
            <motion.div key={ch.id} variants={item}>
              <Link
                href={`/chapters/${ch.id}` as Route}
                className="block p-6 rounded-md bg-card border border-card-border
                           hover:shadow-[var(--shadow-lg)] hover:border-accent/30
                           transition-all duration-300 group h-full"
              >
                <div className="flex items-start gap-4">
                  {(() => {
                    const colors = chapterColorMap[ch.id] || { bg: 'bg-muted', text: 'text-foreground', border: 'border-transparent' }
                    return (
                      <div className={`w-14 h-14 rounded-md ${colors.bg} ${colors.text} ${colors.border} border
                                       flex items-center justify-center flex-shrink-0
                                       group-hover:scale-110 transition-transform duration-300
                                       shadow-md`}>
                        <ChapterIcon id={ch.id} className="w-7 h-7" />
                      </div>
                    )
                  })()}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-fg font-mono">Chapter {index + 1}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-accent transition-colors">
                      {ch.title} — {ch.titleEn}
                    </h3>
                    <p className="text-sm text-muted-fg leading-relaxed mb-3">{ch.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {ch.sections.map((sec) => (
                        <span
                          key={sec.id}
                          className="px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-fg"
                        >
                          {sec.javaConcept} → {sec.goConcept}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}
