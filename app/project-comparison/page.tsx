'use client'

import { CodeDuel } from '@/components/code-duel'
import { Terminal } from '@/components/ui/terminal'

interface CaseStudySection {
  id: string
  title: string
  description: string
  javaExplanation: string
  goExplanation: string
  whyComparison: string
  javaCode: string
  goCode: string
  highlights?: { java: string; go: string }[]
}

const caseStudies: CaseStudySection[] = [
  {
    id: 'di-injection',
    title: '1. 工程依赖与依赖注入 (Dependency Management & Injection)',
    description: '对比 Spring Boot 隐式反射装配与 Go Modules 扁平依赖及显式依赖装配。',
    javaExplanation: 'Spring 依靠容器在运行时扫描类元数据，利用反射动态实例化对象并完成 @Autowired 自动装配。虽然简化了代码，但在大型微服务中，反射魔术使得依赖关系链变得隐蔽，冷启动时间变长，难以在编译期排查依赖循环。',
    goExplanation: 'Go 强制显式依赖注入。在 main.go 中，我们通过自底向上的构造函数（如 NewUserRepository -> NewUserService）手工组装对象树。没有任何动态反射托管，依赖链在入口函数一目了然，编译时检查一切类型和参数错误，启动开销为零。',
    whyComparison: 'Go 社区偏好显式（Explicit）优于隐式（Implicit），以及编译期安全优于运行时魔术。虽然手动连线需要多写几行初始化代码，但极大地增强了代码可读性、调试速度以及编译保障，冷启动耗时从 Java 的数秒缩短到微秒级。',
    javaCode: `// Java: Spring Boot 声明式反射注入
@RestController
@RequestMapping("/api/v1/user")
public class UserController {
    // 依赖容器在运行时动态注入实例
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO dto) {
        userService.register(dto);
        return ResponseEntity.ok("success");
    }
}`,
    goCode: `// Go: 显式构造装配与初始化
type UserRepository struct {
    db *gorm.DB
}
func NewUserRepository(db *gorm.DB) *UserRepository {
    return &UserRepository{db: db}
}

type UserService struct {
    repo *UserRepository
}
func NewUserService(repo *UserRepository) *UserService {
    return &UserService{repo: repo}
}

// 在 main 入口中显式连线组装
func main() {
    db := initDB()
    userRepo := NewUserRepository(db)
    userSvc := NewUserService(userRepo)
    
    r := gin.Default()
    r.POST("/api/v1/user/register", func(c *gin.Context) {
        // 直接调用显式组装的业务逻辑
        c.JSON(200, gin.H{"status": "success"})
    })
    r.Run(":8080")
}`,
    highlights: [
      { java: '@Autowired', go: 'NewUserRepository/NewUserService' },
      { java: '@RestController', go: 'gin.Default()' }
    ]
  },
  {
    id: 'db-transaction',
    title: '2. 数据映射与显式事务管理 (ORM & Transaction Control)',
    description: '对比 MyBatis-Plus AOP 声明式事务失效陷阱与 GORM 显式延迟回滚事务。',
    javaExplanation: 'Java 使用 MyBatis-Plus 注解进行物理字段定义，并通过 @Transactional 进行声明式事务保护。如果在一个没有注解的父方法中调用同类中的注解方法，Spring AOP 代理会由于“自调用”而静默失效，导致事务未开启且不回滚。',
    goExplanation: 'Go 采用 GORM struct tags 描述底层字段。事务通过 db.Begin() 显式开启，并通过 defer tx.Rollback() 机制进行兜底保护。任何提前返回错误的操作都会自动触发 Rollback，只有成功执行 tx.Commit() 才会真正提交。',
    whyComparison: 'Go 的事务模型将控制权完全移交给开发者，消除了 AOP 动态代理的内部黑盒，彻底杜绝了 Java 生态中因为“类自调用”、“受检/非受检异常不一致”导致的事务失效问题，确保数据库操作的不变量安全。',
    javaCode: `// Java: 隐式 AOP 声明式事务 (注意自调用失效陷阱)
@Service
public class OrderService {
    @Autowired
    private OrderMapper orderMapper;

    // 自调用入口：无事务支持，导致 doCreate 上的事务静默失效
    public void createOrder(Order order) {
        doCreate(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void doCreate(Order order) {
        orderMapper.insert(order);
        orderMapper.updateInventory(order.getProductId());
    }
}`,
    goCode: `// Go: 显式事务控制与 defer 注册延迟回滚
func (s *OrderService) CreateOrder(ctx context.Context, order *Order) error {
    // 1. 显式开启数据库事务
    tx := s.db.WithContext(ctx).Begin()
    if tx.Error != nil {
        return tx.Error
    }
    
    // 2. 利用 defer 注册回滚。哪怕之后发生 panic 或 return error，也必然自动回滚。
    // 一旦 tx.Commit() 成功，tx.Rollback() 自动转为 no-op。
    defer tx.Rollback()

    // 3. 执行单条 SQL
    if err := tx.Create(order).Error; err != nil {
        return err // 报错直接退出，defer 会触发回滚
    }

    // 4. 更新关联表
    if err := tx.Table("inventory").Where("product_id = ?", order.ProductID).
        Update("stock", gorm.Expr("stock - ?", 1)).Error; err != nil {
        return err
    }

    // 5. 显式提交事务
    return tx.Commit().Error
}`,
    highlights: [
      { java: '@Transactional', go: 'db.Begin() & defer tx.Rollback()' },
      { java: 'orderMapper.insert', go: 'tx.Create(order)' }
    ]
  },
  {
    id: 'auth-session',
    title: '3. 鉴权与会话共享隔离 (Auth Middleware & Context Passing)',
    description: '对比 Java ThreadLocal 线程局部变量与 Go Context 协程上下文传递。',
    javaExplanation: 'Java 习惯在 Filter/Interceptor 中解析 JWT 并保存在静态 ThreadLocal 内，供整个调用链（Controller -> Service -> DAO）无参获取。但这在多线程异步编排时会发生上下文丢失或线程污染漏洞。',
    goExplanation: 'Go 没有 ThreadLocal，因为 Goroutine 的运行可能被底层线程并发调度。Go 统一要求将用户信息作为 context.Context 写入请求链路，并作为第一个参数显式层层透传给各个接口。',
    whyComparison: 'Go 强调“显式（Explicit）传递上下文”。ThreadLocal 虽然省去了传参步骤，但引入了全局隐式状态，降低了代码可测试性并埋下线程池污染隐患。Go 显式传递 context 可以更直观地管理链路超时、终止信号和链路追踪。',
    javaCode: `// Java: 隐式 ThreadLocal 会话存储
public class UserContext {
    private static final ThreadLocal<Long> ctx = new ThreadLocal<>();
    public static void setUserId(Long id) { ctx.set(id); }
    public static Long getUserId() { return ctx.get(); }
    public static void clear() { ctx.remove(); }
}

// 在 Service 任何位置隐式调用
@Service
public class BillService {
    public void generateBill() {
        Long userId = UserContext.getUserId(); // 静态隐式拉取
        // ...
    }
}`,
    goCode: `// Go: Context 显式传递上下文
type contextKey string
const userIdKey contextKey = "userId"

// 中间件解析并注入 context
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        userId := parseJWT(token)
        
        // 基于 Request Context 注入新值并覆盖写入
        ctx := context.WithValue(c.Request.Context(), userIdKey, userId)
        c.Request = c.Request.WithContext(ctx)
        c.Next()
    }
}

// 业务层首参数显式接收 ctx 并提取
func (s *BillService) GenerateBill(ctx context.Context) error {
    userId, ok := ctx.Value(userIdKey).(int64)
    if !ok {
        return errors.New("unauthorized")
    }
    // ...
    return nil
}`,
    highlights: [
      { java: 'ThreadLocal', go: 'context.Context' },
      { java: 'UserContext.getUserId()', go: 'ctx.Value(userIdKey)' }
    ]
  },
  {
    id: 'concurrency-singleflight',
    title: '4. 并发流量防击穿合并 (Singleflight Traffic Coalescing)',
    description: '面对热点数据缓存失效，如何合并瞬时重复请求，保护底层数据库。',
    javaExplanation: 'Java 遇到高并发击穿时，通常依赖本地互斥锁（ReentrantLock）进行双重检查锁定，或是采用分布式锁。对于大量相同的用户鉴权查询，需要配置复杂的同步阻塞逻辑，容易引发线程挂起和超时。',
    goExplanation: 'Go 提供了官方并发利器 golang.org/x/sync/singleflight。它通过内部互斥锁和通道，将相同 Key 的并发调用进行合并。只有一个请求真正访问后端，其他请求挂起并共享这单个返回结果。',
    whyComparison: 'Go 使用 Singleflight 在不需要分布式锁的前提下，直接在内存层合并热点重复查询。不仅把系统压力降低到了极致，还能以极少的代码量（仅 Do 原语包覆）提供稳定高效的流量崩塌防护。',
    javaCode: `// Java: 基于锁的双重检查控制流量击穿
public class UserCache {
    private final ReentrantLock lock = new ReentrantLock();
    private final Map<String, User> cache = new ConcurrentHashMap<>();

    public User getUser(String id) {
        User u = cache.get(id);
        if (u != null) return u;

        lock.lock();
        try {
            u = cache.get(id);
            if (u != null) return u;
            u = db.query(id); // 真正查询数据库
            cache.put(id, u);
            return u;
        } finally {
            lock.unlock();
        }
    }
}`,
    goCode: `// Go: 使用 singleflight 合并相同 Key 的并发请求
type UserCacheManager struct {
    db      *gorm.DB
    sfGroup singleflight.Group // singleflight 合并组
}

func (m *UserCacheManager) GetUser(ctx context.Context, id string) (*User, error) {
    // Do 方法以 id 作为 Key 合并请求
    val, err, _ := m.sfGroup.Do(id, func() (interface{}, error) {
        var u User
        err := m.db.WithContext(ctx).First(&u, "id = ?", id).Error
        if err != nil {
            return nil, err
        }
        return &u, nil
    })

    if err != nil {
        return nil, err
    }
    return val.(*User), nil
}`,
    highlights: [
      { java: 'ReentrantLock lock', go: 'singleflight.Group' },
      { java: 'db.query(id)', go: 'sfGroup.Do(id, ...)' }
    ]
  },
  {
    id: 'stream-sse',
    title: '5. SSE 流式传输与异步管道 (Server-Sent Events & Pipelines)',
    description: '对比 Java Spring WebFlux 响应式流模式与 Go 基于 http.Client 管道式流写入。',
    javaExplanation: 'Java 在流式 AI 请求中（如 SSE 转发大模型），必须引入响应式框架 WebFlux，利用 WebClient 接收 Flux 数据流，并将其输出。代码需要使用函数响应式风格，陡峭的学习曲线让调试和异常排查异常痛苦。',
    goExplanation: 'Go 通过极其纯粹的“数据通道与流读取”设计。Go 使用底层 bufio.Reader 逐行读取下游大模型的 Chunk 数据包，并在接收到的瞬间，以物理管道形式直接通过 HTTP 连接通道写回给客户端。',
    whyComparison: 'Go 不需要复杂的 WebFlux 响应式编排魔法。通过直接调用 ReadBytes/Write 回写，代码逻辑保持为同步直觉，且能够利用 Context 在客户端主动断开连接时，立即层层取消下游大模型的长连接，杜绝无效流量和资源泄漏。',
    javaCode: `// Java: WebFlux Flux SSE 响应式流转发
@GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> streamData(@RequestParam String prompt) {
    return webClient.post()
        .uri("/v1/chat/completions")
        .bodyValue(new ChatReq(prompt))
        .retrieve()
        .bodyToFlux(String.class) // 下游转换为 Flux
        .map(chunk -> "data: " + chunk + "\\n\\n")
        .onErrorResume(e -> Flux.just("data: [ERROR]\\n\\n"));
}`,
    goCode: `// Go: 物理 Reader 流逐行读取并回写客户端
func StreamChat(c *gin.Context) {
    prompt := c.Query("prompt")
    resp, err := client.Post("https://api.openai.com/v1/chat", prompt)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    defer resp.Body.Close()

    // 建立流式读写上下文
    reader := bufio.NewReader(resp.Body)
    c.Stream(func(w io.Writer) bool {
        line, err := reader.ReadBytes('\\n')
        if err != nil {
            return false // 读取完成或报错，终止流
        }
        
        // 实时回写客户端连接
        w.Write(line)
        return true // 继续流处理
    })
}`,
    highlights: [
      { java: 'Flux<String>', go: 'bufio.Reader & w.Write' },
      { java: 'bodyToFlux', go: 'c.Stream' }
    ]
  }
]

export default function ProjectComparisonPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-muted-fg font-mono mb-2 block">Enterprise Case Study</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          实战对比 — 企业级工程平替
        </h1>
        <p className="text-base text-muted-fg mt-2 max-w-3xl leading-relaxed">
          深入研究如何将经典 Spring Boot 微服务生态（如 Spring DI、MyBatis-Plus 事务、Sa-Token 拦截、RabbitMQ、SSE 流式大模型等）安全、平稳地转换到 Go 原生架构。拒绝动态反射黑盒，拥抱显式类型安全。
        </p>
      </div>

      {/* Interactive Terminal Demo */}
      <section className="mb-14">
        <Terminal
          commands={[
            "npx shadcn@latest init",
            "npm install motion",
            "npx shadcn@latest add button card",
            "Term Deez Nuts",
          ]}
          outputs={{
            0: [
              "✔ Preflight checks passed.",
              "✔ Created components.json",
              "✔ Initialized project.",
            ],
            1: ["added 1 package in 2s"],
            2: ["✔ Done. Installed button, card."],
          }}
          typingSpeed={45}
          delayBetweenCommands={1000}
        />
      </section>

      {/* Comparisons */}
      <div className="space-y-16">
        {caseStudies.map((study) => (
          <section key={study.id} id={study.id} className="scroll-mt-20">
            <div className="border-b border-card-border pb-4 mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {study.title}
              </h2>
              <p className="text-sm text-muted-fg mt-1 leading-relaxed">
                {study.description}
              </p>
            </div>

            {/* Side-by-side Explanations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-lg bg-muted/30 border border-card-border">
                <div className="text-xs font-semibold text-muted-fg uppercase tracking-wider mb-2">Java 架构与设计缺陷</div>
                <p className="text-sm leading-relaxed text-muted-fg">{study.javaExplanation}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-card-border">
                <div className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Go 平替与实现优势</div>
                <p className="text-sm leading-relaxed text-muted-fg">{study.goExplanation}</p>
              </div>
            </div>

            {/* Direct code duel */}
            <CodeDuel
              title={study.title.split(' (')[0]}
              javaCode={study.javaCode}
              goCode={study.goCode}
              highlights={study.highlights}
            />

            {/* Comparative Analysis */}
            <div className="p-4 rounded-lg bg-accent-light border border-card-border mt-4">
              <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">深度工程决策分析</div>
              <p className="text-sm leading-relaxed text-muted-fg">{study.whyComparison}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
