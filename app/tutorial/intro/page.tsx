import { GoPlayground } from '@/components/go-playground'
import Link from 'next/link'

export const metadata = {
  title: 'Go 简介 - 基础语法手册',
}

export default function TutorialIntroPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <div className="mb-8 border-b border-card-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">1. Go 简介</h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          了解 Go 语言的背景、特点，并编写你的第一个 Hello World 程序。
        </p>
      </div>

      <h2>什么是 Go？</h2>
      <p>
        Go（又称 Golang）是 Google 开发的一种静态强类型、编译型、并发型，并具有垃圾回收功能的编程语言。
        它被设计用来解决大型复杂系统下的开发效率问题，融合了 C 语言的运行效率和 Python 语言的开发效率。
      </p>

      <h3>主要特性</h3>
      <ul>
        <li><strong>极简语法</strong>：没有多余的继承链和样板代码。</li>
        <li><strong>极速编译</strong>：瞬间完成编译，启动快，无虚拟机预热。</li>
        <li><strong>天生并发</strong>：语言层面支持 goroutine，处理高并发轻而易举。</li>
        <li><strong>强大的标准库</strong>：内置 Web 服务器、加密、JSON 处理等。</li>
      </ul>

      <h2>第一个 Go 程序</h2>
      <p>
        废话不多说，让我们看看一个最简单的 Go 程序长什么样。在下面的代码框中，点击 <strong>Run</strong> 按钮即可直接运行代码：
      </p>

      <div className="my-8">
        <GoPlayground
          id="tutorial-hello-world"
          title="Hello World"
          difficulty="easy"
          description="尝试修改双引号内的文本，然后再次点击 Run 看看效果。"
          starterCode={`package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}`}
          expectedOutput="Hello, World!"
        />
      </div>

      <p>
        在后续章节中，我们将详细拆解这几行代码到底意味着什么。
      </p>

      {/* Navigation */}
      <div className="flex justify-end items-center mt-12 pt-8 border-t border-card-border">
        <Link href="/tutorial/structure" className="text-sm font-medium text-accent hover:text-accent-light transition-colors flex items-center gap-1">
          下一节：Go 语言结构 →
        </Link>
      </div>
    </article>
  )
}
