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
    id: 'proj-dto',
    title: '1. 数据接收与 DTO 校验 (Request DTO & Validation)',
    description: '对比 Spring Boot Bean Validation 声明式校验与 Go Gin 结构体绑定与 Validate 字段标签。',
    javaExplanation: 'Java 依靠 Hibernate Validator 机制，在 DTO 上添加 @NotNull, @Min 等注解，在 Controller 处通过 @Valid 进行修饰。如果有参数不合规，由全局异常处理器统一拦截捕获。虽然业务层无须手动解析，但这一套基于注解反射的隐式框架难以直观阅读且存在启动耗时。',
    goExplanation: 'Go 倡导强类型与显式操作。Gin 提供 ShouldBindJSON 机制，基于 Struct Tags (如 binding:"required,min=1") 绑定参数并利用 validator 库校验。返回值直接附带 Error，调用方可当场显式地处理校验失败，流程直观、清晰、零反射魔法。',
    whyComparison: 'Spring 隐藏了绑定与校验的细节，而 Go 将校验结果作为 error 显式返回。这让逻辑执行流程完全线性化，无任何隐式代理开销，不仅冷启动开销极低，而且非常利于精细化控制特定参数错误的个性化定制返回。',
    javaCode: `// Java: Spring Boot 声明式 DTO 参数校验
public class OrderCreateDTO {
    @NotNull(message = "商品ID不能为空")
    private Long productId;

    @Min(value = 1, message = "购买数量至少为1")
    private Integer quantity;

    // Getters & Setters
}

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderCreateDTO dto) {
        // 隐式完成校验，若不符合规范直接抛出异常被全局处理器拦截
        OrderVo vo = orderService.create(dto);
        return ResponseEntity.ok(vo);
    }
}`,
    goCode: `// Go: Gin 结构体 Tag 显式绑定与验证
type OrderCreateDTO struct {
    ProductID int64 \`json:"product_id" binding:"required"\`
    Quantity  int   \`json:"quantity" binding:"required,min=1"\`
}

func CreateOrderHandler(c *gin.Context) {
    var dto OrderCreateDTO
    
    // 显式执行绑定 and 参数检验，若出错直接获取 error 并做出响应
    if err := c.ShouldBindJSON(&dto); err != nil {
        c.JSON(400, gin.H{
            "status":  "error",
            "message": "参数校验失败: " + err.Error(),
        })
        return
    }
    
    vo, err := orderService.Create(c.Request.Context(), &dto)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, vo)
}`,
    highlights: [
      { java: '@Valid @RequestBody', go: 'c.ShouldBindJSON(&dto)' },
      { java: '@NotNull', go: 'binding:"required"' },
      { java: '@Min(value = 1)', go: 'min=1' }
    ]
  },
  {
    id: 'proj-db',
    title: '2. 数据实体与本地事务处理 (Entity & Transaction Control)',
    description: '对比 MyBatis-Plus AOP 声明式事务（防失效陷阱）与 GORM 显式延迟回滚本地事务。',
    javaExplanation: 'Java 利用 Spring AOP 代理 @Transactional 拦截执行，若抛出未经捕获的 RuntimeException 将触发自动回滚。然而，在同类内部方法“自调用”时，AOP 代理失效导致事务静默无法开启；且捕获非受检异常不回滚等问题常成为生产灾难。',
    goExplanation: 'Go 强调显式代码逻辑。GORM 使用 db.Begin() 手动拉起事务，并利用 defer tx.Rollback() 作为回滚兜底。发生任何错误或 panic 提前 return 时，defer 必然被触发从而执行回滚操作；唯有最终成功执行 tx.Commit() 且未报错，事务才会被真正持久化。',
    whyComparison: 'Go 将事务生命周期的控制权毫无保留地交给了开发人员。不仅能通过 defer 保证无论如何都不泄露连接或遗漏回滚，还消除了 Java AOP 魔法的底层“暗盒”，在编译期和运行期都能百分之百确定事务的范围 and 执行时机。',
    javaCode: `// Java: 隐式 AOP 声明式事务 (注意同类自调用失效陷阱)
@Service
public class OrderService {
    @Autowired
    private OrderMapper orderMapper;
    @Autowired
    private UserAccountMapper accountMapper;

    // 外部调用此方法时，事务将因为 AOP 代理“自调用”而静默失效
    public void processOrder(Order order) {
        doCreateAndPay(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void doCreateAndPay(Order order) {
        orderMapper.insert(order); // 保存订单
        // 扣减用户账户余额
        accountMapper.deductBalance(order.getUserId(), order.getAmount());
    }
}`,
    goCode: `// Go: GORM 显式事务拉起与 defer 延迟回滚兜底
func (s *OrderService) CreateAndPay(ctx context.Context, order *Order) error {
    // 1. 显式开启数据库本地事务
    tx := s.db.WithContext(ctx).Begin()
    if tx.Error != nil {
        return tx.Error
    }
    
    // 2. 利用 defer 注册回滚。只要下面出现 error 或 panic 退出，都必然自动执行 tx.Rollback()。
    // 当 tx.Commit() 成功后，后续 Rollback 将自动变成无效果的空操作（no-op）。
    defer tx.Rollback()

    // 3. 执行创建订单写入
    if err := tx.Create(order).Error; err != nil {
        return err // 直接退出，触发 defer 回滚
    }

    // 4. 执行扣减余额
    if err := tx.Table("user_accounts").Where("user_id = ?", order.UserID).
        Update("balance", gorm.Expr("balance - ?", order.Amount)).Error; err != nil {
        return err // 直接退出，触发 defer 回滚
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
    id: 'proj-payment',
    title: '3. 三方支付 SDK 调用与 Webhook 签名验证 (Payment SDK & Webhook)',
    description: '对比 Stripe Webhook 回调中，Java 自动读取 Request Body 验证签名与 Go 显式流式读取并支持多次读取的机制。',
    javaExplanation: 'Java 在 Spring Boot 中，Servlet 容器在数据到达 Controller 前可能已将其读取到包装类中，调用 Stripe SDK Webhook.constructEvent 比较顺畅。但如果需要对原始数据进行多次处理，需要重写 HttpServletRequestWrapper，实现起来繁琐。',
    goExplanation: 'Go 的 HTTP Request Body 是个只读一次的 io.ReadCloser 物理流。在 Gin 中，如果三方 Webhook（如 Stripe/Paypal）需要验证签名，我们必须先用 io.ReadAll 读取流的字节切片，然后再用 io.NopCloser 将流重新写回 Request.Body，以便 SDK 和后续中间件可重复多次读取。',
    whyComparison: 'Go 在网络 IO 设计上极为底层和纯粹，将 Request.Body 设计为不可重复读的单向流。这虽然要求开发者在需要多次读取时显式执行‘回填字节流’（NopCloser），但极大地降低了不必要的内存开销与拷贝操作，实现了真正的高性能。',
    javaCode: `// Java: Stripe Webhook 签名构建与事件验证
@RestController
@RequestMapping("/api/v1/payment/webhook")
public class StripeWebhookController {
    @Value("\${stripe.webhook.secret}")
    private String endpointSecret;

    @PostMapping
    public ResponseEntity<String> handleStripeWebhook(
        @RequestBody String payload,
        @RequestHeader("Stripe-Signature") String sigHeader) {
        
        try {
            // Spring MVC 内部已缓存 String 载荷，直接传给 SDK 进行签名验证
            Event event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            paymentService.handleEvent(event);
            return ResponseEntity.ok("success");
        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(400).body("签名校验失败");
        }
    }
}`,
    goCode: `// Go: Gin 中显式流式读取并回填 Request.Body 以供 Stripe SDK 校验
func StripeWebhookHandler(c *gin.Context) {
    sigHeader := c.GetHeader("Stripe-Signature")
    
    // 1. 从 HTTP 只读网络流中显式读取全部字节
    payload, err := io.ReadAll(c.Request.Body)
    if err != nil {
        c.JSON(400, gin.H{"error": "读取载荷失败"})
        return
    }
    
    // 2. 关键点：网络流只能读取一次。Stripe SDK 内部还需要读取 Body 校验，
    // 必须利用 NopCloser 将刚才读取的数据封回 Body 流中，供后续二次读取。
    c.Request.Body = io.NopCloser(bytes.NewBuffer(payload))

    // 3. 调用 Stripe 官方 SDK 进行签名验证与结构化解析
    event, err := webhook.ConstructEvent(payload, sigHeader, endpointSecret)
    if err != nil {
        c.JSON(400, gin.H{"error": "签名验证失败: " + err.Error()})
        return
    }

    paymentService.ProcessEvent(c.Request.Context(), &event)
    c.String(200, "success")
}`,
    highlights: [
      { java: '@RequestBody String payload', go: 'io.ReadAll(c.Request.Body)' },
      { java: 'Webhook.constructEvent', go: 'webhook.ConstructEvent' },
      { java: 'ResponseEntity.status(400)', go: 'io.NopCloser(bytes.NewBuffer(payload))' }
    ]
  },
  {
    id: 'proj-mq',
    title: '4. 异步队列发送与消费 (RabbitMQ Publishing & Consuming)',
    description: '对比 Spring AMQP @RabbitListener 隐式容器监听与 Go amqp091-go 物理通道阻塞循环消费。',
    javaExplanation: 'Java 利用 Spring Boot Starter AMQP 简化队列管理。通过配置类声明交换机和队列，并利用 @RabbitListener 注解修饰消费类，框架在后台自动维护线程池和长连接。一旦消息到达，反射调用指定方法。由于屏蔽了 RabbitMQ AMQP 的 Channel 细粒度操作，深度调优与拥堵定位非常不便。',
    goExplanation: 'Go 秉承显式声明与 CSP 通信模式。利用 rabbitmq/amqp091-go，必须显式连接 Connection、开辟 Channel 并声明 Exchange/Queue。消费时，ch.Consume 会返回一个只读的 Go Channel 管道。在 Goroutine 中，我们使用 for msg := range msgs 进行阻塞式轮询，显式执行业务后手动发送 Ack 回执。',
    whyComparison: 'Spring 隐藏了消费线程池管理和 ACK 回执；Go 利用 Goroutine 和 Channel 抽象了 AMQP 协议的物理长连接。Go 的协程开销极低，开发者可以直接对每个消息启动一个 Goroutine 异步处理加显式 ACK，极大地提升了吞吐率且容易追踪每个连接的通道占用情况。',
    javaCode: `// Java: Spring AMQP 声明式消息发布与监听接收
@Service
public class OrderPaidPublisher {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void publishPaidEvent(OrderPaidEvent event) {
        // 自动将对象序列化为 JSON 并发送到 Exchange
        rabbitTemplate.convertAndSend("order.exchange", "order.paid.routing", event);
    }
}

@Component
public class OrderPaidConsumer {
    // 声明式容器在后台维护消费者连接并反射调用此方法
    @RabbitListener(queues = "order.paid.queue")
    public void handleOrderPaid(OrderPaidEvent event) {
        System.out.println("收到订单支付消息: " + event.getOrderId());
        // 隐式自动确认 ACK 机制
    }
}`,
    goCode: `// Go: amqp091-go 显式 Channel 通道写入与阻塞消费管道
type OrderPaidEvent struct {
    OrderID string \`json:"order_id"\`
}

// 发送端：使用物理 Channel 推送消息
func (p *OrderPaidPublisher) PublishPaidEvent(ctx context.Context, event *OrderPaidEvent) error {
    body, _ := json.Marshal(event)
    // 显式在 RabbitMQ 信道 (Channel) 上发布单条持久化消息
    return p.amqpChannel.PublishWithContext(ctx,
        "order.exchange",      // exchange
        "order.paid.routing",   // routing key
        false, false,          // mandatory, immediate
        amqp.Publishing{
            ContentType:  "application/json",
            DeliveryMode: amqp.Persistent, // 消息持久化
            Body:         body,
        },
    )
}

// 接收端：开辟 Goroutine 显式通过 Go Channel 阻塞式轮询并手动 Ack
func (c *OrderPaidConsumer) StartConsume(ctx context.Context) {
    // 获取只读的消息传递管道 (Go Channel)
    msgs, _ := c.amqpChannel.Consume("order.paid.queue", "", false, false, false, false, nil)
    
    go func() {
        // 阻塞循环读取，一旦 RabbitMQ 消息到达则推入迭代
        for d := range msgs {
            var event OrderPaidEvent
            json.Unmarshal(d.Body, &event)
            
            // 处理业务
            log.Printf("收到订单支付消息: %s", event.OrderID)
            
            // 显式向 RabbitMQ Server 发送单条 ACK 确认
            d.Ack(false)
        }
    }()
}`,
    highlights: [
      { java: 'rabbitTemplate.convertAndSend', go: 'amqpChannel.PublishWithContext' },
      { java: '@RabbitListener(queues = "...")', go: 'ch.Consume & for msg := range msgs' },
      { java: 'OrderPaidEvent event', go: 'd.Ack(false)' }
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
          深入研究如何将核心模块“订单支付与队列处理”从 DTO 参数校验、本地事务、三方支付 Webhook 签名验证到 RabbitMQ 异步通知，安全、平稳地转换到 Go 原生架构。拒绝动态反射黑盒，拥抱显式类型安全。
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
