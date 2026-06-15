import Link from 'next/link'

export const metadata = {
  title: 'Go 基础语法 - 基础语法手册',
}

export default function TutorialSyntaxPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <div className="mb-8 border-b border-card-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">3. Go 基础语法</h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          学习 Go 的词法元素：行分隔符、标识符、关键字与可见性规则。
        </p>
      </div>

      <h2>行分隔符</h2>
      <p>
        在 Go 程序中，一行代表一个语句结束。每个语句不需要像 C 家族语言或 Java 那样以分号 <code>;</code> 结尾，因为这些工作都将由 Go 编译器自动完成。
      </p>
      <p>
        如果你打算将多个语句写在同一行，它们则必须使用 <code>;</code> 人为区分。但在实际开发中我们并不鼓励这种做法。
      </p>

      <h2>标识符</h2>
      <p>
        标识符用来命名变量、类型等程序实体。一个标识符实际上就是一个或是多个字母 (A~Z 和 a~z) 数字 (0~9)、下划线 <code>_</code> 组成的序列，但是第一个字符必须是字母或下划线而不能是数字。
      </p>
      <div className="bg-muted p-4 rounded-md my-4 font-mono text-sm">
        <div className="text-green-500 mb-2">✅ 有效的标识符：</div>
        mahesh, kumar, abc, move_name, a_123, myname50, _temp
        
        <div className="text-red-500 mt-4 mb-2">❌ 无效的标识符：</div>
        1ab（以数字开头）<br/>
        case（Go 的关键字）<br/>
        a+b（运算符是不允许的）
      </div>

      <h2>字符串连接</h2>
      <p>
        Go 语言的字符串连接可以通过 <code>+</code> 实现：
      </p>
      <pre><code>{`fmt.Println("Google" + "Runoob")`}</code></pre>

      <h2>可见性规则（首字母大小写）</h2>
      <p>
        Go 语言中有一个非常独特的设计：<strong>通过标识符首字母的大小写来控制可见性（封装性）</strong>。
        它完全抛弃了 <code>public</code>, <code>private</code>, <code>protected</code> 等访问控制关键字。
      </p>
      <ul>
        <li>
          <strong>大写字母开头</strong>的标识符（如 <code>User</code>, <code>Calculate</code>, <code>Age</code>）会被导出，这意味着它们是公开的（Public），可以被其他包的代码导入和使用。
        </li>
        <li>
          <strong>小写字母开头</strong>的标识符（如 <code>user</code>, <code>calculate</code>, <code>age</code>）是未导出的，这意味着它们是包级私有的（Private），只有定义它们的那个包内部可以访问。
        </li>
      </ul>

      <div className="bg-muted p-4 rounded-md my-6 text-sm border-l-4 border-accent">
        <strong>💡 Java 对比：</strong> 想写 private 变量？在 Go 里直接首字母小写即可。想提供 public 方法？在 Go 里直接首字母大写即可。简单粗暴。
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-card-border">
        <Link href="/tutorial/structure" className="text-sm text-muted-fg hover:text-foreground transition-colors flex items-center gap-1">
          ← 上一节：Go 语言结构
        </Link>
        <Link href="/tutorial/variables" className="text-sm font-medium text-accent hover:text-accent-light transition-colors flex items-center gap-1">
          下一节：Go 变量与常量 →
        </Link>
      </div>
    </article>
  )
}
