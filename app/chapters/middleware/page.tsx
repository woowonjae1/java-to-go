'use client'

import { CodeDuel } from '@/components/code-duel'
import { GoPlayground } from '@/components/go-playground'
import { GotchaCallout } from '@/components/gotcha-callout'
import { MindShift } from '@/components/mind-shift'
import { ChapterQuiz } from '@/components/chapter-quiz'
import Link from 'next/link'
import { ChapterIcon } from '@/components/chapter-icon'

export default function MiddlewarePage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      {/* Chapter header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-accent font-mono mb-2 block">Chapter 7</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-2.5">
          <span className="text-teal-500"><ChapterIcon id="middleware" className="w-8 h-8" /></span>
          <span>服务篇 — 中间件、RPC 与日志</span>
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          直击分布式工程中的核心三驾马车：缓存、通信与可观测性。比对 Spring Boot Redis 模板、Feign 声明式微服务契约、以及 Logback 系统，理解 Go 高并发中间件在强约束下的高性能演进。
        </p>
      </div>

      {/* Section 1: Redis */}
      <section id="redis" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">7.1</span>
          缓存访问：RedisTemplate vs go-redis 与 Context
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 常使用 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">RedisTemplate</code> 进行底层操作，或直接使用 Spring Cache 的注解（如 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">@Cacheable</code>）隐式接管。这在单线程拦截下非常方便，但较难精细控制底层的超时。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          在 Go 中，主流的 <strong>go-redis</strong> 客户端将**上下文超时控制 (`context.Context`)** 融入到了每一次请求中。
          无论是普通的 Get/Set 操作还是高级的 Pipeline（管道折叠提交），你都必须显式传入一个带有 Deadline 的 `ctx`。这保证了当 Web 请求由于超时被前端丢弃时，对 Redis 的查询请求也能立刻被撤销并主动释放连接，防止在高并发下把连接池“挤爆”。
        </p>

        <CodeDuel
          title="RedisTemplate 隐式连接 vs go-redis 强 Context 约束"
          javaCode={`// Java: 隐式连接管理，无法对每一次操作精细化传递超时或打断信号
@Autowired
private StringRedisTemplate redisTemplate;

public void saveToken(String key, String token) {
    // 隐式获取连接并执行 set，其超时时间完全由连接池统一配置决定，不易动态中断
    redisTemplate.opsForValue().set(key, token, 1, TimeUnit.HOURS);
}`}
          goCode={`// Go: 任何底层 Redis 调用均强制要求显式传入 ctx 进行超时与链路中断控制
package main

import (
    "context"
    "time"
    "github.com/go-redis/redis/v9" // 使用 v9 经典版本
)

func SaveToken(ctx context.Context, rdb *redis.Client, key, token string) error {
    // 显式传入 ctx。如果上游（例如 HTTP 请求）超时被取消，ctx.Done() 信号触发，当前 Set 动作会物理切断 TCP 请求并立即释放连接！
    err := rdb.Set(ctx, key, token, 1*time.Hour).Err()
    return err
}`}
          highlights={[
            { java: 'redisTemplate', go: 'rdb.Set(ctx, ...)' },
          ]}
        />
      </section>

      {/* Section 2: RPC */}
      <section id="grpc" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">7.2</span>
          微服务 RPC 通信：OpenFeign 反射 vs gRPC & Protobuf
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 在 Spring Cloud 生态中大量使用 OpenFeign：编写一个接口并在上面标注各种 Spring MVC 注解，框架在运行时基于动态代理和反射将调用转化为 HTTP JSON 请求。这极其消耗 CPU 资源。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 在微服务中几乎彻底放弃了 JSON 传输，拥抱 <strong>gRPC & Protobuf</strong>。
          gRPC 提倡**契约优先 (Contract First)**：在 `.proto` 文件中定义服务方法和数据结构。
          编译期，编译器会物理生成对应的 Go 客户端和接口实现。运行时，它基于极快且节省宽带的二进制 Protobuf 序列化，配合 HTTP/2 多路复用，吞吐量比 JSON API 提升了一个数量级。
        </p>

        <CodeDuel
          title="Feign 注解 HTTP vs Protobuf 编译强类型"
          javaCode={`// Java: Feign 声明式客户端，在运行时通过 JDK 动态代理拦截方法，解析注解并利用反射拼装 HTTP JSON 请求
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/users/{id}")
    UserDto getUser(@PathVariable("id") Long id); // 运行时反射、JSON 编解码开销高
}`}
          goCode={`// Go: Protobuf 编译期绑定，强类型安全校验，运行期零反射代理开销
// (下面的代码是由 protoc 编译器读取 .proto 文件后物理生成出来的，并非动态猜测)
type UserServiceClient interface {
    GetUser(ctx context.Context, in *UserRequest, opts ...grpc.CallOption) (*UserResponse, error)
}

// 客户端物理调用示例：使用二进制 Protobuf 进行序列化，走 HTTP/2 双向流，效率极高
resp, err := client.GetUser(ctx, &UserRequest{Id: 42})`}
          highlights={[
            { java: 'OpenFeign (动态代理)', go: 'gRPC 生成的代码 (编译期绑定)' },
            { java: 'HTTP/1.1 JSON', go: 'HTTP/2 Protobuf (二进制流)' },
          ]}
        />
      </section>

      {/* Section 3: Logging */}
      <section id="logging" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">7.3</span>
          高性能结构化日志：Logback 字符串拼接 vs Zap 零堆分配 (Zero Allocation)
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 的 SLF4J / Logback 在打印日志时，最常用的是花括号占位符拼接：<code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">logger.info("User {} login status: {}", username, status)</code>。这在频繁打印的大流量网关下，会在堆上生成成百上千个临时字符串和 `Object[]` 数组，触发高频 GC 停顿。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 的 <strong>Uber Zap</strong> 日志框架开创了**强类型结构化日志**的先河。
          通过显式使用强类型字段（如 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">zap.String("key", "val")</code>），Zap 可以直接将值写入环形缓冲区，**完全实现了垃圾零堆分配（Zero Heap Allocation）**。同时，Zap 极度推崇输出 JSON 格式日志，以便直接对接 ELK / ELG 等日志采集中心。
        </p>

        <CodeDuel
          title="Logback 占位符 vs Zap 强类型零内存分配"
          javaCode={`// Java: 使用 {} 占位符。底层在调用时，必须隐式创建 Object[] 数组，并且将基础类型（如 Long）装箱为包装类，引起堆内存垃圾分配
logger.info("Register success. id: {}, ip: {}", userId, reqIp);`}
          goCode={`// Go: 强类型指定 Field。直接在栈中组织字段并直达缓冲区，完全实现堆上零对象分配（Zero Allocation）
logger.Info("Register success",
    zap.Int64("id", userId),  // 强类型，防范 int 到 interface{} 的装箱分配
    zap.String("ip", reqIp),  // 强类型
)`}
          highlights={[
            { java: 'Object[] 数组隐式装箱', go: 'zap.Int64 / zap.String 强类型' },
            { java: '文本日志', go: '结构化 JSON 日志' },
          ]}
        />

        <CodeDuel
          title="生产级 Zap 高性能日志初始化"
          javaCode={`// Java: logback-spring.xml 繁琐的 XML 配置
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </encoder>
    </appender>
    <root level="INFO">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>`}
          goCode={`// Go: 纯代码显式配置高性能 Zap Logger 并输出结构化 JSON
package main

import (
    "go.uber.org/zap"
    "go.uber.org/zap/zapcore"
    "os"
)

func InitLogger() *zap.Logger {
    // 1. 定义 JSON 格式配置参数（对应 Kibana 日志解析）
    encoderConfig := zap.NewProductionEncoderConfig()
    encoderConfig.TimeKey = "timestamp"                  // 指定时间字段名称为 timestamp
    encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder // 指定 ISO8601 时间格式

    // 2. 创建 Core：分别指定日志输出流（Console/File）、日志格式（JSON）、输出级别
    core := zapcore.NewCore(
        zapcore.NewJSONEncoder(encoderConfig),             // JSON 结构化格式输出
        zapcore.AddSync(os.Stdout),                        // 打印输出到标准控制台流
        zap.NewAtomicLevelAt(zap.InfoLevel),               // 日志最低过滤级别为 Info
    )

    // 3. 构建并添加堆栈追踪、调用者所在的文件/行号信息
    logger := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zap.ErrorLevel))
    return logger
}`}
          highlights={[
            { java: 'logback.xml 复杂配置', go: 'zap.NewCore 纯代码装配' },
            { java: 'PatternLayout 文本格式', go: 'NewJSONEncoder 结构化 JSON' },
          ]}
        />

        <GoPlayground
          id="middleware-logging"
          title="练习：使用结构化日志记录 API 请求"
          difficulty="medium"
          description="使用模拟的结构化日志组件，记录一条成功或失败的 API 请求日志。当 HTTP 状态码 >= 400 时，要求记录 Error 级别的日志并携带 path 和 code；否则记录 Info 级别日志。"
          starterCode={`package main

import (
	"fmt"
)

type Field struct {
	Key   string
	Value interface{}
}

func String(k string, v string) Field { return Field{k, v} }
func Int(k string, v int) Field       { return Field{k, v} }

type MockLogger struct{}

func (l MockLogger) Info(msg string, fields ...Field) {
	fmt.Printf("[INFO] %s | Fields: %v\n", msg, fields)
}

func (l MockLogger) Error(msg string, fields ...Field) {
	fmt.Printf("[ERROR] %s | Fields: %v\n", msg, fields)
}

// TODO: 实现 LogRequest 逻辑
func LogRequest(logger MockLogger, path string, status int) {
	// 如果 status >= 400，输出 Error，携带 "path" 和 "status" 字段
	// 否则输出 Info，携带 "path" 和 "status" 字段
}

func main() {
	logger := MockLogger{}
	LogRequest(logger, "/api/v1/user", 200)
	LogRequest(logger, "/api/v1/pay", 500)
}`}
          solution={`package main

import (
	"fmt"
)

type Field struct {
	Key   string
	Value interface{}
}

func String(k string, v string) Field { return Field{k, v} }
func Int(k string, v int) Field       { return Field{k, v} }

type MockLogger struct{}

func (l MockLogger) Info(msg string, fields ...Field) {
	fmt.Printf("[INFO] %s | Fields: %v\n", msg, fields)
}

func (l MockLogger) Error(msg string, fields ...Field) {
	fmt.Printf("[ERROR] %s | Fields: %v\n", msg, fields)
}

func LogRequest(logger MockLogger, path string, status int) {
	pField := String("path", path)
	sField := Int("status", status)
	
	if status >= 400 {
		logger.Error("Request failed", pField, sField)
	} else {
		logger.Info("Request success", pField, sField)
	}
}

func main() {
	logger := MockLogger{}
	LogRequest(logger, "/api/v1/user", 200)
	LogRequest(logger, "/api/v1/pay", 500)
}`}
          expectedOutput={`[INFO] Request success | Fields: [{path /api/v1/user} {status 200}]
[ERROR] Request failed | Fields: [{path /api/v1/pay} {status 500}]`}
          hints={[
            '当 status >= 400，调用 logger.Error',
            '将 String("path", path) 和 Int("status", status) 作为参数传入'
          ]}
        />
      </section>

      {/* Chapter Quiz */}
      <ChapterQuiz
        id="middleware"
        title="服务篇测验"
        questions={[
          {
            question: '在 go-redis 命令调用中，为什么第一个参数几乎全部要求显式传入 context.Context？',
            options: [
              '因为这是 Go 编译器的强制语法要求',
              '为了能够在 Web 请求或上游任务由于超时/手动取消被丢弃时，迅速将当前的 Redis 查询任务予以取消，避免堵塞池连接',
              '为了加密连接中的数据',
              '为了隐藏 key 字段'
            ],
            correctIndex: 1,
            explanation: '这是高并发系统的重要容灾哲学。显式传入 ctx 能让底层的 TCP 连接随 Context 的 Cancel 或 Deadline 快速打断并释放资源，彻底防止慢查询导致的高并发连接泄露。',
          },
          {
            question: 'gRPC 的契约优先（Contract First）在编译期绑定，与 Java Spring Cloud OpenFeign 相比有什么核心优势？',
            options: [
              '编译生成的强类型代码不需要在运行时通过低效的反射拼装 HTTP 报文，结合二进制 Protobuf 带来成倍的性能飞跃',
              'gRPC 的客户端代码可以由 AI 编写',
              'gRPC 彻底不需要网络连接',
              'gRPC 使用 XML 代替 JSON'
            ],
            correctIndex: 0,
            explanation: 'OpenFeign 严重依赖 Java 的运行时反射机制去猜测并打包 HTTP/1.1 JSON 报文；而 gRPC 在编译期就已经由 protoc 编译生成了确定的二进制序列化逻辑与强类型路由，运行期效率逼近原生调用。',
          },
          {
            question: 'Uber Zap 日志框架提倡 zap.String("key", val) 强类型字段写入，它的主要性能设计动机是什么？',
            options: [
              '增强日志的安全防篡改级别',
              '使日志在文件里显得更加整齐',
              '通过强类型直接进行缓冲区底层写入，避免字符串占位符和 Object[] 数组在堆上产生频繁的垃圾对象，达到零堆分配（Zero Allocation）',
              '不需要配置日志输出路径'
            ],
            correctIndex: 2,
            explanation: '在超高并发的高清热点代码中，频繁的字符串拼接会导致 GC 频繁停顿。Zap 框架通过提前指定强类型 Field 直接拷贝进二进制缓冲区，完全抹去了 GC 压力。',
          },
        ]}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-card-border">
        <Link href="/chapters/database" className="text-sm text-muted-fg hover:text-accent transition-colors flex items-center gap-1">
          ← 数据篇
        </Link>
        <Link href="/chapters/architecture" className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2">
          下一章：工程篇 →
        </Link>
      </div>
    </article>
  )
}
