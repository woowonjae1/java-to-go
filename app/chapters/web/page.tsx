'use client'

import { CodeDuel } from '@/components/code-duel'
import { GoPlayground } from '@/components/go-playground'
import { GotchaCallout } from '@/components/gotcha-callout'
import { MindShift } from '@/components/mind-shift'
import { ChapterQuiz } from '@/components/chapter-quiz'
import Link from 'next/link'
import { ChapterIcon } from '@/components/chapter-icon'

export default function WebPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      {/* Chapter header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-accent font-mono mb-2 block">Chapter 5</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-2.5">
          <span className="text-rose-500"><ChapterIcon id="web" className="w-8 h-8" /></span>
          <span>Web 篇 — Web & API 开发</span>
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          直击 Java 程序员最熟悉的 Spring MVC / Spring Boot Web 架构。理解在 Go 世界中，如何使用轻量级 Web 引擎（如 Gin）构建高性能 RESTful APIs，掌握中间件的洋葱模型以及标签化的请求绑定与参数校验。
        </p>
      </div>

      {/* Section 1: Routing & Controller */}
      <section id="routing" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">5.1</span>
          路由与 HTTP 控制器：从注解扫描到显示路由树
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Spring Boot 的核心魔法之一是类扫描（Classpath Scanning）。只要加上 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">@RestController</code> 和 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">@RequestMapping</code>，框架就会在运行时使用反射构建出路由图。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          在 Go 的设计哲学中，**一切都应该显式注册**。Gin（Go 最流行的 Web 框架）通过一个 Engine 实例，使用链式调用显示定义所有的 API 路由。
          Gin 底层使用**基数树 (Radix Tree)** 算法进行路由匹配，避免了复杂的正则解析，这也是 Gin 吞吐量能达到 Spring Boot 数倍的核心硬件级原因。
        </p>

        <CodeDuel
          title="Spring Boot 控制器 vs Gin 路由组"
          javaCode={`// Java: 注解定义路由
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(user);
    }
}`}
          goCode={`// Go: 显式路由组与 Handler 函数
package main

import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()
    
    // 显式声明路由组 (Version 1)
    v1 := r.Group("/api/v1/users")
    {
        // 绑定路径参数和具体的 Handler 函数
        v1.GET("/:id", GetUserHandler)
    }
    
    r.Run(":8080") // 阻塞并启动服务器
}

func GetUserHandler(c *gin.Context) {
    id := c.Param("id") // 读取路径参数
    user := userService.FindByID(id)
    c.JSON(200, user)   // 显式响应 JSON
}`}
          highlights={[
            { java: '@RestController', go: 'r := gin.Default()' },
            { java: '@GetMapping("/{id}")', go: 'v1.GET("/:id", ...)' },
          ]}
        />

        <GotchaCallout
          level="warning"
          title="路径参数匹配冲突陷阱"
          javaWay={`// Spring MVC 支持复杂的模糊正则匹配
@GetMapping("/{id}")
@GetMapping("/active") // Spring 能智能区分并优先精确匹配`}
          goWay={`// Go Gin 的 Radix 树路由禁止通配冲突
v1.GET("/:id", Handler1)
v1.GET("/active", Handler2) // 运行时会直接崩溃或匹配混乱！
// 必须将精确路由写在模糊参数路由之前，或者重新规划路径`}
        >
          由于 Gin 底层是高度优化的 Radix Tree 树，通配符 <code>:id</code> 和精确路径 <code>active</code> 在同一层级可能冲突。在设计 API 结构时，应当尽量保证路由的唯一性和精确性。
        </GotchaCallout>
      </section>

      {/* Section 2: Middleware */}
      <section id="middleware" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">5.2</span>
          中间件机制：AOP 拦截器与洋葱模型
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 通常利用 Spring AOP（动态代理/CGLIB）、或者 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">HandlerInterceptor</code> 来实现请求前置校验（如鉴权）和后置处理（如日志记录）。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 没有复杂的 AOP 字节码增强魔法。Gin 提供了一种简单而极具表现力的**中间件 (Middleware)** 机制：
          中间件实际上就是一个普通的函数 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">func(c *gin.Context)</code>。多个中间件与 Handler 组成一个调用链。
          通过调用 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">c.Next()</code>，可以暂停当前的执行流，将控制权交给链里的下一个 Handler，当对端执行完后，再返回继续执行剩余代码——这就是经典的**“洋葱模型”**。
        </p>

        <CodeDuel
          title="Spring 拦截器 vs Gin 中间件洋葱模型"
          javaCode={`// Java: 显式拆分 preHandle 和 postHandle
public class AuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse resp, Object h) {
        String token = req.getHeader("Authorization");
        return "valid-token".equals(token); // 返回 false 拦截请求
    }
}`}
          goCode={`// Go: 闭包函数，一个 defer 搞定 pre/post 拦截
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // ---- 1. 前置过滤 (Pre-Handle) ----
        token := c.GetHeader("Authorization")
        if token != "valid-token" {
            c.JSON(401, gin.H{"error": "未登录"})
            c.Abort() // 拦截后续的所有执行流！
            return
        }

        // ---- 2. 交出控制权，让后续 Handler 运行 ----
        c.Next() 

        // ---- 3. 后置处理 (Post-Handle) ----
        // 请求处理完毕后，代码会回到这里继续执行
        log.Println("请求处理完成，状态码为:", c.Writer.Status())
    }
}`}
          highlights={[
            { java: 'preHandle', go: 'c.Next()' },
            { java: 'return false', go: 'c.Abort()' },
          ]}
        />
      </section>

      {/* Section 3: Data Binding */}
      <section id="binding" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">5.3</span>
          数据绑定与参数校验：Spring Validation vs 结构体 tag
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java Spring 依靠 Hibernate Validator 库，通过在 DTO 对象的字段上标注注解（如 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">@NotNull</code>, <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">@Email</code>），并在 Controller 中配合 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">@Valid</code> 触发反射校验。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 不支持运行时的元数据注解。作为替代，Go 的结构体支持**结构体标签 (Struct Tag)**。
          这些标签是以反引号包裹的元数据键值对，由第三方库（如 Gin 默认的 `validator`）在序列化或解析时读取。
          Gin 内置的 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">c.ShouldBindJSON(&req)</code> 会同时完成：
          1. 反序列化 JSON 到结构体。
          2. 根据 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">binding:"..."</code> 标签自动对字段的值（邮箱格式、字符串长度、非空）进行规则验证。
        </p>

        <CodeDuel
          title="Bean Validation vs Struct Binding Tags"
          javaCode={`// Java: Annotation 注解声明
public class RegisterReq {
    @NotNull(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull
    @Size(min = 6, max = 20)
    private String password;
}

// Controller
public ResponseEntity register(@Valid @RequestBody RegisterReq req) {
    // 框架反射验证并拦截
}`}
          goCode={`// Go: Struct 标签元数据声明
type RegisterReq struct {
    // binding 标签指定非空、合法邮箱
    Email    string \`json:"email" binding:"required,email"\`
    // binding 标签指定非空、最小长度 6
    Password string \`json:"password" binding:"required,min=6,max=20"\`
}

// Handler
func RegisterHandler(c *gin.Context) {
    var req RegisterReq
    // 绑定并验证，一步到位
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(200, gin.H{"status": "ok"})
}`}
          highlights={[
            { java: '@Email', go: 'binding:"required,email"' },
            { java: '@Valid', go: 'c.ShouldBindJSON(&req)' },
          ]}
        />

        <GotchaCallout
          level="danger"
          title="未导出（小写）字段的数据绑定失效"
          javaWay={`// Java 可通过 Getter/Setter 映射任何 private 属性`}
          goWay={`type LoginReq struct {
    username string \`json:"username"\` // ❌ 字段首字母小写！
    Password string \`json:"password"\`
}
// JSON 反序列化时，username 将永远是空字符串，因为第三方反序列化包无法读取未导出字段！`}
        >
          由于 JSON 反序列化库是独立的外部包，根据 Go 的可见性规则，如果结构体字段以小写字母开头，外部包是无法通过反射将其填写的。所以，**任何用于数据绑定的 DTO 字段都必须以大写字母开头**。
        </GotchaCallout>

        <GotchaCallout
          level="warning"
          title="omitempty 与零值被吞地雷"
          javaWay={`// Java: Jackson 可单独配置 NON_NULL
public class UpdateReq {
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Integer status = 0; // 正常输出 "status": 0
}`}
          goWay={`// Go: omitempty 会吞掉任何零值 (0, "", false, nil)
type UpdateReq struct {
    Status int \`json:"status,omitempty"\` // 如果 Status 是 0，序列化时该字段会彻底消失！
}

// ✅ 正确写法：使用指针类型
type UpdateReq struct {
    Status *int \`json:"status,omitempty"\` // 传入 0 正常输出，传入 nil 才被忽略
}`}
        >
          在 Go 的 JSON 序列化中，<code>omitempty</code> 匹配的是<strong>零值</strong>（而非仅仅是 nil）。对非指针类型（如 <code>int</code>, <code>string</code>, <code>bool</code>）使用该标签时，如果其值刚好是其零值（如 0、空字符串、false），该字段在 JSON 中将完全不输出。在设计更新 API 时，必须改用**指针类型**来区分“未传值”与“传入了零值”。
        </GotchaCallout>

        <GoPlayground
          id="web-gin-handler"
          title="练习：编写带验证的 Gin 控制器"
          difficulty="medium"
          description="补全 Gin 的 API 处理器逻辑：如果 JSON 数据绑定失败，返回 400 状态码及错误信息；如果成功，打印用户登录信息并返回成功响应。"
          starterCode={`package main

import (
	"fmt"
	"net/http"
	"github.com/gin-gonic/gin"
)

type LoginReq struct {
	// TODO: 定义结构体，绑定 JSON: "email" (要求非空、邮箱格式) 
	// 和 "password" (要求非空、最小长度为 6)
}

func LoginHandler(c *gin.Context) {
	// TODO: 1. 声明结构体变量
	// TODO: 2. 调用 ShouldBindJSON 绑定并校验
	// TODO: 3. 如果校验失败，返回 HTTP 400 (StatusBadRequest) 和错误信息
	// TODO: 4. 如果校验成功，打印接收到的 Email，并返回 HTTP 200 (StatusOK) 以及 JSON: {"success": true}
}

func main() {
	// Gin 模拟测试
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/login", LoginHandler)
	fmt.Println("Gin Handler 编译就绪")
}`}
          solution={`package main

import (
	"fmt"
	"net/http"
	"github.com/gin-gonic/gin"
)

type LoginReq struct {
	Email    string \`json:"email" binding:"required,email"\`
	Password string \`json:"password" binding:"required,min=6"\`
}

func LoginHandler(c *gin.Context) {
	var req LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	fmt.Println("用户登录:", req.Email)
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func main() {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/login", LoginHandler)
	fmt.Println("Gin Handler 编译就绪")
}`}
          expectedOutput={`Gin Handler 编译就绪`}
          hints={[
            '使用 c.JSON(code, object) 来进行响应',
            'gin.H 是 map[string]any 的快捷缩写，用来方便地声明 JSON 键值对',
            '结构体字段必须为大写字母开头，才能被 gin 绑定'
          ]}
        />
      </section>

      {/* Chapter Quiz */}
      <ChapterQuiz
        id="web"
        title="Web 篇测验"
        questions={[
          {
            question: '在 Go Gin 的路由设计中，为什么不能把 v1.GET("/:id") 和 v1.GET("/active") 混用在同一路由层级中？',
            options: [
              '因为 Go 不支持路径参数',
              '底层基于 Radix Tree 路由树的高性能检索机制，这种通配路径与固定路径在同一级容易引起匹配冲突崩溃',
              'Gin 框架限制每个控制器只能有 1 个方法',
              '通配符必须用 $ 符号'
            ],
            correctIndex: 1,
            explanation: 'Gin 抛弃了低效的正则匹配，采用 Radix Tree 路由树。如果在同一路由分支上通配符参数和精确路径共存，会导致子节点划分冲突。因此，设计时需确保路由规范，或者将精确路径写在通配符之前。',
          },
          {
            question: 'Gin 中间件中的 c.Next() 的主要作用是什么？',
            options: [
              '彻底终结当前请求，抛出 500 错误',
              '暂停当前中间件代码执行，让后续的 Handler / 中间件在调用链中运行，运行完后再返回继续执行其后的后置逻辑',
              '清空当前的 HTTP header',
              '自动跳转到下一个 Web 页面'
            ],
            correctIndex: 1,
            explanation: '这是典型的洋葱拦截器模型。c.Next() 负责移交执行权给链条里的下一环。当后面的 Handler 返回后，代码会从 c.Next() 的下一行继续执行，从而非常简单地实现了前置和后置逻辑的编排。',
          },
          {
            question: '如果将用于绑定请求 JSON 的结构体字段设为小写字母开头，反序列化时会发生什么？',
            options: [
              '编译不通过',
              '运行时报错闪退',
              '该小写字段无法被反序列化成功，始终保留其零值',
              '框架会自动转为大写'
            ],
            correctIndex: 2,
            explanation: '因为反序列化包是在外部运行的。根据 Go 的可见性规则，外部包无法反射获取或修改未导出的（小写字母开头）字段。因此在做 API 数据传递时，DTO 结构体字段必须全部导出（大写开头）。',
          },
        ]}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-card-border">
        <Link href="/chapters/concurrency" className="text-sm text-muted-fg hover:text-accent transition-colors flex items-center gap-1">
          ← 并发篇
        </Link>
        <Link href="/chapters/database" className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2">
          下一章：数据篇 →
        </Link>
      </div>
    </article>
  )
}
