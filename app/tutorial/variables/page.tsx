import { GoPlayground } from '@/components/go-playground'
import Link from 'next/link'

export const metadata = {
  title: 'Go 变量与常量 - 基础语法手册',
}

export default function TutorialVariablesPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <div className="mb-8 border-b border-card-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">4. Go 变量与常量</h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          掌握 var 和 := 声明语法，以及零值 (Zero Value) 的重要概念。
        </p>
      </div>

      <h2>声明变量</h2>
      <p>
        Go 语言变量名由字母、数字、下划线组成，其中首个字符不能为数字。
        声明变量的一般形式是使用 <code>var</code> 关键字：
      </p>
      <pre><code>{`var identifier type`}</code></pre>
      <p>你可以一次声明多个变量：</pre>
      <pre><code>{`var identifier1, identifier2 type`}</code></pre>

      <h3>1. 指定变量类型，但没有初始化</h3>
      <p>
        如果没有初始化变量，Go 编译器会自动为其赋予 <strong>零值 (Zero Value)</strong>。这是 Go 非常重要的一个特性。
      </p>
      <ul>
        <li>数值类型（包括 complex64/128）的零值为 <code>0</code></li>
        <li>布尔类型的零值为 <code>false</code></li>
        <li>字符串的零值为 <code>""</code>（空字符串）</li>
        <li>以下几种类型的零值为 <code>nil</code>：<br/>
          <code>var a *int</code><br/>
          <code>var a []int</code><br/>
          <code>var a map[string]int</code><br/>
          <code>var a chan int</code><br/>
          <code>var a func(string) int</code><br/>
          <code>var a error</code>
        </li>
      </ul>

      <h3>2. 根据值自行判定变量类型</h3>
      <p>你可以省略类型声明，编译器会根据右侧的值自动推导类型：</p>
      <pre><code>{`var d = true  // d 自动推导为 bool 类型`}</code></pre>

      <h3>3. 简短声明语法 :=</h3>
      <p>
        如果在<strong>函数内部</strong>，你可以省略 <code>var</code> 关键字，直接使用 <code>:=</code> 符号来声明并初始化变量：
      </p>
      <pre><code>{`f := "Runoob" // 等价于 var f string = "Runoob"`}</code></pre>
      <div className="bg-muted p-4 rounded-md my-4 text-sm border-l-4 border-red-500">
        <strong>⚠️ 注意：</strong> <code>:=</code> 结构不能在函数体外使用（全局变量必须使用 <code>var</code> 声明）。
      </div>

      <h2>多变量声明</h2>
      <p>
        你可以像这样同时声明和赋值多个变量：
      </p>
      <pre><code>{`var a, b, c int = 1, 2, 3
var e, f = 123, "hello" // 自动推导
g, h := 123, "hello"    // 简短声明`}</code></pre>

      <h2>常量</h2>
      <p>
        常量是一个简单值的标识符，在程序运行时，不会被修改的量。常量中的数据类型只可以是布尔型、数字型（整数型、浮点型和复数）和字符串型。
      </p>
      <pre><code>{`const identifier [type] = value
const b string = "abc"
const b = "abc" // 类型推导`}</code></pre>

      <h3>iota 特殊常量</h3>
      <p>
        <code>iota</code> 是 Go 语言的常量计数器，只能在常量的表达式中使用。在 const 关键字出现时将被重置为 0，每新增一行常量声明将使 iota 计数一次。可以把它看作自动递增的枚举值。
      </p>
      <pre><code>{`const (
    a = iota  // 0
    b = iota  // 1
    c = iota  // 2
)`}</code></pre>

      <div className="my-8">
        <GoPlayground
          id="tutorial-variables"
          title="练习：变量声明与类型推导"
          difficulty="easy"
          description="尝试运行以下代码，观察零值和 := 简短声明的效果。"
          starterCode={`package main\n\nimport "fmt"\n\nvar globalVar = "我是全局变量"\n\nfunc main() {\n\tvar i int\n\tvar f float64\n\tvar b bool\n\tvar s string\n\t\n\tfmt.Printf("零值: %v %v %v %q\\n", i, f, b, s)\n\n\ta, b_str := 10, "hello"\n\tfmt.Println(a, b_str)\n}`}
          expectedOutput="零值: 0 0 false &quot;&quot;\n10 hello"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-card-border">
        <Link href="/tutorial/syntax" className="text-sm text-muted-fg hover:text-foreground transition-colors flex items-center gap-1">
          ← 上一节：Go 基础语法
        </Link>
        <Link href="/tutorial/types" className="text-sm font-medium text-accent hover:text-accent-light transition-colors flex items-center gap-1">
          下一节：Go 数据类型 →
        </Link>
      </div>
    </article>
  )
}
