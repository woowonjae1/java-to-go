import { CodeDuel } from '@/components/code-duel'
import { GoPlayground } from '@/components/go-playground'
import { GotchaCallout } from '@/components/gotcha-callout'
import { MindShift } from '@/components/mind-shift'
import { ChapterQuiz } from '@/components/chapter-quiz'
import Link from 'next/link'
import { ChapterIcon } from '@/components/chapter-icon'

export default function ConcurrencyPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      {/* Chapter header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-accent font-mono mb-2 block">Chapter 4</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-2.5">
          <span className="text-emerald-500"><ChapterIcon id="concurrency" className="w-8 h-8" /></span>
          <span>并发篇 — Threads → Goroutines</span>
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          从重量级的操作系统线程池，到轻量级的用户态协程。理解 Go 的 GMP 调度模型、通道（Channel）的状态机矩阵，以及如何使用 Context 实现超时与生命周期控制。
        </p>
      </div>

      <MindShift
        type="threads-to-goroutines"
        title="重量级线程 → 轻量级协程"
        javaConcept="JVM 线程（映射 OS 线程，1-2MB 栈）"
        goConcept="Goroutine（用户态协程，2KB 动态栈）"
        description="一个 Java 线程占用数兆字节，上下文切换需内核态参与；而 Go 协程极度轻量，单机可轻松承载百万并发。"
      />

      {/* Section 1: Threads vs Goroutine & GMP */}
      <section id="goroutines" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">4.1</span>
          用户态协程与 GMP 调度模型
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          在 Java 中，一个 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">java.lang.Thread</code> 实例是一对一映射到操作系统的物理线程上的。线程的创建、销毁和上下文切换全部依赖操作系统内核，代价昂贵。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 则在用户态实现了协程（Goroutine）。Go 运行时（Runtime）自身调度器采用了著名的 <strong>GMP 调度模型</strong> 来管理海量协程：
        </p>
        <ul className="text-muted-fg list-disc pl-5 my-2 leading-relaxed">
          <li><strong>G (Goroutine)</strong>：协程实体，保存了协程的栈信息、程序计数器（PC）等，初始仅占用 2KB，可随需动态扩容。</li>
          <li><strong>M (Machine)</strong>：操作系统的物理线程。协程 G 最终必须绑定到某个物理线程 M 上运行。</li>
          <li><strong>P (Processor)</strong>：逻辑处理器（上下文）。P 维护了一个局部协程队列，负责将 G 调度到物理线程 M 上执行。P 的默认数量等同于 CPU 核心数。</li>
        </ul>
        <p className="text-muted-fg mb-6 leading-relaxed">
          通过 <strong>Work Stealing（工作窃取）</strong> 和 <strong>Syscall 剥离</strong> 机制，当一个物理线程 M 被系统调用阻塞时，调度器会自动将 P 与其解绑，并带走剩余的协程 G 转移给新的 M 运行。这使得 Go 的并发性能极为强悍。
        </p>

        <CodeDuel
          title="JVM 线程池 vs Go 协程启动"
          javaCode={`// Java: 由于物理线程创建昂贵，必须通过线程池 (ExecutorService) 规避开销
ExecutorService pool = Executors.newFixedThreadPool(100); // 声明固定100个物理线程的线程池

for (int i = 0; i < 1000; i++) {
    final int id = i; // 闭包变量必须是 final
    pool.submit(() -> {
        System.out.println("执行任务: " + id); // 提交异步任务到线程池队列
    });
}
pool.shutdown(); // 关闭线程池接收通道
pool.awaitTermination(1, TimeUnit.MINUTES); // 阻塞等待所有提交任务运行完毕`}
          goCode={`// Go: 协程极度廉价，直接使用 go 关键字，使用 sync.WaitGroup 阻塞同步
var wg sync.WaitGroup // 声明 WaitGroup 计数器

for i := 0; i < 1000; i++ {
    wg.Add(1) // 启动协程前，将 WaitGroup 计数器加 1
    go func(id int) { // 异步启动匿名函数协程。显式传参 id 规避循环闭包指针捕获地雷
        defer wg.Done() // 函数退出前自动将 WaitGroup 计数器减 1
        fmt.Println("执行任务:", id)
    }(i) // 将当前循环变量的值复制传入协程
}
wg.Wait() // 阻塞等待直到 WaitGroup 计数器归零（所有协程全部运行完毕）`}
          highlights={[
            { java: 'ExecutorService pool', go: 'go func()' },
            { java: 'awaitTermination', go: 'sync.WaitGroup' },
          ]}
        />

        <GotchaCallout
          level="warning"
          title="闭包捕获循环变量的经典地雷"
          javaWay={`for (int i = 0; i < 5; i++) {
    // Java 编译器会强制捕获 final 或等效 final 的变量
    final int id = i;
    pool.submit(() -> print(id)); 
}`}
          goWay={`// Go 1.22 之前：如果直接在协程内引用循环变量 i
for i := 0; i < 5; i++ {
    go func() {
        fmt.Println(i) // ❌ 可能会全部打印出 5（因为协程执行慢，读取时循环已结束）
    }()
}
// 正确写法：使用函数参数显式拷贝 i
for i := 0; i < 5; i++ {
    go func(id int) {
        fmt.Println(id) // ✅ 拷贝传入，安全
    }(i)
}`}
        >
          虽然 Go 1.22 起已经在编译器层面修复了 for 循环变量地址共享的问题，但养成显式将循环变量作为参数传入协程的习惯依然能提高代码可读性，并且可完全兼容历史版本。
        </GotchaCallout>

        <GoPlayground
          id="concurrency-goroutines"
          title="练习：启动十万协程挑战"
          difficulty="easy"
          description="尝试在 JVM 中启动十万个物理线程会直接内存溢出（OOM）。在 Go 中，使用 WaitGroup 并发启动十万个协程计算累加和，体验用户态协程的威力。"
          starterCode={`package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
	var wg sync.WaitGroup
	var sum int64
	
	count := 100000 // 十万次并发
	
	// TODO: 并发启动十万个协程，每个协程使用 atomic.AddInt64(&sum, 1) 进行原子累加
	// 提示：记得在循环中 wg.Add(1)，协程内 defer wg.Done()
	_ = count

	fmt.Println("计算完成，总数:", atomic.LoadInt64(&sum))
}`}
          solution={`package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
	var wg sync.WaitGroup
	var sum int64
	
	count := 100000
	
	for i := 0; i < count; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			atomic.AddInt64(&sum, 1)
		}()
	}
	
	wg.Wait()
	fmt.Println("计算完成，总数:", atomic.LoadInt64(&sum))
}`}
          expectedOutput={`计算完成，总数: 100000`}
          hints={[
            '并发操作共享变量 sum 时，直接用 sum++ 会引发数据竞争（Data Race），必须使用 atomic 包或加锁',
            '在启动协程前调用 wg.Add(1)'
          ]}
        />
      </section>

      {/* Section 2: Mutex */}
      <section id="mutex" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">4.2</span>
          互斥锁与读写锁：防范竞态条件 (Data Race)
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 提供了内建的 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">synchronized</code> 关键字，可通过监视器锁（Monitor）轻松保护代码块。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 提供的是标准库中的 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">sync.Mutex</code>（互斥锁）和 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">sync.RWMutex</code>（读写锁，相当于 Java 的 ReentrantReadWriteLock）。
          配合 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">defer</code>，Go 可以非常干净地释放锁，防止遗漏。更棒的是，Go 提供了内置的<strong>竞态分析器</strong>，可在运行或编译时通过添加 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">-race</code> 标志（例如 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">go run -race main.go</code>）自动分析代码是否有并发读写冲突，这是 Java 极其渴望的特性。
        </p>

        <CodeDuel
          title="synchronized vs sync.Mutex"
          javaCode={`// Java: synchronized 内置监视器锁，支持方法级和代码块级同步
class SafeCounter {
    private int val = 0;
    
    // synchronized 隐式获取和释放当前实例的 Monitor 锁
    public synchronized void inc() {
        val++; // 线程安全递增
    }
    
    public synchronized int get() {
        return val;
    }
}`}
          goCode={`// Go: 显式加锁与释放，推荐配合 defer 防止发生崩溃(panic)时遗漏解锁
type SafeCounter struct {
    mu  sync.Mutex // 声明互斥锁成员变量
    val int
}

func (c *SafeCounter) Inc() {
    c.mu.Lock()         // 显式加锁
    defer c.mu.Unlock() // 延迟执行解锁：保证函数退出前（哪怕出现 panic 退出）锁百分之百被释放
    c.val++
}

func (c *SafeCounter) Get() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.val // 读取时也要加锁，防范读写数据竞争
}`}
          highlights={[
            { java: 'synchronized', go: 'sync.Mutex' },
            { java: 'val++', go: 'c.mu.Lock()' },
          ]}
        />
      </section>

      {/* Section 3: Channels */}
      <section id="channels" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">4.3</span>
          不要通过共享内存来通信，而要通过通信来共享内存
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          这是 Go 并发最著名的格言。在 Java 中，多个线程通过访问堆中的同一个共享对象，依靠加锁来实现同步。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 则倡导 <strong>CSP (Communicating Sequential Processes) 并发模型</strong>，把 <strong>Channel（通道）</strong> 作为协程之间传递数据的管道。
          当一个协程需要给另一个协程传递数据时，它把数据放入通道，由对端协程消费。数据的所有权被转移，从而天然消除了数据竞争。
        </p>

        <h3 className="text-lg font-bold mb-3 text-foreground">💡 核心精髓：Channel 状态机矩阵</h3>
        <p className="text-muted-fg mb-4 leading-relaxed">
          编写 Channel 代码最容易犯错的地方，就是不清楚 Channel 在不同生命周期状态下的读写行为。请务必牢记以下行为表：
        </p>

        <div className="overflow-x-auto my-6 border border-card-border rounded-xl">
          <table className="min-w-full divide-y divide-card-border text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-foreground">通道状态</th>
                <th className="px-4 py-2 text-left font-semibold text-foreground">写入操作 (ch &lt;- val)</th>
                <th className="px-4 py-2 text-left font-semibold text-foreground">读取操作 (&lt;-ch)</th>
                <th className="px-4 py-2 text-left font-semibold text-foreground">关闭操作 (close)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              <tr>
                <td className="px-4 py-2 font-mono font-medium text-amber-500">nil（未声明初始化）</td>
                <td className="px-4 py-2 text-red-400">永久阻塞 (Block)</td>
                <td className="px-4 py-2 text-red-400">永久阻塞 (Block)</td>
                <td className="px-4 py-2 text-red-500 font-semibold">触发 Panic!</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono font-medium text-green-500">active（活动中）</td>
                <td className="px-4 py-2">成功写入 / 缓冲区满时阻塞</td>
                <td className="px-4 py-2">成功读取 / 无数据时阻塞</td>
                <td className="px-4 py-2 text-green-600">正常关闭</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono font-medium text-zinc-500">closed（已关闭）</td>
                <td className="px-4 py-2 text-red-500 font-semibold">触发 Panic! (send on closed)</td>
                <td className="px-4 py-2">立即读取剩余数据 / 空时秒回零值+false</td>
                <td className="px-4 py-2 text-red-500 font-semibold">触发 Panic! (close of closed)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeDuel
          title="BlockingQueue vs Channel"
          javaCode={`// Java: 使用线程安全的阻塞队列 (BlockingQueue) 进行生产者消费者通信
BlockingQueue<String> queue = new LinkedBlockingQueue<>(10); // 声明容量为 10 的队列

// 生产者线程
new Thread(() -> {
    try {
        queue.put("hello"); // 阻塞式写入队列，若队列满则线程阻塞挂起
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
}).start();

// 消费者线程
new Thread(() -> {
    try {
        String data = queue.take(); // 阻塞式读取队列，若队列空则线程阻塞挂起
        System.out.println(data);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
}).start();`}
          goCode={`// Go: Channel 是语言级别内置的一等公民，使用 CSP 并发模型
ch := make(chan string, 10) // make 创建一个容量为 10 的缓冲通道 (buffered channel)

// 生产者协程
go func() {
    ch <- "hello" // 将字符串发送写入通道，若通道缓冲区满，当前协程阻塞挂起
    close(ch)     // 发送完成后必须显式关闭通道，防止对端 range 陷入永久死锁阻塞
}()

// 消费者协程
go func() {
    // 使用 range 关键字在通道上进行循环遍历迭代。
    // range 会阻塞读取，并且在通道被 close 且数据被读完后，自动退出循环，安全优雅
    for data := range ch {
        fmt.Println(data) // 消费并打印读取的数据
    }
}()`}
          highlights={[
            { java: 'BlockingQueue', go: 'chan' },
            { java: 'queue.put', go: 'ch <-' },
            { java: 'queue.take', go: '<-ch / range' },
          ]}
        />
      </section>

      {/* Section 4: select */}
      <section id="patterns" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">4.4</span>
          select 多路复用：并发流程控制器
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 对异步流程的控制通常需要使用复杂的 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">CompletableFuture.anyOf</code> 或者编写繁琐的锁通知。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 提供了一个专为通道设计的 <strong>select</strong> 关键字，用于**同时监听多个 Channel 的读写事件**。哪个 Channel 先就绪，select 就会执行对应的分支。如果都没有就绪，在写了 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">default</code> 时会立即非阻塞退出，没写时则一直阻塞等待。结合 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">time.After</code>，可以秒级实现超时取消控制。
        </p>

        <CodeDuel
          title="异步联合超时控制"
          javaCode={`// Java: 极其繁琐的 Future 超时控制与强制线程打断
CompletableFuture<String> task = fetchRemote(); // 触发异步请求
try {
    String res = task.get(3, TimeUnit.SECONDS); // 阻塞当前线程，最多等待 3 秒
} catch (TimeoutException e) {
    task.cancel(true); // 超时后尝试物理中断异步工作线程（往往不成功且存在线程安全隐患）
} catch (Exception e) {
    // 捕获其余异常
}`}
          goCode={`// Go: 优雅的非阻塞 select 监听，物理级级联超时打断
ch := fetchRemote() // 返回一个接收结果的通道

select {
case res := <-ch:
    fmt.Println("获取到结果:", res) // 通道先收到结果，打印并正常退出
case <-time.After(3 * time.Second): // time.After 内部定时器在 3 秒后会向返回的只读通道发送当前时间
    fmt.Println("请求超时！丢弃处理") // 3 秒内未收到结果，自动进入超时分支
}`}
          highlights={[
            { java: 'task.get', go: 'select / case' },
            { java: 'TimeoutException', go: 'time.After()' },
          ]}
        />
      </section>

      {/* Section 5: Context vs ThreadLocal */}
      <section id="context" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">4.5</span>
          [新增] Context 显式传递 vs ThreadLocal 隐式传递
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          在 Java Spring 后端架构中，我们广泛使用 <strong>ThreadLocal</strong>。当请求进来时，Spring 的 Thread-per-Request 模型会将用户信息、TraceID、事务信息绑定到当前线程。在调用链的任何深层位置，只需静静调用静态方法获取。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          <strong>在 Go 中，ThreadLocal 彻底消亡。</strong> 因为 Go 协程（Goroutine）是极度动态的。一个 HTTP 请求在生命周期中可能生成多个子协程并发干活，且协程在运行时会在不同操作系统物理线程之间频繁转移（跳跃）。如果使用线程相关的 ThreadLocal 必定导致数据错乱。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 的终极解法是：<strong>显式传递 context.Context</strong>。
          所有需要超时控制、异步取消、跨函数传递元数据（TraceID, AuthToken）的函数，都必须将 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">ctx context.Context</code> 作为**第一个参数**显式声明并层层向下传递。这看起来有些冗杂，却百分之百安全，且控制力极强。
        </p>

        <CodeDuel
          title="ThreadLocal 魔法 vs 显式 Context 链"
          javaCode={`// Java: 隐式线程上下文绑定，仅限于单线程模型或阻塞式容器
public class LogInterceptor {
    // 声明静态 ThreadLocal 存储 TraceId，在同一个物理线程内共享
    private static final ThreadLocal<String> traceId = new ThreadLocal<>();

    public void before(String id) {
        traceId.set(id); // 绑定到当前请求处理物理线程
    }

    public void doBusiness() {
        String id = traceId.get(); // 可以在代码链条的任意深处直接静态获取
        System.out.println("Trace: " + id);
    }
}`}
          goCode={`// Go: 显式参数传递 Context，跨协程(Goroutine)调度安全可靠
package business

func ProcessRequest(ctx context.Context, req *Request) {
    // 强制类型断言，从 context 中取出 TraceID 诊断元数据
    traceID := ctx.Value("trace_id").(string) 
    fmt.Println("Trace:", traceID)

    // 层层传递：将包含上下文控制属性的 ctx 显式作为第一个参数传入下级函数
    QueryDB(ctx, req.UserID)
}

func QueryDB(ctx context.Context, userID string) {
    // 若上层 ctx 被取消（如 API 超时），底层数据库驱动监听 ctx.Done() 会物理强制打断正在执行的 SQL 语句，避免连接池占满！
    rows, err := db.QueryContext(ctx, "SELECT...", userID)
}`}
          highlights={[
            { java: 'ThreadLocal', go: 'context.Context' },
            { java: 'traceId.get()', go: 'ctx.Value(...)' },
          ]}
        />

        <GotchaCallout
          level="warning"
          title="Context 绝不能用于乱塞业务参数"
          javaWay={`// Java 习惯把 Session, UserInfo 等全部塞进 ThreadLocal`}
          goWay={`// Go: 不要把普通业务参数（如 ID, 价格）塞进 Context
ctx = context.WithValue(ctx, "userId", 123) // 仅限链路诊断数据（TraceID, TenantID, Auth）`}
        >
          Go 官方规范指出，Context 的 <code>Value</code> 字段仅应该传递辅助监控、元数据路由或鉴权相关的信息。正常的业务入参必须通过显式函数参数传递，否则会导致代码变成“黑盒”，丧失可维护性。
        </GotchaCallout>

        <GoPlayground
          id="concurrency-context"
          title="练习：带 Context 超时的并发任务"
          difficulty="hard"
          description="使用 context.WithTimeout 创建一个 1 秒超时的 Context。模拟一个随机耗时 0-2 秒的任务，监听 ctx.Done()，如果超时则优雅退出，否则打印成功。"
          starterCode={`package main

import (
	"context"
	"fmt"
	"math/rand"
	"time"
)

func runWorker(ctx context.Context) {
	ch := make(chan string)
	
	go func() {
		// 模拟耗时任务
		sleepTime := time.Duration(rand.Intn(2000)) * time.Millisecond
		time.Sleep(sleepTime)
		ch <- "任务成功完成"
	}()

	// TODO: 使用 select 监听 ctx.Done() 和 ch。如果 ctx.Done() 就绪，打印 "任务超时取消!"。如果是 ch，打印结果。
}

func main() {
	// TODO: 使用 context.WithTimeout 创建 1 秒超时的 ctx，并调用 runWorker(ctx)
	// 别忘了调用 cancel() 释放资源
}`}
          solution={`package main

import (
	"context"
	"fmt"
	"math/rand"
	"time"
)

func runWorker(ctx context.Context) {
	ch := make(chan string)
	
	go func() {
		// 模拟耗时任务 (我们固定为 1.5 秒确保肯定超时测试)
		time.Sleep(1500 * time.Millisecond)
		ch <- "任务成功完成"
	}()

	select {
	case res := <-ch:
		fmt.Println(res)
	case <-ctx.Done():
		fmt.Println("任务超时取消:", ctx.Err())
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 1000*time.Millisecond)
	defer cancel() // 必须释放超时定时器
	
	runWorker(ctx)
}`}
          expectedOutput={`任务超时取消: context deadline exceeded`}
          hints={[
            '使用 context.WithTimeout(parent, duration) 创建子 context',
            '使用 select case <-ctx.Done() 来响应超时信号，读取 ctx.Err() 能看到错误细节',
            '无论是否超时，都要在退出前调用 cancel() 函数，防止定时器内存泄漏'
          ]}
        />
      </section>

        <CodeDuel
          title="Goroutine 泄露防护模式"
          javaCode={`// Java: 线程池任务阻塞挂起 (如 HTTP 请求悬挂)
// 线程会一直被占用，直到 Socket 超时。若线程池满则引发拒绝策略
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> {
    // 模拟无限期网络挂起或死锁，占用线程池中的宝贵线程
    HttpURLConnection conn = (HttpURLConnection) new URL("http://hang.com").openConnection();
    conn.getInputStream().read(); // 永久阻塞
});`}
          goCode={`// Go: 协程通道发送阻塞导致泄露，以及使用 Select/Context 兜底防护
func Worker() {
    ch := make(chan string) // ❌ 无缓冲通道

    go func() {
        // 执行某项业务，并将结果发送至 ch
        ch <- "result" // ❌ 发送端会永久阻塞在此处，如果接收端（外层）已经超时退出不再接收！
        // 此时，该子协程将永久残留内存中，无法被 GC 回收，导致 Goroutine 泄露！
    }()
}

// ✅ 解决方案一：使用带缓冲的通道 (Buffered Channel)
func SafeWorker1() {
    ch := make(chan string, 1) // 声明容量为 1 的缓冲通道，允许即使无接收端也能发送一次不阻塞
    go func() {
        ch <- "result" // 发送后子协程能正常退出，GC 随后会正常回收资源
    }()
}

// ✅ 解决方案二：使用 Select 监听 Done 通道实现主动取消
func SafeWorker2(ctx context.Context) {
    ch := make(chan string)
    go func() {
        select {
        case ch <- "result": // 成功发送
        case <-ctx.Done():  // 若上层上下文取消/超时，子协程物理中断并退出，安全！
            return
        }
    }()
}`}
          highlights={[
            { java: '线程池满拒绝策略', go: '协程永久阻塞导致内存泄漏' },
            { java: '依靠外部物理打断', go: 'ch := make(chan string, 1) 缓冲或 select/ctx.Done()' },
          ]}
        />

      {/* Chapter Quiz */}
      <ChapterQuiz
        id="concurrency"
        title="并发篇测验"
        questions={[
          {
            question: '在 Go 的协程调度中，P（Processor）的主要职责是什么？',
            options: [
              '直接代表操作系统的内核线程',
              '代表逻辑处理器，充当协程 G 的本地队列，负责将其分配给物理线程 M',
              '负责将代码进行机器码转换',
              '管理进程间的网络连接'
            ],
            correctIndex: 1,
            explanation: '在 GMP 模型中，P 是 logical processor，每个 P 拥有自己的本地可运行协程队列，消除了全局调度锁。M（OS 线程）必须绑定 P 才能获取 G 运行。',
          },
          {
            question: '如果对一个已被关闭（Closed）的 Channel 进行写入操作，会发生什么？',
            options: [
              '写入被直接静默忽略',
              '写入会被阻塞，直到对端重新开启通道',
              '引发运行时 Panic (send on closed channel)',
              '返回 nil 错误'
            ],
            correctIndex: 2,
            explanation: '向已关闭的通道发送数据是严重的逻辑错误，运行时会直接 panic 崩溃。相反，从已关闭的通道读取数据是安全的，会读完剩余数据，之后立刻返回零值 + false。',
          },
          {
            question: 'Go 中为什么不建议使用像 ThreadLocal 这样的方案在多协程间传递元数据？',
            options: [
              '因为 Go 的协程在物理上不会共享任何内存',
              '协程栈大小无法容纳 ThreadLocal 变量',
              '因为同一个协程在生命周期中，会被调度器频繁地在多个操作系统的物理线程间切换、挂起与唤醒，使线程绑定失效',
              '为了防止编译失败'
            ],
            correctIndex: 2,
            explanation: 'Go 协程与线程不绑定，而是由调度器在用户态动态调度在不同的 M（OS线程）上，因此绑定线程的 ThreadLocal 数据完全失效。Go 统一使用显式参数 context.Context 解决该需求。',
          },
        ]}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-card-border">
        <Link href="/chapters/errors" className="text-sm text-muted-fg hover:text-accent transition-colors flex items-center gap-1">
          ← 异常篇
        </Link>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2">
          🎉 返回首页
        </Link>
      </div>
    </article>
  )
}
