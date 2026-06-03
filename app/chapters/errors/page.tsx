'use client'

import { CodeDuel } from '@/components/code-duel'
import { GoPlayground } from '@/components/go-playground'
import { GotchaCallout } from '@/components/gotcha-callout'
import { MindShift } from '@/components/mind-shift'
import { ChapterQuiz } from '@/components/chapter-quiz'
import Link from 'next/link'
import { ChapterIcon } from '@/components/chapter-icon'

export default function ErrorsPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      {/* Chapter header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-accent font-mono mb-2 block">Chapter 3</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-2.5">
          <span className="text-orange-500"><ChapterIcon id="errors" className="w-8 h-8" /></span>
          <span>异常篇 — Exceptions → Errors</span>
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          告别 try-catch，拥抱显式错误处理。在 Go 的世界里，错误是普通的值，不是异常，控制流永远清晰可见。
        </p>
      </div>

      <MindShift
        type="exceptions-to-errors"
        title="运行时异常 → 错误即值"
        javaConcept="隐式异常流与抛出中断"
        goConcept="显式错误多返回值与 defer"
        description="Java 用 try-catch 拦截冒泡异常，Go 将错误作为函数的第一类返回值，强制开发者在源头面对失败。"
      />

      {/* Section 1: try-catch -> if err != nil */}
      <section id="try-catch" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">3.1</span>
          try-catch → if err != nil：显式控制流的艺术
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          在 Java 中，当方法遇到错误时，会抛出异常（如 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">IOException</code>）。这会打断当前的运行栈，将控制权移交给上层的 catch 块。这导致了一种**隐式的控制流**：您很难一眼看出某行代码是否会抛出异常，或者会被谁捕获。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          <strong>Go 认为错误不是“例外”，而是函数执行的正常结果之一</strong>。Go 通过**多返回值模式**，将结果和错误（实现了 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">error</code> 接口的值）并列返回。
          这使得控制流变得极为清晰：每一行可能失败的操作，都会在其下方紧跟着一个显式的校验。同时，Go 引入了 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">defer</code> 关键字来优雅解决 Java 在 finally 中关闭资源的复杂嵌套。
        </p>

        <CodeDuel
          title="隐式异常冒泡 vs 显式当场处理"
          javaCode={`// Java: 隐式流，出错时被打断并跳出
try {
    String data = readConfig("config.json");
    User u = parseUser(data);
    save(u);
} catch (IOException e) {
    logger.error("IO error", e);
} catch (ParseException e) {
    logger.error("Parse error", e);
} finally {
    releaseResource();
}`}
          goCode={`// Go: 显式当场判断并返回，使用 defer 延迟清理
func loadAndSave() error {
    defer releaseResource() // 函数退出前自动执行

    data, err := readConfig("config.json")
    if err != nil {
        return fmt.Errorf("读取配置失败: %w", err) // 当场处理或包装返回
    }

    u, err := parseUser(data)
    if err != nil {
        return fmt.Errorf("解析用户失败: %w", err)
    }

    if err := save(u); err != nil {
        return err
    }
    return nil
}`}
          highlights={[
            { java: 'try', go: 'if err != nil' },
            { java: 'finally', go: 'defer' },
          ]}
        />

        <GotchaCallout
          level="tip"
          title="多个 defer 的 LIFO 栈执行与即时参数求值"
          javaWay={`// Java: finally 块按物理代码顺序从上到下执行
try {
    lock.lock();
    writer.write();
} finally {
    writer.close(); // 1
    lock.unlock();  // 2
}`}
          goWay={`// Go: defer 语句是压栈执行（后进先出 LIFO）
defer lock.Unlock() // 2 (后挂载，先执行)
defer writer.Close() // 1 (最先执行)

// ⚠️ 参数即时求值陷阱
x := 10
defer fmt.Println(x) // 此时立刻评估 x 的值为 10，即便后续修改 x=20，打印出的依旧是 10！`}
        >
          Go 的 <code>defer</code> 具有两个核心特性：
          1. <strong>后进先出 (LIFO)</strong>：多个 defer 语句按逆序执行。这非常符合逻辑，因为通常后创建的资源依赖先创建的资源，所以后创建的资源应该先关闭。
          2. <strong>即时参数求值</strong>：被 defer 的函数参数会在声明时立即计算并暂存，而非在执行时计算。如果需要延迟获取参数，应该将函数包装成**闭包**（如 <code>defer func() &#123; fmt.Println(x) &#125;()</code>）。
        </GotchaCallout>

        <GotchaCallout
          level="danger"
          title="空 catch 与忽略 error 都是灾难的根源"
          javaWay={`try { doSomething(); } catch (Exception e) {} // 空 catch 吞掉异常`}
          goWay={`res, _ := doSomething() // 用下划线忽略错误
// 极易导致 res 包含零值，后续代码直接在脏数据上运行`}
        >
          在 Go 中使用下划线 <code>_</code> 忽略错误被视为严重的**红线 (Red Flag)**。如果一个操作确实不需要报错处理，也要显式写入 <code>{"if err != nil { log.Printf(...) }"}</code> 或者在注释中明确写出原因，切忌让系统带病运行。
        </GotchaCallout>

        <GoPlayground
          id="errors-try-catch"
          title="练习：重构除零逻辑为 Go 风格"
          difficulty="easy"
          description="在 Java 中除零会抛出 ArithmeticException。实现 divide 函数，使其安全返回结果和 error。"
          starterCode={`package main

import (
	"errors"
	"fmt"
)

// TODO: 实现 divide 函数，除数 b 为 0 时返回自定义错误，否则返回结果和 nil err
func divide(a, b float64) (float64, error) {
	return 0, nil
}

func main() {
	res, err := divide(10, 0)
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Println("Result:", res)
	}
}`}
          solution={`package main

import (
	"errors"
	"fmt"
)

func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("division by zero")
	}
	return a / b, nil
}

func main() {
	res, err := divide(10, 0)
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Println("Result:", res)
	}
}`}
          expectedOutput={`Error: division by zero`}
          hints={[
            '使用 errors.New("message") 创建一个简单的错误实例',
            'Go 的多返回值语法是 (float64, error)'
          ]}
        />
      </section>

      {/* Section 2: Custom errors */}
      <section id="custom-errors" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">3.2</span>
          哨兵错误 (Sentinel) 与自定义错误类型
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 通过继承 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">Exception</code> 类来创建各种子类（如 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">UserNotFoundException</code>）。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          在 Go 中，内置的 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">error</code> 实际上只是一个极简的接口：
          <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">interface &#123; Error() string &#125;</code>。任何实现该接口的类型都是错误。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 的错误设计分为两种经典模式：
        </p>
        <ul className="text-muted-fg list-disc pl-5 my-2 leading-relaxed">
          <li><strong>哨兵错误 (Sentinel Error)</strong>：声明为全局常量的基础错误，如 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">var ErrNotFound = errors.New("not found")</code>，常用于表示特定的状态码。</li>
          <li><strong>结构体错误 (Custom Struct Error)</strong>：为错误携带更多结构化上下文，如携带验证失败的具体字段名称。</li>
        </ul>

        <CodeDuel
          title="自定义异常类 vs 隐式 error 接口"
          javaCode={`// Java: 显式继承 Exception
public class PaymentException extends Exception {
    private final int code;
    
    public PaymentException(int code, String msg) {
        super(msg);
        this.code = code;
    }
    
    public int getCode() { return code; }
}

// 抛出
throw new PaymentException(5001, "余额不足");`}
          goCode={`// Go: 实现 error 接口的结构体
type PaymentError struct {
    Code    int
    Message string
}

// 隐式实现 error 接口
func (e *PaymentError) Error() string {
    return fmt.Sprintf("pay failed [%d]: %s", e.Code, e.Message)
}

// 返回
func Pay() error {
    return &PaymentError{Code: 5001, Message: "余额不足"}
}`}
          highlights={[
            { java: 'extends Exception', go: 'Error() string' },
          ]}
        />
      </section>

      {/* Section 3: Wrapping */}
      <section id="error-wrapping" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">3.3</span>
          错误包装与断言链 (`errors.Is` / `As`)
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          在 Java 中，通过传入 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">cause</code> 可以将原始异常链条式保留。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 在 1.13 引入了统一的**错误包装 (Error Wrapping)** 规范。通过 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">fmt.Errorf("context: %w", err)</code>，可以使用 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">%w</code> 动词将原始错误包装在新错误中。
          这会创建一个包装链。标准库提供了两个极其强大的函数来检查和拆包这个链：
        </p>
        <ul className="text-muted-fg list-disc pl-5 my-2 leading-relaxed">
          <li><strong>errors.Is(err, target)</strong>：递归检查错误链中是否包含特定的<strong>哨兵错误值</strong>（类似 Java 的 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">e == target</code>）。</li>
          <li><strong>errors.As(err, &target)</strong>：递归寻找错误链中是否包含特定的<strong>错误类型</strong>并将其断言解包（类似 Java 的 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">e instanceof TargetException</code> 转型）。</li>
        </ul>

        <CodeDuel
          title="异常解包 vs errors 辅助断言"
          javaCode={`// Java: 递归检查 Cause
Throwable cause = e.getCause();
if (cause instanceof SqlException) {
    SqlException sqlEx = (SqlException) cause;
    // ...
}`}
          goCode={`// Go: 自动解包断言
err := dbOperation() // 返回一个被包装的错误

// 1. 值对比（检查是否是 ErrNotFound）
if errors.Is(err, sql.ErrNoRows) {
    // 处理未找到数据
}

// 2. 类型断言与转换（获取 PaymentError 结构体中的具体 Code）
var payErr *PaymentError
if errors.As(err, &payErr) {
    fmt.Println("支付失败码为:", payErr.Code)
}`}
          highlights={[
            { java: 'instanceof', go: 'errors.As' },
            { java: 'getCause()', go: '%w 包装链' },
          ]}
        />

        <GoPlayground
          id="errors-wrapping"
          title="练习：实现错误链包装与分析"
          difficulty="medium"
          description="模拟三层架构调用（DB -> Service -> Controller）。DB 返回 ErrDbConnectionLost。Service 对其进行包装。Controller 中使用 errors.Is 判断是否是网络导致并输出。"
          starterCode={`package main

import (
	"errors"
	"fmt"
)

var ErrDbConnectionLost = errors.New("db connection lost")

func readDB() error {
	return ErrDbConnectionLost
}

// TODO: 实现 queryData，调用 readDB，并使用 fmt.Errorf 包装该错误
func queryData() error {
	return nil
}

func main() {
	err := queryData()
	
	// TODO: 使用 errors.Is 判断根因是否为 ErrDbConnectionLost，若是则打印 "网络重连警告"
	fmt.Println("错误链路:", err)
}`}
          solution={`package main

import (
	"errors"
	"fmt"
)

var ErrDbConnectionLost = errors.New("db connection lost")

func readDB() error {
	return ErrDbConnectionLost
}

func queryData() error {
	err := readDB()
	if err != nil {
		return fmt.Errorf("service query failed: %w", err)
	}
	return nil
}

func main() {
	err := queryData()
	
	if errors.Is(err, ErrDbConnectionLost) {
		fmt.Println("触发网络重连警告！")
	}
	fmt.Println("错误链路:", err)
}`}
          expectedOutput={`触发网络重连警告！
错误链路: service query failed: db connection lost`}
          hints={[
            '使用 fmt.Errorf("some message: %w", err) 才能启用包装，使用 %v 会导致丢失错误链信息',
            '检查是否包含错误值必须使用 errors.Is(err, target)'
          ]}
        />
      </section>

      {/* Section 4: Panic/Recover */}
      <section id="panic-recover" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">3.4</span>
          Panic 与 Recover：不要当成 Exception 来用
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 提供了一个类似抛出未捕获异常的机制：<strong>panic（恐慌）</strong>。当程序遇到致命 bug（如空指针解引用、数组越界）或主动调用 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">panic()</code> 时，程序会终止当前正常流，开始在调用栈中逆向冒泡。如果在逆向过程中没有遇到 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">recover()</code>，整个进程会直接闪退。
        </p>

        <div className="my-6 p-5 rounded-xl bg-card border-l-4 border-red-500 bg-red-500/5">
          <h4 className="text-sm font-bold mb-2 text-red-400">🚨 致命硬伤：跨 Goroutine 无法 Recover！</h4>
          <p className="text-sm text-muted-fg leading-relaxed">
            Java 可以在主线程拦截子线程未捕获异常做兜底。<strong>在 Go 中，recover 必须和 panic 处于同一个 Goroutine！</strong>
            如果您在主协程中写了 <code>recover()</code>，但开启的子协程（<code>{"go func() { panic(\"error\") }()"}</code>）发生了恐慌，主协程是绝对无法捕获该恐慌的。这个子协程的崩溃会瞬间拖垮整台服务器的所有协程，导致整个进程直接挂掉！因此，在任何子协程内部，都必须写好守护性的 <code>defer recover()</code>。
          </p>
        </div>

        <CodeDuel
          title="兜底异常捕获 vs 协程内保护性 Recover"
          javaCode={`// Java: 线程异常可以由外层拦截捕获
Thread t = new Thread(() -> {
    throw new RuntimeException("Crash");
});
// 可通过 Thread.setDefaultUncaughtExceptionHandler 拦截`}
          goCode={`// Go: 崩溃捕获绝对不能跨越协程边界！
go func() {
    // 每个独立的协程内部必须亲自守护自己！
    defer func() {
        if r := recover(); r != nil {
            fmt.Printf("子协程崩溃被挽救: %v\\n", r)
        }
    }()
    
    panic("致命错误") // 只有在同一个协程的 defer 内才能被 recover()
}()`}
          highlights={[
            { java: 'throw new RuntimeException', go: 'panic()' },
            { java: 'ExceptionHandler', go: '同一协程 defer recover()' },
          ]}
        />
      </section>

      {/* Chapter Quiz */}
      <ChapterQuiz
        id="errors"
        title="异常篇测验"
        questions={[
          {
            question: 'Go 中为什么要尽量避免将 panic 用于普通的逻辑错误汇报？',
            options: [
              'panic 在编译期会被优化掉',
              'panic 会直接打断栈帧，在子协程内未捕获时会导致整个进程闪退挂掉，非常危险',
              'panic 只能传字符串，不能传对象',
              'Go 编译器不允许主动写 panic'
            ],
            correctIndex: 1,
            explanation: 'Go 的设计理念是错误为常态，panic 为致命异常。子协程发生未捕获的 panic 会导致全局闪退，因此绝不能滥用，只应在启动初始化配置失败等无法自拔的场景使用。',
          },
          {
            question: '若要检查一个被多次包装（fmt.Errorf）的错误，是否是由 ErrDbConnectionLost 触发的，应用哪个函数？',
            options: [
              'err == ErrDbConnectionLost',
              'errors.As(err, &ErrDbConnectionLost)',
              'errors.Is(err, ErrDbConnectionLost)',
              'reflect.DeepEqual(err, ErrDbConnectionLost)'
            ],
            correctIndex: 2,
            explanation: 'errors.Is 会递归遍历包装链，使用 == 进行比较，因此最适合用于定位根因是否为特定的哨兵错误值。而 errors.As 用于类型转换。',
          },
          {
            question: '在 Go 中，recover() 必须要写在什么地方才能生效？',
            options: [
              '必须写在 main 函数第一行',
              '必须在 defer 声明的延迟执行函数内部',
              '可以写在任何 if err != nil 代码块内',
              '写在 catch 代码块内'
            ],
            correctIndex: 1,
            explanation: 'recover() 只能在 defer 调用的函数体中执行才能捕获当前协程的 panic。写在其他正常执行流的地方会无意义地返回 nil。',
          },
        ]}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-card-border">
        <Link href="/chapters/oop" className="text-sm text-muted-fg hover:text-accent transition-colors">← 结构篇</Link>
        <Link href="/chapters/concurrency" className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2">
          下一章：并发篇 →
        </Link>
      </div>
    </article>
  )
}
