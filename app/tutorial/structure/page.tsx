import { GoPlayground } from '@/components/go-playground'
import Link from 'next/link'

export const metadata = {
  title: 'Go 语言结构 - 基础语法手册',
}

export default function TutorialStructurePage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <div className="mb-8 border-b border-card-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">2. Go 语言结构</h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          深入理解 Go 程序的基本骨架：包、导入与函数声明。
        </p>
      </div>

      <h2>拆解 Hello World</h2>
      <p>
        在上一节中我们写了第一个程序。它的结构包含了 Go 语言程序的最基本组成部分：
      </p>
      <ul>
        <li>包声明 (Package Declaration)</li>
        <li>引入包 (Import Packages)</li>
        <li>函数 (Functions)</li>
        <li>变量与语句 (Variables, Statements & Expressions)</li>
      </ul>

      <h3>1. Package 声明</h3>
      <p>
        第一行代码 <code>package main</code> 定义了包名。你必须在源文件中非注释的第一行指明这个文件属于哪个包。
        只有名为 <code>main</code> 的包才可以被编译为可执行文件。
      </p>

      <h3>2. 导入包</h3>
      <p>
        <code>import "fmt"</code> 告诉 Go 编译器这个程序需要使用 <code>fmt</code> 包中的函数。
        <code>fmt</code> 包包含了格式化 I/O 的函数，类似于 Java 中的 <code>System.out</code> 或 C 中的 <code>printf</code>。
      </p>

      <h3>3. 主函数</h3>
      <p>
        <code>func main()</code> 是程序开始执行的入口函数。注意，<code>main</code> 函数没有任何参数，也没有返回值。
        它所在的包必须是 <code>main</code>。
      </p>

      <div className="bg-muted p-4 rounded-md my-6 text-sm border-l-4 border-accent">
        <strong>💡 Java 对比：</strong> 在 Java 中程序的入口是 <code>public static void main(String[] args)</code>，而且必须包裹在一个类里。
        Go 抛弃了类的包裹，入口直接定义在包级别，且启动参数被放在 <code>os.Args</code> 中，而不是作为 main 的参数。
      </div>

      <h3>4. 代码执行与注释</h3>
      <p>
        <code>fmt.Println("Hello, World!")</code> 用于向控制台打印输出。
      </p>
      <p>
        在 Go 中，注释的写法与 C/C++/Java 相同：
      </p>
      <pre><code>{`// 这是一个单行注释
/*
  这是一个
  多行注释
*/`}</code></pre>

      <div className="my-8">
        <GoPlayground
          id="tutorial-structure"
          title="练习：修复缺少的部分"
          difficulty="easy"
          description="这段代码缺少了包声明和导入，请补全它们让代码成功运行。"
          starterCode={`// TODO 1: 声明 main 包\n\n// TODO 2: 导入 fmt 包\n\nfunc main() {\n\tfmt.Println("代码结构正确！")\n}`}
          expectedOutput="代码结构正确！"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-card-border">
        <Link href="/tutorial/intro" className="text-sm text-muted-fg hover:text-foreground transition-colors flex items-center gap-1">
          ← 上一节：Go 简介
        </Link>
        <Link href="/tutorial/syntax" className="text-sm font-medium text-accent hover:text-accent-light transition-colors flex items-center gap-1">
          下一节：Go 基础语法 →
        </Link>
      </div>
    </article>
  )
}
