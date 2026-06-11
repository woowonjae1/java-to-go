'use client'

import { useState } from 'react'

interface FAQ {
  id: string
  category: string
  q: string
  a: React.ReactNode
}

const faqs: FAQ[] = [
  {
    id: 'generics-erasure',
    category: '类型系统',
    q: 'Java 的泛型擦除和 Go 1.18 的真泛型有什么本质区别？',
    a: (
      <>
        <p>
          Java 泛型是<strong>编译期语法糖</strong>：编译后类型参数被擦除，运行时 <code>List&lt;String&gt;</code> 和{' '}
          <code>List&lt;Integer&gt;</code> 都是 <code>List</code>。所以你无法 <code>new T[]</code>，也不能{' '}
          <code>obj instanceof List&lt;String&gt;</code>。
        </p>
        <p>
          Go 1.18 的泛型在编译期对每组类型参数做<strong>实例化（部分用 GCShape 字典共享）</strong>，运行时类型信息完整保留。
          代价是：Go 泛型<strong>不支持类型参数上的方法</strong>（不能定义 <code>func (s Stack[T]) ...</code> 之外的泛型方法），
          也没有协变/逆变。实战建议：<strong>能用接口解决就别上泛型</strong>，泛型主要服务于容器和算法这类“对元素类型无所谓”的场景。
        </p>
      </>
    ),
  },
  {
    id: 'no-constructor',
    category: '面向对象',
    q: 'Go 没有构造函数，如何保证对象创建时的字段校验和不变量？',
    a: (
      <>
        <p>
          三步组合拳：<strong>① 私有字段</strong>（小写命名，包外不可直接构造）；
          <strong>② 提供 <code>NewXxx</code> 工厂函数</strong>承担校验，返回 <code>(*T, error)</code>；
          <strong>③ 必要时用 functional options 模式</strong>处理可选参数。
        </p>
        <p>
          注意 Go 无法像 Java 那样“禁止”零值构造——<code>var x T</code> 永远合法。所以真正的护城河是<strong>字段私有 + 同包内才能赋值</strong>。
          如果一个类型的零值本身就是合法可用的（如 <code>sync.Mutex</code>、<code>bytes.Buffer</code>），那是 Go 推崇的“<strong>make the zero value useful</strong>”设计，比强制构造更优雅。
        </p>
      </>
    ),
  },
  {
    id: 'di-container',
    category: '架构',
    q: '没有 Spring 容器，Go 项目怎么做依赖注入？反射容器去哪了？',
    a: (
      <>
        <p>
          Go 的主流答案是<strong>「手动连线」（manual wiring）</strong>：在 <code>main.go</code> 里自上而下地 new 出 repository → service → handler，
          一层层把依赖作为构造参数传进去。它显式、无反射、编译期可查、启动零开销——代价是 <code>main</code> 函数会长一些。
        </p>
        <p>
          需要自动化时用 <strong>Google Wire</strong>（编译期代码生成，不是运行时反射）或 Uber 的 <strong>fx/dig</strong>（运行时容器，更接近 Spring）。
          但社区主流态度是：<strong>大多数项目根本不需要 DI 框架</strong>。Spring 的反射容器解决的是 Java 生态的历史包袱，Go 从设计上就避免了这种复杂度。
        </p>
      </>
    ),
  },
  {
    id: 'value-vs-pointer',
    category: '内存',
    q: '什么时候用值接收者 (value receiver)，什么时候用指针接收者 (pointer receiver)？',
    a: (
      <>
        <p>判断顺序：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>需要修改接收者</strong>→ 必须用指针 <code>*T</code>（值接收者改的是拷贝）。</li>
          <li><strong>结构体较大</strong>（比如超过几个机器字）→ 用指针避免每次调用都拷贝。</li>
          <li><strong>类型含 sync.Mutex 等不可复制字段</strong>→ 必须用指针。</li>
          <li>否则小的、不可变的值类型（如坐标 Point）可用值接收者。</li>
        </ul>
        <p>
          <strong>黄金法则：同一类型的方法集要保持一致</strong>，不要一半值一半指针。拿不准就统一用指针接收者——这是最安全的默认选择。
        </p>
      </>
    ),
  },
  {
    id: 'nil-interface',
    category: '陷阱',
    q: '为什么我的 err 明明返回了 nil，`if err != nil` 却成立？',
    a: (
      <>
        <p>
          这是 Go 最著名的坑：<strong>「带类型的 nil 不等于 nil 接口」</strong>。接口值由<strong>（类型, 值）</strong>两部分组成，
          只有<strong>两者都为 nil</strong> 时接口才 == nil。
        </p>
        <pre className="bg-black/30 rounded-md p-3 text-xs overflow-x-auto my-2"><code>{`func bad() error {
    var e *MyError = nil   // 具体指针类型，值为 nil
    return e               // 接口里塞进了 (*MyError, nil)
}
// bad() != nil 成立！因为类型部分不是 nil`}</code></pre>
        <p>
          解法：<strong>直接 <code>return nil</code></strong>，不要返回一个值为 nil 的具体错误指针。函数返回值类型也应声明为 <code>error</code> 接口而非 <code>*MyError</code>。
        </p>
      </>
    ),
  },
  {
    id: 'package-cycle',
    category: '架构',
    q: 'Go 不允许包循环依赖，我习惯的 Java 分层（entity 互相引用）怎么搬？',
    a: (
      <>
        <p>
          Go <strong>禁止包级循环导入</strong>（编译直接失败），这恰恰逼你做出更清晰的分层。常见处理：
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>接口下沉</strong>：把接口定义在<em>使用方</em>所在的包，而不是实现方。这是 Go 和 Java 的最大思维差异——“<strong>接口属于消费者</strong>”。</li>
          <li><strong>提取公共类型到独立包</strong>（如 <code>domain</code> / <code>model</code>），让上层都依赖它，而它不依赖任何人。</li>
          <li>用 <code>internal/</code> 目录限制可见范围，强制单向依赖。</li>
        </ul>
        <p>
          如果你发现两个包要互相引用，<strong>这几乎总是分层设计有问题的信号</strong>，而不是语言限制太死。
        </p>
      </>
    ),
  },
  {
    id: 'panic-vs-exception',
    category: '错误处理',
    q: 'panic/recover 是不是就等于 try/catch？能用它做业务异常控制流吗？',
    a: (
      <>
        <p>
          <strong>不能，也绝对不要。</strong> <code>panic</code> 表达的是“程序进入了不该发生的状态”（即 bug），相当于 Java 的{' '}
          <code>Error</code> 而非 <code>Exception</code>。业务上可预期的失败（参数非法、记录不存在、网络超时）应该用<strong>返回 error 值</strong>处理。
        </p>
        <p>
          <code>recover</code> 的合法用途很窄：<strong>① 在 goroutine 顶层兜底</strong>，防止一个协程 panic 拖垮整个进程；
          <strong>② Web 框架的中间件</strong>把 panic 转成 500 响应。除此之外，把 panic 当 catch 用会让代码流程变得不可预测，是严重的反模式。
        </p>
      </>
    ),
  },
  {
    id: 'goroutine-leak',
    category: '并发',
    q: 'goroutine 这么轻，随便开就行吗？会不会泄漏？',
    a: (
      <>
        <p>
          会泄漏，而且比线程泄漏更隐蔽。<strong>goroutine 泄漏</strong>通常发生在：一个 goroutine 永远阻塞在 channel 收/发上，
          而对端再也不会出现。它不会报错，只是<strong>静静占着内存永不退出</strong>，累积起来就是内存泄漏。
        </p>
        <p>核心纪律：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>每个 goroutine 都要有明确的退出路径</strong>——谁负责让它结束？</li>
          <li><strong>用 <code>context</code> 传递取消信号</strong>，在 <code>select</code> 里监听 <code>&lt;-ctx.Done()</code>。</li>
          <li>向 channel 发送时，考虑接收方提前退出的情况（用带 default 的 select 或带缓冲 channel）。</li>
        </ul>
        <p>“随手 <code>go func(){}()</code> 但没人管它怎么结束”是新手最常见的事故源。</p>
      </>
    ),
  },
  {
    id: 'binary-size',
    category: '工程',
    q: '为什么 Go 编译出的二进制几十 MB？比我想象的大，能瘦身吗？',
    a: (
      <>
        <p>
          因为 Go 把<strong>运行时（GC、调度器）、所有依赖、调试符号都静态链接</strong>进了单个文件——这正是它“一个二进制即可部署、无需 JRE”的代价与优势。
          相比 Java 需要打包 JRE（100MB+），Go 的几十 MB 其实已经很省。
        </p>
        <p>瘦身手段：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><code>{'go build -ldflags="-s -w"'}</code> 去掉符号表和调试信息，通常能减 25%~30%。</li>
          <li>用 <code>upx</code> 进一步压缩（有启动解压开销，权衡使用）。</li>
          <li>Docker 用<strong>多阶段构建 + scratch/distroless 基础镜像</strong>，最终镜像可做到 10MB 级。</li>
        </ul>
      </>
    ),
  },
  {
    id: 'orm-transaction',
    category: '数据库',
    q: '没有 @Transactional 注解，Go 的事务怎么写才不会忘记回滚？',
    a: (
      <>
        <p>
          Go 没有声明式事务魔法，事务边界完全<strong>显式手写</strong>。标准范式是 <code>Begin → defer Rollback → ... → Commit</code>：
        </p>
        <pre className="bg-black/30 rounded-md p-3 text-xs overflow-x-auto my-2"><code>{`tx, err := db.BeginTx(ctx, nil)
if err != nil {
    return err
}
defer tx.Rollback() // 关键：提前注册回滚，Commit 后它会变成 no-op

if _, err = tx.ExecContext(ctx, ...); err != nil {
    return err // 直接返回，defer 自动回滚
}
return tx.Commit() // 成功提交后，上面的 Rollback 不再生效`}</code></pre>
        <p>
          诀窍在于 <strong><code>defer tx.Rollback()</code> 紧跟在 Begin 之后</strong>：任何提前 return（出错）都会触发回滚；
          一旦成功 <code>Commit()</code>，再调用 <code>Rollback()</code> 只会返回 <code>ErrTxDone</code> 而无副作用。
          更复杂的场景可以封装一个 <code>WithTx(ctx, func(tx) error)</code> 辅助函数统一管理。
        </p>
      </>
    ),
  },
]

const categories = ['全部', ...Array.from(new Set(faqs.map((f) => f.category)))]

function FAQItem({ faq, index }: { faq: FAQ; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      id={faq.id}
      className="scroll-mt-24 rounded-md border border-card-border bg-card overflow-hidden
                 hover:border-accent/30 transition-colors duration-200"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 text-left px-5 py-4 cursor-pointer"
      >
        <span className="shrink-0 text-accent font-mono text-sm font-bold mt-0.5">
          Q{String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 font-semibold text-foreground leading-relaxed">{faq.q}</span>
        <svg
          className={`w-5 h-5 shrink-0 text-muted-fg transition-transform duration-300 mt-0.5 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pl-[3.75rem] text-sm text-foreground/80 leading-relaxed space-y-3
                        [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-muted [&_code]:text-xs [&_code]:font-mono">
          {faq.a}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [activeCat, setActiveCat] = useState('全部')

  const filtered =
    activeCat === '全部' ? faqs : faqs.filter((f) => f.category === activeCat)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-accent font-mono mb-2 block">FAQ · 硬核技术问答</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-3">
          常见困惑
          <span className="text-base font-normal text-muted-fg">Hardcore FAQ</span>
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          专治“语法都懂了，但依然迷茫”。这里收集 Java 程序员转 Go 在<strong className="text-foreground">编译期与架构层面</strong>
          最真实的疑问——不是“怎么打印 Hello World”，而是“为什么 nil 不等于 nil”。
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border cursor-pointer
              ${
                activeCat === cat
                  ? 'bg-accent text-card border-accent shadow-sm'
                  : 'bg-muted text-muted-fg border-card-border hover:text-foreground hover:bg-muted-hover'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="space-y-3">
        {filtered.map((faq) => (
          <FAQItem key={faq.id} faq={faq} index={faqs.indexOf(faq)} />
        ))}
      </div>

      {/* Footer hint */}
      <div className="mt-12 p-5 rounded-md bg-accent-light border border-card-border text-sm text-accent leading-relaxed">
        还有没解决的困惑？这些问题大多在
        <a href="/chapters/basics" className="underline font-semibold mx-1">章节教程</a>
        里有完整推导，或到
        <a href="/examples" className="underline font-semibold mx-1">实战示例库</a>
        看可复制的代码套路。
      </div>
    </div>
  )
}
