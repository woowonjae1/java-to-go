'use client'

import { CodeDuel } from '@/components/code-duel'
import { GoPlayground } from '@/components/go-playground'
import { GotchaCallout } from '@/components/gotcha-callout'
import { ChapterQuiz } from '@/components/chapter-quiz'
import Link from 'next/link'
import { ChapterIcon } from '@/components/chapter-icon'

export default function ProjectPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      {/* Chapter header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-accent font-mono mb-2 block">Chapter 9</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-2.5">
          <span className="text-indigo-500"><ChapterIcon id="project" className="w-8 h-8" /></span>
          <span>实战篇 — 企业级案例实战</span>
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          打通从基础语法到企业落地的最后一关。以真实的 AI 语音助手服务端 <code>rorolee-bot-oversea</code> 项目为例，深入探讨如何将 Spring Boot、MyBatis-Plus、Sa-Token 和 RabbitMQ 等 Java 微服务技术平替至高性能、云原生的 Go 生态，实现极简高效的工程落地。
        </p>
      </div>

      {/* Section 9.1 */}
      <section id="proj-layout" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">9.1</span>
          物理架构与配置加载：Maven Multi-Module {"->"} Go Mono-repo
        </h2>
        
        <h3 className="text-lg font-semibold mt-4 text-foreground/90">【基础】工程文件管理与依赖管理</h3>
        <p className="text-muted-fg leading-relaxed">
          Java 企业项目 <code>rorolee-bot-oversea</code> 采用 Maven 多模块（<code>admin</code> 和 <code>front</code>）物理隔离，通过父子 <code>pom.xml</code> 级联定义第三方依赖版本。
          在 Go 中，我们不需要引入复杂的嵌套子模块，而是采用 **Mono-repo 扁平单包模型**，在 <code>cmd/</code> 目录中声明多个启动入口共享底层的 <code>internal/</code> 物理包。
        </p>

        <CodeDuel
          title="Maven pom.xml 与 Go go.mod 依赖管理对照"
          javaCode={`<!-- pom.xml -->
<project>
    <groupId>com.openclaw</groupId>
    <artifactId>openclaw-java-parent</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>
    <modules>
        <module>admin</module>
        <module>front</module>
    </modules>
    <properties>
        <spring-boot.version>3.2.5</spring-boot.version>
        <sa-token.version>1.44.0</sa-token.version>
        <redisson.version>3.51.0</redisson.version>
    </properties>
</project>`}
          goCode={`// go.mod
module rorolee-bot

go 1.21

require (
	github.com/gin-gonic/gin v1.9.1
	github.com/redis/go-redis/v9 v9.0.5
	github.com/spf13/viper v1.16.0
	gorm.io/driver/postgres v1.5.2
	gorm.io/gorm v1.25.12
	github.com/stripe/stripe-go/v74 v74.30.0
	github.com/golang-jwt/jwt/v5 v5.0.0
)`}
          highlights={[
            { java: '<module>front</module>', go: 'Go Mono-repo 单一项目模式' },
            { java: '<sa-token.version>1.44.0</sa-token.version>', go: 'github.com/golang-jwt/jwt/v5 统一双端 JWT' },
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【最基础】组件装配：Spring @Autowired 反射魔法 vs Go 显式依赖注入</h3>
        <p className="text-muted-fg leading-relaxed">
          Spring 框架通过运行时反射扫描 Bean 定义，并在 IoC 容器中自动组装依赖（使用 <code>@Autowired</code> 或 <code>@Resource</code>）。
          Go 秉承<strong>无魔法、显式化</strong>原则，推荐在项目入口点（如 <code>main.go</code>）手动调用各层的构造函数，自底向上完成装配，这让依赖路径、控制反转变得绝对透明清晰。
        </p>

        <CodeDuel
          title="Spring @Autowired 动态装配 vs Go 手动显式依赖注入"
          javaCode={`// Java: Spring Boot 依靠反射与 IoC 容器进行隐式注入
@RestController
@RequestMapping("/user")
public class UserController {
    // 1. 通过 @Autowired 声明依赖，Spring 容器启动时通过反射动态注入 UserService 实例
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO dto) {
        // 2. 调用业务逻辑
        userService.register(dto);
        return ResponseEntity.ok("success");
    }
}`}
          goCode={`// Go: 显式构造函数组装依赖，去除“容器魔法”，完全控制生命周期与依赖关系
package main

import (
	"context"
	"net/http"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// 1. 定义数据持久层 Repository 结构体，显式持有 GORM 数据库指针
type UserRepository struct {
	db *gorm.DB
}

// 供外部创建实例的构造函数
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// 2. 定义业务逻辑层 Service 结构体，显式持有 Repository 依赖
type UserService struct {
	repo *UserRepository
}

// 构造函数：注入所需的 Repository 依赖
func NewUserService(repo *UserRepository) *UserService {
	return &UserService{repo: repo}
}

func main() {
	// 3. 在入口 main 函数中，显式、自底向上进行组件装配
	var db *gorm.DB = initDatabase() // 初始化 GORM 数据库连接
	
	userRepo := NewUserRepository(db) // 组装 Repo，注入 db
	userSvc := NewUserService(userRepo) // 将 Repo 注入 Service
	
	r := gin.Default()
	// 4. 控制器显式闭包或结构体注入依赖
	r.POST("/user/register", func(c *gin.Context) {
		// 直接调用已被显式组装好的业务服务
		_ = userSvc.repo.db // 依赖路径清晰可见，无反射隐式加载
		c.JSON(http.StatusOK, gin.H{"status": "success"})
	})
	r.Run(":8080")
}

func initDatabase() *gorm.DB {
	return &gorm.DB{} // 模拟初始化
}`}
          highlights={[
            { java: '@Autowired 自动反射注入', go: 'NewUserRepository/NewUserService 显式组装' },
            { java: 'Spring IoC 容器托管', go: '在 main.go 中统一自底向上配置，生命周期透明' },
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【中等】Mono-repo 目录结构与基于 Viper 的多环境 YAML 显式配置加载</h3>
        <p className="text-muted-fg leading-relaxed">
          Spring Boot 利用激活的 Profile 隐式自动拼装加载 <code>application-dev.yml</code>。Go 提倡一切显式化。我们使用 Mono-repo 扁平包结构，并利用 <code>spf13/viper</code> 库，在服务启动时显式解析配置。
        </p>

        <h4 className="text-sm font-bold mb-2">Go Mono-repo 物理布局推荐</h4>
        <pre className="text-xs font-mono bg-code-bg p-4 rounded-lg text-zinc-300 my-4 overflow-x-auto">
{`rorolee-bot/
├── cmd/
│   ├── front/
│   │   └── main.go       # 前台 API 服务入口
│   └── admin/
│       └── main.go       # 后台管理服务入口
├── configs/
│   ├── config.dev.yaml
│   └── config.prod.yaml
├── internal/
│   ├── config/           # 配置加载逻辑
│   ├── db/               # 数据库连接初始化
│   ├── middleware/       # 鉴权与拦截器
│   ├── model/            # GORM 映射实体
│   └── payment/          # 核心支付处理逻辑
├── go.mod
└── go.sum`}
        </pre>

        <h4 className="text-sm font-bold mb-2">配置加载实现（internal/config/config.go）</h4>
        <pre className="text-xs font-mono bg-code-bg p-4 rounded-lg text-zinc-300 my-4 overflow-x-auto">
{`package config

import (
	"fmt"
	"strings"
	"github.com/spf13/viper"
)

type DatabaseConfig struct {
	URL string \`mapstructure:"url"\`
}

type RedisConfig struct {
	Host string \`mapstructure:"host"\`
	Port int    \`mapstructure:"port"\`
}

type StripeConfig struct {
	SecretKey     string \`mapstructure:"secret_key"\`
	WebhookSecret string \`mapstructure:"webhook_secret"\`
}

type AppConfig struct {
	Port     int            \`mapstructure:"port"\`
	Database DatabaseConfig \`mapstructure:"database"\`
	Redis    RedisConfig    \`mapstructure:"redis"\`
	Stripe   StripeConfig   \`mapstructure:"stripe"\`
}

func LoadConfig(env string) (*AppConfig, error) {
	viper.SetConfigName(fmt.Sprintf("config.%s", env)) // 如 config.dev
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./configs")
	viper.AddConfigPath("/etc/bot/configs")

	// 支持环境变量覆盖，例如配置 app.database.url 映射为 APP_DATABASE_URL
	viper.SetEnvPrefix("APP")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("read config file failed: %w", err)
	}

	var cfg AppConfig
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unmarshal config fields failed: %w", err)
	}
	return &cfg, nil
}`}
        </pre>

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【高级】微服务 Mono-repo 编译与镜像体积调优</h3>
        <p className="text-muted-fg leading-relaxed">
          配合 **Docker 多阶段构建**，我们可以彻底摒弃 Java 重达几百兆的 JRE 运行环境，编译出只有 15MB 左右的纯净容器镜像：
        </p>
        <pre className="text-xs font-mono bg-code-bg p-4 rounded-lg text-zinc-300 my-4 overflow-x-auto">
{`# Dockerfile
# 阶段 1：使用 Go 官方镜像编译静态二进制文件
FROM golang:1.21-alpine AS builder
RUN apk add --no-cache git gcc musl-dev
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# -ldflags "-s -w" 剥离符号表和调试信息，将二进制体积缩减 30% 以上；CGO_ENABLED=0 实现纯静态编译
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o bot-front cmd/front/main.go

# 阶段 2：使用极简的 scratch 基础镜像
FROM scratch
WORKDIR /app
# 拷贝 CA 证书（这对于 HTTPS 请求下游大模型/Stripe 支付至关重要）
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /build/bot-front .
COPY configs/config.prod.yaml ./configs/
ENTRYPOINT ["./bot-front", "-env=prod"]`}
        </pre>
      </section>

      {/* Section 9.2 */}
      <section id="proj-db" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">9.2</span>
          数据模型与事务管理：MyBatis-Plus {"->"} GORM
        </h2>
        
        <h3 className="text-lg font-semibold mt-4 text-foreground/90">【基础】MyBatis-Plus Entity 注解转换成 GORM Tags</h3>
        <p className="text-muted-fg leading-relaxed">
          Java <code>rorolee-bot-oversea</code> 中，实体对象使用 MyBatis-Plus 提供的注解映射字段。在 Go 中，我们直接通过结构体的 Tag 进行显式定义。
        </p>

        <CodeDuel
          title="ConversationMessageEntity 物理数据表字段映射"
          javaCode={`// Java: MyBatis-Plus Entity 注解映射
@TableName(value = "conversation_message")
public class ConversationMessageEntity {
    @TableId(value = "message_id", type = IdType.INPUT)
    private String messageId;

    @TableField("session_id")
    private Long sessionId;

    @TableField("text")
    private String text;

    @TableField(value = "role", typeHandler = EnumTypeHandler.class)
    private ConversationRole role;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private Instant createdAt;
}`}
          goCode={`// Go: GORM Struct 显式 Tag 映射
type ConversationMessage struct {
	MessageID string    \`gorm:"primaryKey;column:message_id;type:varchar(64)" json:"message_id"\`
	SessionID int64     \`gorm:"column:session_id;index;not null" json:"session_id"\`
	Text      string    \`gorm:"column:text;type:text" json:"text"\`
	Role      string    \`gorm:"column:role;type:varchar(32)" json:"role"\`
	CreatedAt time.Time \`gorm:"column:created_at;autoCreateTime" json:"created_at"\`
	UpdatedAt time.Time \`gorm:"column:updated_at;autoUpdateTime" json:"updated_at"\`
}`}
          highlights={[
            { java: '@TableId(value = "message_id")', go: 'gorm:"primaryKey;column:message_id"' },
            { java: 'Instant createdAt', go: 'time.Time' },
            { java: 'EnumTypeHandler.class', go: '在 Go 中通常直接解构为结构体字段，零反射开销' },
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【基础】API 接收与响应：Spring MVC @RestController vs Gin Route & JSON Bind</h3>
        <p className="text-muted-fg leading-relaxed">
          Java Spring Boot 中通过控制器接收 JSON 请求并自动反序列化为实体或 DTO，使用 <code>@RequestBody</code> 结合 Spring Web 的 Mapping 注解。
          Go 提倡显式绑定与显式控制，使用 Gin Web 框架配合结构体 tag (如 <code>json</code> 和 <code>binding</code>)，使用指针将请求体绑定到结构体实例。
        </p>

        <CodeDuel
          title="Spring MVC @RestController API vs Gin Route & Binding"
          javaCode={`// Java: Spring MVC 声明式控制器
@RestController
@RequestMapping("/api/chat")
public class ChatController {
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody MessageDTO dto) {
        if (dto.getText() == null || dto.getText().isEmpty()) {
            return ResponseEntity.badRequest().body("text cannot be empty");
        }
        return ResponseEntity.ok(new Response("success", 200));
    }
}`}
          goCode={`// Go: Gin 路由与指针绑定校验，显式返回 JSON
type MessageReq struct {
	Text string \`json:"text" binding:"required"\`
}

func RegisterChatRoutes(r *gin.Engine) {
	r.POST("/api/chat/send", func(c *gin.Context) {
		var req MessageReq
		// 显式指针绑定并校验
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "success", "code": 200})
	})
}`}
          highlights={[
            { java: '@RequestBody 自动解析', go: 'ShouldBindJSON(&req) 指针映射绑定' },
            { java: 'ResponseEntity.ok', go: 'c.JSON 显式序列化回写' },
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【基础】单表数据库操作：MyBatis-Plus CRUD 隐式继承 vs GORM 显式指针操控</h3>
        <p className="text-muted-fg leading-relaxed">
          MyBatis-Plus 通过让 Mapper 接口继承 <code>BaseMapper&lt;T&gt;</code>，在编译/运行期动态生成全套单表 CRUD 动作。
          GORM 则提倡通过 GORM 数据库实例（<code>*gorm.DB</code>）配合结构体指针直接进行操作。在 Go 中执行查询或插入时，必须传入<strong>实体指针</strong>，以便 GORM 将操作后的自增 ID 或结果数据集直接回写到对应内存中。
        </p>

        <CodeDuel
          title="MyBatis-Plus 单表 CRUD vs GORM 指针查询与插入"
          javaCode={`// Java: MyBatis-Plus 通过继承 BaseMapper 提供单表 CRUD
@Service
public class UserService {
    @Autowired
    private UserMapper userMapper; // 继承自 BaseMapper<UserEntity>

    public UserEntity getUserAndInsert(UserEntity newUser, Long id) {
        // 1. 插入新记录，MyBatis-Plus 会自动将自增 ID 填充回实体对象中
        userMapper.insert(newUser);
        
        // 2. 根据主键 ID 进行单表查询
        return userMapper.selectById(id);
    }
}`}
          goCode={`// Go: GORM 显式传入指针完成单表操作，将结果回写到对应结构体中
package service

import (
	"context"
	"gorm.io/gorm"
)

type User struct {
	ID   int64  \`gorm:"primaryKey;column:id"\`
	Name string \`gorm:"column:name"\`
}

type UserService struct {
	db *gorm.DB
}

func (s *UserService) GetUserAndInsert(ctx context.Context, newUser *User, id int64) (*User, error) {
	// 1. 插入新记录。必须传入实体指针（&newUser），GORM 会在插入成功后，将主键自增 ID 写入该指针指向的对象中
	err := s.db.WithContext(ctx).Create(newUser).Error
	if err != nil {
		return nil, err
	}

	var user User
	// 2. 根据主键查询。必须传入结果结构体的指针 &user
	// First 会自动添加 LIMIT 1，并且如果未找到记录会返回 gorm.ErrRecordNotFound 错误
	err = s.db.WithContext(ctx).First(&user, id).Error
	if err != nil {
		return nil, err
	}

	return &user, nil
}`}
          highlights={[
            { java: 'userMapper.insert(newUser)', go: 'db.Create(newUser) 传入结构体指针' },
            { java: 'userMapper.selectById(id)', go: 'db.First(&user, id) 显式反射回填数据' },
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【中等】数据库复杂 JSONB 类型在 Go 中的 Scanner/Valuer 实现</h3>
        <p className="text-muted-fg leading-relaxed">
          Java <code>ConversationMessageEntity</code> 中包含 <code>raw_payload</code> 字段（用来存储插件回调的原始 Payload，为 JSONB 格式）。Java 通常要写自定义的 MyBatis <code>TypeHandler</code>。在 Go 中，我们只需要实现标准库 <code>database/sql/driver</code> 的 <code>Valuer</code> 与 <code>Scanner</code> 接口：
        </p>

        <pre className="text-xs font-mono bg-code-bg p-4 rounded-lg text-zinc-300 my-4 overflow-x-auto">
{`package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

// RawPayload 为自定义 Map 类型
type RawPayload map[string]interface{}

// Value 实现 driver.Valuer 接口：在数据存入 PostgreSQL 前，自动将 Map 序列化为 JSON 字符串
func (p RawPayload) Value() (driver.Value, error) {
	if len(p) == 0 {
		return nil, nil
	}
	bytes, err := json.Marshal(p)
	if err != nil {
		return nil, fmt.Errorf("marshal payload to json failed: %w", err)
	}
	return string(bytes), nil
}

// Scan 实现 sql.Scanner 接口：从 PostgreSQL 读取 JSON 字节流时，自动反序列化为 Go Map 结构
func (p *RawPayload) Scan(value interface{}) error {
	if value == nil {
		*p = make(RawPayload)
		return nil
	}
	
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return fmt.Errorf("unsupported database type: %T", value)
	}
	
	return json.Unmarshal(bytes, p)
}`}
        </pre>

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【高级】声明式 `@Transactional` 动态代理陷阱与 Go 显式双向事务控制</h3>
        <p className="text-muted-fg leading-relaxed">
          Spring Boot 项目中如果同类内部自调用带有 <code>@Transactional</code> 的方法，由于没有经过 AOP 动态代理，事务会直接**失效**。
          Go 的设计模式则是强显式调用，我们通过 <code>db.Begin()</code>、<code>defer tx.Rollback()</code> 保证哪怕中间 panic，事务也绝对百分百回滚：
        </p>

        <CodeDuel
          title="Spring @Transactional AOP 动态代理失效自调用 vs Go 显式事务控制"
          javaCode={`// Java: Spring @Transactional 动态代理失效示例
@Service
public class MessageService {

    // 外部调用本方法，由于此方法没有 @Transactional
    // 即使内部调用了 doSave，事务也会静默失效！
    public void saveMessage(ConversationMessage msg) {
        doSave(msg); 
    }

    @Transactional
    public void doSave(ConversationMessage msg) {
        messageRepository.save(msg);
        sessionRepository.updateActiveTime(msg.getSessionId());
    }
}`}
          goCode={`// Go: 显式声明与 Deferred 安全回滚
func (s *MessageService) SaveMessage(ctx context.Context, msg *ConversationMessage) error {
	// 1. 显式开启事务
	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return tx.Error
	}
	
	// 2. 无论中间代码以任何形式报错退出，都会触发 Rollback
	// 如果下面 tx.Commit() 成功，tx.Rollback() 在运行时会自动变为 no-op
	defer tx.Rollback()

	// 3. 执行物理 SQL
	if err := tx.Create(msg).Error; err != nil {
		return fmt.Errorf("create message failed: %w", err)
	}

	// 4. 执行更新
	if err := tx.Table("conversation_session").
		Where("id = ?", msg.SessionID).
		Update("last_active_at", msg.CreatedAt).Error; err != nil {
		return fmt.Errorf("update session failed: %w", err)
	}

	// 5. 显式 Commit 提交事务
	return tx.Commit().Error
}`}
          highlights={[
            { java: 'public void saveMessage', go: 'Go 显式声明依赖和事务对象，绝不依赖代理' },
            { java: '@Transactional', go: 'tx := s.db.WithContext(ctx).Begin()' },
            { java: 'sessionRepository.updateActiveTime', go: 'defer tx.Rollback()' },
          ]}
        />
      </section>

      {/* Section 9.3 */}
      <section id="proj-auth" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">9.3</span>
          双端鉴权与会话隔离：Sa-Token {"->"} Go JWT & Redis
        </h2>
        
        <h3 className="text-lg font-semibold mt-4 text-foreground/90">【基础】Sa-Token 魔法与 Go 显式 Claims 结构体</h3>
        <p className="text-muted-fg leading-relaxed">
          Java <code>rorolee-bot-oversea</code> 利用 Sa-Token 的 <code>loginType=front-bot</code> 和 <code>loginType=admin-bot</code> 机制对前后台用户进行会话隔离。
          在 Go 中，我们自定义包含 <code>LoginType</code> 字段的 JWT Claims 结构体进行显式表达：
        </p>

        <pre className="text-xs font-mono bg-code-bg p-4 rounded-lg text-zinc-300 my-4 overflow-x-auto">
{`package security

import (
	"time"
	"github.com/golang-jwt/jwt/v5"
)

type CustomClaims struct {
	UserID    int64  \`json:"user_id"\`
	LoginType string \`json:"login_type"\` // "front-bot" 或 "admin-bot"
	jwt.RegisteredClaims
}

func GenerateToken(userID int64, loginType string, secret []byte) (string, error) {
	claims := CustomClaims{
		UserID:    userID,
		LoginType: loginType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * 30 * time.Hour)), // 30天过期
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}`}
        </pre>

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【中等】会话隔离机制：Java ThreadLocal 隐式变量 vs Go Context 显式传递</h3>
        <p className="text-muted-fg leading-relaxed">
          Java Spring Boot 中常通过静态 <code>ThreadLocal</code> (例如在拦截器里设置) 在当前线程的生命周期内共享用户信息。
          由于 Go 的 Goroutine 是非绑定的，底层可能会在不同线程间切换，因此不支持 ThreadLocal 机制。Go 推荐将用户信息显式存入 <code>context.Context</code> 并在 Service 与 Repository 各层中显式传递。
        </p>

        <CodeDuel
          title="ThreadLocal 静态绑定 vs context.Context 显式级联传递"
          javaCode={`// Java: 使用 ThreadLocal 存储当前线程的上下文信息
public class UserContext {
    private static final ThreadLocal<Long> userContext = new ThreadLocal<>();
    
    public static void setUserId(Long userId) {
        userContext.set(userId);
    }
    
    public static Long getUserId() {
        return userContext.get();
    }
    
    public static void clear() {
        userContext.remove();
    }
}

// 业务层不需要显式传参，直接静态获取
@Service
public class OrderService {
    public void createOrder() {
        Long userId = UserContext.getUserId(); // 隐式获取当前线程对应的用户ID
        // ...
    }
}`}
          goCode={`// Go: 显式在 Context 中注入并读取用户上下文，各层函数必须首参显式传参
package service

import (
	"context"
	"errors"
)

type contextKey string
const userKey contextKey = "userId"

// 注入用户ID到上下文
func WithUserID(ctx context.Context, userID int64) context.Context {
	return context.WithValue(ctx, userKey, userID)
}

// 提取上下文中的用户ID
func GetUserID(ctx context.Context) (int64, error) {
	userID, ok := ctx.Value(userKey).(int64)
	if !ok {
		return 0, errors.New("user ID not found in context")
	}
	return userID, nil
}

type OrderService struct{}

func (s *OrderService) CreateOrder(ctx context.Context) error {
	// 显式从 context 传参中读取关联属性
	userID, err := GetUserID(ctx)
	if err != nil {
		return err
	}
	// 使用 userID 执行下单逻辑...
	_ = userID
	return nil
}`}
          highlights={[
            { java: 'ThreadLocal.get() 静态无参调用', go: 'ctx.Value() 显式在 context 首参中传递读取' },
            { java: '单线程绑定 (隐式)', go: '基于 Context 的协程安全显式级联透传' },
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【中等】双端 JWT 拦截与 go-redis 黑名单状态联动中间件</h3>
        <p className="text-muted-fg leading-relaxed">
          利用 Gin 管道式中间件（Middleware），我们截获客户端上报的 JWT 头，判定业务隔离逻辑，并通过 Redis 实时校核该 Token 是否在注销或冻结黑名单中：
        </p>

        <pre className="text-xs font-mono bg-code-bg p-4 rounded-lg text-zinc-300 my-4 overflow-x-auto">
{`package middleware

import (
	"context"
	"fmt"
	"strings"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
)

func AuthMiddleware(expectedType string, secret []byte, rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(401, gin.H{"error": "Authorization header must start with Bearer"})
			c.Abort() // 拦截路由链，阻断下游 Handler 执行
			return
		}
		tokenStr := authHeader[7:]

		claims := &CustomClaims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return secret, nil
		})

		if err != nil || !token.Valid || claims.LoginType != expectedType {
			c.JSON(401, gin.H{"error": "invalid access token"})
			c.Abort()
			return
		}

		// 联动 Redis：检查该 Token 是否在 Redis 废弃黑名单中 (支持多端注销或强制踢下线)
		blacklistKey := fmt.Sprintf("token:blacklist:%s", tokenStr)
		isBlack, err := rdb.Exists(context.Background(), blacklistKey).Result()
		if err == nil && isBlack > 0 {
			c.JSON(401, gin.H{"error": "token has been revoked"})
			c.Abort()
			return
		}

		// 将提取到的关键用户 ID 通过 Gin 上下文隐式向下传递，类似 ThreadLocal 的存储效果，但属于协程安全
		c.Set("userId", claims.UserID)
		c.Set("loginType", claims.LoginType)
		
		c.Next() // 允许进入核心控制器
	}
}`}
        </pre>

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【高级】并发热点防护：基于 Singleflight 规避用户认证缓存击穿</h3>
        <p className="text-muted-fg leading-relaxed">
          大流量 AI 网关在遭遇大量并发请求且 Redis 缓存过期的瞬间，若不加防范，海量查询会击穿到后端 PostgreSQL，造成数据库崩溃。
          在 Go 中，我们利用并发协调原语 <code>golang.org/x/sync/singleflight</code> 来合并这波流量：
        </p>

        <pre className="text-xs font-mono bg-code-bg p-4 rounded-lg text-zinc-300 my-4 overflow-x-auto">
{`package security

import (
	"context"
	"fmt"
	"time"
	"github.com/redis/go-redis/v9"
	"golang.org/x/sync/singleflight"
	"gorm.io/gorm"
)

type UserCacheManager struct {
	db        *gorm.DB
	rdb       *redis.Client
	sfGroup   singleflight.Group
}

func (m *UserCacheManager) GetUserStatusCached(ctx context.Context, userID int64) (string, error) {
	cacheKey := fmt.Sprintf("user:status:%d", userID)
	
	// 1. 尝试从 Redis 缓存中获取状态
	status, err := m.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		return status, nil
	}

	// 2. 缓存失效，进入 singleflight 合并查询逻辑
	// Do 方法保证并发的多个协程中只有一个协程真正执行闭包函数，其余协程挂起等待该函数的结果
	val, err, shared := m.sfGroup.Do(cacheKey, func() (interface{}, error) {
		var userStatus string
		// 执行数据库查询
		err := m.db.WithContext(ctx).Table("front_bot_user").
			Select("status").Where("id = ?", userID).Scan(&userStatus).Error
		if err != nil {
			return "", err
		}

		// 重新刷回 Redis 缓存，有效期 10 分钟
		m.rdb.Set(ctx, cacheKey, userStatus, 10*time.Minute)
		return userStatus, nil
	})

	if err != nil {
		return "", err
	}
	return val.(string), nil
}`}
        </pre>
      </section>

      {/* Section 9.4 */}
      <section id="proj-chat" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">9.4</span>
          AI 消息链路与流通道：Spring MVC {"->"} Gin & Channel & Context
        </h2>
        
        <h3 className="text-lg font-semibold mt-4 text-foreground/90">【基础】Java 阻塞线程与 Go 轻量级 Goroutine 协作</h3>
        <p className="text-muted-fg leading-relaxed">
          在 Java 中，高并发往往需要庞大的线程池（Thread Pool）支撑。在 Go 中，协程极其轻量且默认异步化，这使得高频请求的 I/O 处理非常廉价。
        </p>

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【中等】AI 下游流式 API 管道化转发：Spring WebFlux 响应式 vs Go HTTP Client & Body Reader 管道化</h3>
        <p className="text-muted-fg leading-relaxed">
          在大模型流式生成（SSE）场景下，服务端不仅要自己能产生流，更需要请求下游第三方大模型接口（如 OpenAI），并将响应数据实时流式透明转发给前端。
          Java 往往推荐使用响应式编程库 WebFlux 的 <code>WebClient</code>，返回 <code>Flux&lt;String&gt;</code> 进行处理；
          Go 则依然推崇极简的“数据物理管道”思想，在发起下游 HTTP 请求后，直接利用标准库的 <code>bufio.NewReader</code> 逐行读取并即时写回 HTTP 响应管道。
        </p>

        <CodeDuel
          title="Spring WebFlux WebClient 转发 vs Go Http Body Reader 管道化转发"
          javaCode={`// Java: Spring WebFlux 使用 WebClient 异步接收下游大模型流并转发
@GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> streamChat(@RequestParam String prompt) {
    // 1. 使用 WebClient 请求大模型服务端的 Stream 接口
    return webClient.post()
        .uri("/v1/chat/completions")
        .bodyValue(new ChatRequest(prompt))
        .retrieve()
        .bodyToFlux(String.class) // 2. 将下游 SSE 转化为响应式 Flux 流
        .map(data -> "data: " + data + "\\n\\n") // 3. 重新包装为标准 SSE 格式输出给前端
        .onErrorResume(e -> Flux.just("data: [ERROR]\\n\\n"));
}`}
          goCode={`// Go: 使用原生 http.Client 读取下游响应体流，非阻塞逐行读取并写入 Gin Stream 中
package controller

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"github.com/gin-gonic/gin"
)

func StreamAIResponse(c *gin.Context) {
	// 1. 构造请求并注入上游 Context 建立超时链路级联绑定
	payload, _ := json.Marshal(map[string]string{"prompt": c.Query("prompt")})
	req, _ := http.NewRequestWithContext(c.Request.Context(), "POST", "https://api.openai.com/v1/chat/completions", bytes.NewReader(payload))
	
	// 2. 发起 HTTP 请求
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer resp.Body.Close() // 3. 必须 defer 关闭响应体以防止连接泄露

	// 4. 设置流式 HTTP Response 头部
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")

	// 5. 使用 bufio.Reader 逐行读取大模型响应流，避免全量读入内存导致 OOM
	reader := bufio.NewReader(resp.Body)
	c.Stream(func(w io.Writer) bool {
		// 6. 逐行读取数据（以 \\n 结尾）
		line, err := reader.ReadBytes('\\n')
		if err != nil {
			if err == io.EOF {
				return false // 下游流结束，正常退出
			}
			return false // 读取异常，断开连接
		}
		
		// 7. 直接将原始 SSE 数据帧转发写回给前端客户端
		_, _ = w.Write(line)
		return true // 继续下一轮循环读取
	})
}`}
          highlights={[
            { java: 'WebClient + Flux<String> 响应式流', go: 'http.Client + bufio.Reader 逐行物理管道' },
            { java: '依赖 RxJava/Reactor 反应式链条', go: 'c.Stream 闭包循环，物理控制极其直观' },
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【中等】基于 Channel 和 Select 搭建高性能 SSE 流式 API</h3>
        <p className="text-muted-fg leading-relaxed">
          语音助手等大模型场景的流式返回（Server-Sent Events, SSE），在 Go 中利用 <code>c.Writer.Flush()</code> 以及 <code>channel</code> 可以在极低内存占用的情况下非阻塞输出：
        </p>

        <pre className="text-xs font-mono bg-code-bg p-4 rounded-lg text-zinc-300 my-4 overflow-x-auto">
{`package controller

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"github.com/gin-gonic/gin"
)

type ChatStreamHandler struct {
	aiService *AIService
}

func (h *ChatStreamHandler) HandleStream(c *gin.Context) {
	prompt := c.Query("prompt")
	if prompt == "" {
		c.JSON(400, gin.H{"error": "prompt query param is required"})
		return
	}

	// 1. 设置 HTTP 头部以支持 Server-Sent Events 流式输出
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Transfer-Encoding", "chunked")

	// 创建一个与当前网络请求生命周期绑定的 Channel，用于接收生成的文本片断
	tokenCh := make(chan string, 10)
	
	// 2. 异步启动大模型推理计算，将 channel 传入
	go h.aiService.GenerateTextStream(c.Request.Context(), prompt, tokenCh)

	// 3. 使用 Writer 进行流式迭代写回客户端
	c.Stream(func(w io.Writer) bool {
		select {
		case <-c.Request.Context().Done():
			// 监控到客户端已经挂断（如关闭浏览器），主动退出循环
			return false
		case token, ok := <-tokenCh:
			if !ok {
				// 推理完毕，服务端主动关闭 channel，通知客户端流结束
				c.SSEvent("message", "[DONE]")
				return false
			}
			// 向客户端推送标准的 SSE 数据帧
			c.SSEvent("message", token)
			return true
		}
	})
}`}
        </pre>

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【高级】悬挂防护：Context 超时链路物理中断技术</h3>
        <p className="text-muted-fg leading-relaxed">
          当客户端异常断开或遭遇慢 SQL 查询时，Java 往往只能静默执行完毕才释放数据库连接，导致池被瞬间占满。
          在 Go 中，我们利用 <code>context.Context</code> 来级联打断外部 API 请求和 GORM 的 SQL 执行，真正做到网络中断物理打断：
        </p>

        <pre className="text-xs font-mono bg-code-bg p-4 rounded-lg text-zinc-300 my-4 overflow-x-auto">
{`package service

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"
)

type AIService struct{}

func (s *AIService) DispatchChatWithTimeout(parentCtx context.Context, prompt string) (string, error) {
	// 创建一个超时时间为 3 秒的子上下文
	ctx, cancel := context.WithTimeout(parentCtx, 3*time.Second)
	defer cancel() // 必须 defer 显式调用 cancel，释放定时器资源

	payload, _ := json.Marshal(map[string]string{"prompt": prompt})
	
	// 将带超时控制的 context 注入到 HTTP 报文请求中
	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.openclaw.ai/v1/chat", bytes.NewBuffer(payload))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	// 若大模型接口响应时长超出 3 秒，Go 底层网络轮询器 (Network Poller) 会物理切断底层 TCP Socket 链路，
	// 并由 http.DefaultClient.Do 立即抛出 context deadline exceeded 错误！
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		if errors.Is(ctx.Err(), context.DeadlineExceeded) {
			return "", errors.New("upstream AI api response timeout, HTTP connection killed")
		}
		return "", err
	}
	defer resp.Body.Close()

	return "success", nil
}`}
        </pre>
      </section>

      {/* Section 9.5 */}
      <section id="proj-mq" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">9.5</span>
          异步队列与三方校验：Spring AMQP {"->"} Go Consumer & Payments
        </h2>
        
        <h3 className="text-lg font-semibold mt-4 text-foreground/90">【基础】Spring `@RabbitListener` 转化为 Go 手动通道监听</h3>
        <p className="text-muted-fg leading-relaxed">
          在 Java 中，我们通过框架注解自动开启 MQ 监听。在 Go 中，我们通过手写显式拉取数据循环进行表达，逻辑链路没有遮蔽：
        </p>

        <CodeDuel
          title="RabbitMQ 并发消费与手工确认 (Ack)"
          javaCode={`// Java: Spring 声明式消费模型
@Component
public class DeviceCommandConsumer {
    @RabbitListener(queues = "\${app.device-command.queue}", ackMode = "MANUAL")
    public void onMessage(DeviceCommand msg, Channel channel, Message rawMsg) throws IOException {
        try {
            pythonCommandService.dispatch(msg);
            // 显式手工 Ack 确认
            channel.basicAck(rawMsg.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception ex) {
            // Nack 拒绝并重入队列
            channel.basicNack(rawMsg.getMessageProperties().getDeliveryTag(), false, true);
        }
    }
}`}
          goCode={`// Go: amqp091 手工通道阻塞消费迭代
func RunMQConsumer(conn *amqp.Connection, queueName string) {
	ch, _ := conn.Channel()
	defer ch.Close()

	// 声明消费通道，设置非自动确认 (autoAck = false)
	msgs, _ := ch.Consume(queueName, "", false, false, false, false, nil)

	// Go 语言使用 range 直接对网络连接中的推送通道进行迭代，当无消息时会阻塞在 for 循环处
	for d := range msgs {
		err := dispatchCommand(d.Body)
		if err != nil {
			// Nack 并决定是否重新回流进队列 (requeue = true)
			d.Nack(false, true)
		} else {
			// 成功确认
			d.Ack(false)
		}
	}
}`}
          highlights={[
            { java: '@RabbitListener', go: 'ch.Consume 并利用 range 进行迭代' },
            { java: 'channel.basicAck', go: 'd.Ack(false)' },
            { java: 'ackMode = "MANUAL"', go: '设置 autoAck 为 false' },
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【中等】基于 Goroutine Worker Pool 实现高并发 RabbitMQ 消费池</h3>
        <p className="text-muted-fg leading-relaxed">
          Java 需要微调 Spring Concurrency 容器属性。Go 利用强大的并发内建，只需要起一个 Worker Pool 协程池即可吞吐数十万并发消息：
        </p>

        <pre className="text-xs font-mono bg-code-bg p-4 rounded-lg text-zinc-300 my-4 overflow-x-auto">
{`package mq

import (
	"log"
	"github.com/rabbitmq/amqp091-go"
)

func StartConcurrentMQWorkers(conn *amqp091.Connection, queueName string, workerCount int) {
	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("failed to open channel: %v", err)
	}

	// 设置 Qos PrefetchCount，让 MQ 均匀分发，避免某些 worker 空闲而某些被压垮
	_ = ch.Qos(10, 0, false)

	msgs, err := ch.Consume(queueName, "", false, false, false, false, nil)
	if err != nil {
		log.Fatalf("failed to consume queue: %v", err)
	}

	// 启动 workerCount 数量的协程，共同共享监听同一个底层连接的消息通道，由 runtime 自动完成多核任务调度
	for i := 0; i < workerCount; i++ {
		go func(workerID int) {
			log.Printf("Goroutine MQ Worker [%d] started", workerID)
			for d := range msgs {
				// 执行复杂消费业务
				if err := processMessagePayload(d.Body); err != nil {
					log.Printf("Worker [%d] handle failed: %v", workerID, err)
					d.Nack(false, false) // 丢弃或发送到死信队列
				} else {
					d.Ack(false)
				}
			}
		}(i)
	}
}`}
        </pre>

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【中等】连接容灾控制：Spring AMQP 底层自愈机制 vs Go 监听关闭重连死循环</h3>
        <p className="text-muted-fg leading-relaxed">
          在大规模生产环境中，网络瞬间抖动断连是常态。Java Spring AMQP (RabbitMQ) 内部具备完善的断线自动恢复机制（<code>spring.rabbitmq.listener.simple.auto-startup</code>）。
          但在 Go 的 <code>amqp091-go</code> 库中，一旦物理 TCP 连接断开，原有的 Channel 与 Connection 实例会立刻失效并且<strong>不会自动重建</strong>。我们必须注册 <code>NotifyClose</code> 监听信道关闭事件，并套在外层 <code>for</code> 死循环中手动完成连接与消费者信道的级联重构。
        </p>

        <CodeDuel
          title="Spring 自动连接恢复 vs Go NotifyClose 显式重连循环"
          javaCode={`// Java: Spring AMQP 在底层封装了自愈恢复机制
// 我们仅需配置超时，框架会在连接意外断开后自动尝试重建 Connection 和 Channel 并重绑监听器
spring.rabbitmq.connection-timeout=60000
spring.rabbitmq.listener.simple.retry.enabled=true
spring.rabbitmq.listener.simple.retry.max-attempts=3
spring.rabbitmq.listener.simple.retry.initial-interval=5000ms`}
          goCode={`// Go: 显式利用 NotifyClose 信号在死循环中重置并重建连接与订阅通道
package mq

import (
	"log"
	"time"
	"github.com/rabbitmq/amqp091-go"
)

func StartReconnectingConsumer(amqpURL string, queueName string) {
	for {
		log.Printf("Connecting to RabbitMQ: %s", amqpURL)
		conn, err := amqp091.Dial(amqpURL)
		if err != nil {
			log.Printf("Failed to connect, retry after 5s: %v", err)
			time.Sleep(5 * time.Second)
			continue
		}

		ch, err := conn.Channel()
		if err != nil {
			conn.Close()
			time.Sleep(5 * time.Second)
			continue
		}

		// 1. 创建用于监听连接意外关闭事件的 Go Channel
		closeCh := make(chan *amqp091.Error)
		conn.NotifyClose(closeCh)

		msgs, err := ch.Consume(queueName, "", false, false, false, false, nil)
		if err != nil {
			ch.Close()
			conn.Close()
			time.Sleep(5 * time.Second)
			continue
		}

		// 2. 启动异步 Goroutine 处理消息
		go func() {
			for d := range msgs {
				// 执行具体业务逻辑并应答
				d.Ack(false)
			}
		}()

		// 3. 阻塞在此处。一旦网络或 Broker 发生故障导致 TCP 链路物理关闭，
		// closeCh 会抛出关闭原因的错误对象，从而打破阻塞解除挂起
		errReason := <-closeCh
		log.Printf("RabbitMQ Connection lost: %v. Initiating reconnection...", errReason)
		
		// 自动级联清理旧句柄，然后重新进入 for 循环重建环境
		_ = ch.Close()
		_ = conn.Close()
	}
}`}
          highlights={[
            { java: 'spring.rabbitmq 自动配置自愈', go: 'closeCh := make(chan *amqp091.Error) 监听事件' },
            { java: '框架自动重声明与消费者注册', go: '在外层套用 for { ... } 死循环机制手工拉起链路' },
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【高级】核心支付业务：Stripe Webhook 签名与 Redis 分布式防重入事务控制</h3>
        <p className="text-muted-fg leading-relaxed">
          当 Stripe 成功划款时会向服务端发送 Webhook 异步回调。在 Go 中，我们必须验证 **Stripe-Signature 签名** 以防止黑客伪造支付请求，并引入 Redis 分布式防并发防重入锁，确保加积分操作幂等。
        </p>

        <pre className="text-xs font-mono bg-code-bg p-4 rounded-lg text-zinc-300 my-4 overflow-x-auto">
{`package payment

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/webhook"
	"gorm.io/gorm"
)

type StripeWebhookHandler struct {
	db            *gorm.DB
	rdb           *redis.Client
	webhookSecret string
}

func NewStripeWebhookHandler(db *gorm.DB, rdb *redis.Client, secret string) *StripeWebhookHandler {
	return &StripeWebhookHandler{db: db, rdb: rdb, webhookSecret: secret}
}

func (h *StripeWebhookHandler) HandleWebhook(c *gin.Context) {
	// 1. Stripe 要求从原始 HTTP Body 报文中获取签名，不允许使用 JSON 解析后的数据
	payload, err := c.GetRawData()
	if err != nil {
		c.JSON(400, gin.H{"error": "Failed to read request body"})
		return
	}

	sigHeader := c.GetHeader("Stripe-Signature")
	
	// 2. 调用 Stripe SDK 进行 HMAC 签名校核，阻断攻击
	event, err := webhook.ConstructEvent(payload, sigHeader, h.webhookSecret)
	if err != nil {
		c.JSON(401, gin.H{"error": fmt.Sprintf("invalid signature: %v", err)})
		return
	}

	// 3. 过滤处理 payment_intent.succeeded
	if event.Type == "payment_intent.succeeded" {
		var paymentIntent stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &paymentIntent); err != nil {
			c.JSON(400, gin.H{"error": "invalid event payload"})
			return
		}

		// 获取交易订单参数 (元数据由发起 Stripe 支付时注入)
		paymentNo := paymentIntent.Metadata["payment_no"]
		userIDStr := paymentIntent.Metadata["user_id"]
		if paymentNo == "" || userIDStr == "" {
			c.JSON(400, gin.H{"error": "missing payment metadata"})
			return
		}

		// 4. 用户支付防重入分布式锁保护
		// 利用 Redis SetNX 实现原子加锁，并设定 30 秒超时，防止服务器突然崩溃导致死锁
		lockKey := fmt.Sprintf("front:user:credits:%s", userIDStr)
		acquired, err := h.rdb.SetNX(context.Background(), lockKey, "1", 30*time.Second).Result()
		if err != nil || !acquired {
			c.JSON(409, gin.H{"error": "another payment settlement in progress"})
			return
		}
		defer h.rdb.Del(context.Background(), lockKey) // 流程结束释放锁

		// 5. 显式开启 GORM 事务完成入账
		tx := h.db.Begin()
		defer tx.Rollback()

		var payment model.DeoPayment
		// 校验当前订单在数据库中是否已经是终结态（防网络二次推送重复累加）
		if err := tx.Where("payment_no = ?", paymentNo).First(&payment).Error; err != nil {
			c.JSON(404, gin.H{"error": "payment order not found"})
			return
		}

		if payment.PaymentStatus == 1 { // 1 代表已经结算支付成功
			c.JSON(200, gin.H{"status": "duplicated"})
			return
		}

		// 执行状态变更
		payment.PaymentStatus = 1 // Succeeded
		payment.PaidAt = time.Now()
		if err := tx.Save(&payment).Error; err != nil {
			return
		}

		// 赠送用户套餐套餐积分
		if err := h.grantCredits(tx, payment.UserID, payment.Amount); err != nil {
			return
		}

		// 提交事务
		tx.Commit()
	}

	c.JSON(200, gin.H{"status": "ok"})
}

func (h *StripeWebhookHandler) grantCredits(tx *gorm.DB, userID int64, amount int64) error {
	// 执行增加额度的业务逻辑 (GORM 事务中执行)
	return tx.Table("front_user_limit").
		Where("user_id = ?", userID).
		UpdateColumn("credits", gorm.Expr("credits + ?", amount)).Error
}`}
        </pre>

        <h3 className="text-lg font-semibold mt-6 text-foreground/90">【高级】核心支付业务：Apple IAP App Store Server V2 凭证链 JWS 解密与校验</h3>
        <p className="text-muted-fg leading-relaxed">
          Apple App Store V2 接口及 Webhook 均抛弃了传统的 Base64 脏数据校验，改用高度严谨的 **JWS (JSON Web Signature)** 格式。
          JWS 数据分为三段 <code>Header.Payload.Signature</code>。我们需要解析 Header 提取苹果根证书，并利用 Go 标准包 <code>crypto/x509</code> 实现完整的 X509 信任链验签，最终在 Go 中进行原生解码：
        </p>

        <pre className="text-xs font-mono bg-code-bg p-4 rounded-lg text-zinc-300 my-4 overflow-x-auto">
{`package payment

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"github.com/golang-jwt/jwt/v5"
)

// Apple JWS 证书信任链验证与载荷解密器
type AppleIapVerifier struct {
	appleRootCert *x509.Certificate // 预加载 Apple 的根证书 (Apple Root CA - G3)
}

// App Store V2 JWS 交易明细载荷格式定义
type JWSTransactionDecodedPayload struct {
	TransactionID string \`json:"transactionId"\`
	OriginalTxID  string \`json:"originalTransactionId"\`
	ProductID     string \`json:"productId"\`
	Quantity      int    \`json:"quantity"\`
	PurchaseDate  int64  \`json:"purchaseDate"\`
	RevocationDate int64 \`json:"revocationDate"\` // 若非 0 说明已被撤销/退款
	BundleID      string \`json:"bundleId"\`
}

func (v *AppleIapVerifier) VerifyAndDecode(jwsToken string) (*JWSTransactionDecodedPayload, error) {
	parts := strings.Split(jwsToken, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid JWS token format")
	}

	// 1. 解析 JWT Header 结构
	headerJSON, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return nil, fmt.Errorf("decode header failed: %w", err)
	}

	var header struct {
		X5c []string \`json:"x5c"\` // 证书链数组，包含了从叶子证书到中间证书的 base64 字节
	}
	if err := json.Unmarshal(headerJSON, &header); err != nil || len(header.X5c) == 0 {
		return nil, errors.New("x5c certificates chain missing in header")
	}

	// 2. 将 x5c 证书库链逐级解析为 x509 证书实例
	var certs []*x509.Certificate
	for _, x5cItem := range header.X5c {
		certBytes, err := base64.StdEncoding.DecodeString(x5cItem)
		if err != nil {
			return nil, fmt.Errorf("failed to decode certificate base64: %w", err)
		}
		cert, err := x509.ParseCertificate(certBytes)
		if err != nil {
			return nil, fmt.Errorf("failed to parse x509 certificate: %w", err)
		}
		certs = append(certs, cert)
	}

	// 3. 构建苹果 x509 证书校验信任链
	roots := x509.NewCertPool()
	roots.AddCert(v.appleRootCert) // 添加预加载的官方 Apple 根证书

	intermediates := x509.NewCertPool()
	for i := 1; i < len(certs); i++ {
		intermediates.AddCert(certs[i]) // 将除叶子证书外的所有中间证书放入备检池
	}

	verifyOpts := x509.VerifyOptions{
		Roots:         roots,
		Intermediates: intermediates,
		KeyUsages:     []x509.ExtKeyUsage{x509.ExtKeyUsageAny},
	}

	// 4. 执行链式安全校核
	if _, err := certs[0].Verify(verifyOpts); err != nil {
		return nil, fmt.Errorf("apple certificate chain verification failed: %w", err)
	}

	// 5. 叶子证书验证成功，提取其公钥以解密 JWT Signature 签名
	pubKey, ok := certs[0].PublicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, errors.New("leaf certificate public key is not ECDSA public key")
	}

	// 6. 使用 JWT 库并以叶子证书的 ECDSA 公钥进行校验
	token, err := jwt.Parse(jwsToken, func(t *jwt.Token) (interface{}, error) {
		return pubKey, nil
	})
	if err != nil || !token.Valid {
		return nil, fmt.Errorf("JWS token signature check failed: %w", err)
	}

	// 7. 解析数据载荷
	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("decode payload payload bytes failed: %w", err)
	}

	var payload JWSTransactionDecodedPayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return nil, fmt.Errorf("unmarshal payload failed: %w", err)
	}

	return &payload, nil
}`}
        </pre>
      </section>

      {/* Interactive Coding exercise */}
      <section id="proj-wiring" className="scroll-mt-24 mb-16">
        <GoPlayground
          id="proj-manual-wiring"
          title="练习：手动组装项目依赖"
          difficulty="medium"
          description="在企业级 Go 项目中，所有层级依赖都是自底向上人工装配完成的。请补全 main 函数中的依赖组装逻辑：首先基于 dsn 参数实例化 DB 连接池指针，然后创建 UserRepository 实例，接着创建 UserService 实例并传入依赖，最终运行 svc.Register 逻辑。"
          starterCode={`package main

import (
	"errors"
	"fmt"
)

// 模拟的底层 GORM 实例
type DB struct {
	DSN string
}

// 用户领域模型
type User struct {
	ID   int
	Name string
}

// 1. 数据持久层 (Repository)
type UserRepository struct {
	db *DB
}

func NewUserRepository(db *DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Insert(u *User) error {
	if r.db == nil {
		return errors.New("DB 连接未初始化")
	}
	fmt.Printf("[DB SQL] 保存用户: %s 到数据库 (%s)\\n", u.Name, r.db.DSN)
	return nil
}

// 2. 核心业务层 (Service)
type UserService struct {
	repo *UserRepository
}

func NewUserService(repo *UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) Register(name string) error {
	if s.repo == nil {
		return errors.New("UserRepository 未注入")
	}
	user := &User{ID: 1, Name: name}
	return s.repo.Insert(user)
}

func main() {
	dsn := "root:secret@tcp(127.0.0.1:3306)/app"

	// TODO: 1. 实例化 DB 指针，DSN 字段赋值为 dsn
	var db *DB = nil

	// TODO: 2. 实例化 UserRepository，传入刚刚创建 of db 指针
	var repo *UserRepository = nil

	// TODO: 3. 实例化 UserService，将 repo 传入
	var svc *UserService = nil

	// 触发注册校验
	if svc == nil {
		fmt.Println("失败: Service 还是 nil")
		return
	}
	err := svc.Register("王五")
	if err != nil {
		fmt.Printf("注册遇到错误: %v\\n", err)
		return
	}
	fmt.Println("PASS: 企业级分层依赖显式组装成功！")
}`}
          solution={`package main

import (
	"errors"
	"fmt"
)

type DB struct {
	DSN string
}

type User struct {
	ID   int
	Name string
}

type UserRepository struct {
	db *DB
}

func NewUserRepository(db *DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Insert(u *User) error {
	if r.db == nil {
		return errors.New("DB 连接未初始化")
	}
	fmt.Printf("[DB SQL] 保存用户: %s 到数据库 (%s)\\n", u.Name, r.db.DSN)
	return nil
}

type UserService struct {
	repo *UserRepository
}

func NewUserService(repo *UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) Register(name string) error {
	if s.repo == nil {
		return errors.New("UserRepository 未注入")
	}
	user := &User{ID: 1, Name: name}
	return s.repo.Insert(user)
}

func main() {
	dsn := "root:secret@tcp(127.0.0.1:3306)/app"

	// 1. 实例化 DB 指针
	db := &DB{DSN: dsn}

	// 2. 实例化 UserRepository 并注入 db
	repo := NewUserRepository(db)

	// 3. 实例化 UserService 并注入 repo
	svc := NewUserService(repo)

	// 触发注册校验
	if svc == nil {
		fmt.Println("失败: Service 还是 nil")
		return
	}
	err := svc.Register("王五")
	if err != nil {
		fmt.Printf("注册遇到错误: %v\\n", err)
		return
	}
	fmt.Println("PASS: 企业级分层依赖显式组装成功！")
}`}
          expectedOutput={`[DB SQL] 保存用户: 王五 到数据库 (root:secret@tcp(127.0.0.1:3306)/app)
PASS: 企业级分层依赖显式组装成功！`}
          hints={[
            '使用 &DB{DSN: dsn} 来实例化结构体指针',
            '将实例化出来的指针依次传入 NewUserRepository(db) 以及 NewUserService(repo)'
          ]}
        />
      </section>

      {/* Chapter Quiz */}
      <ChapterQuiz
        id="project-quiz"
        title="实战篇测验"
        questions={[
          {
            question: '在将 rorolee-bot-oversea 从 Maven 多模块转换为 Go 时，关于项目物理布局的推荐方案是？',
            options: [
              '在 Go 中也建立两个子模块包，并声明两个独立的 go.mod 描述文件',
              '使用 Mono-repo 结构，在一个 go.mod 下通过 cmd/front 和 cmd/admin 两个入口启动并共享同一个 internal 业务模块包',
              'Go 从根本上禁止多入口启动，只能分别复制两个完全独立的代码目录仓库',
              '所有代码合并到一个包，不再区分 front 和 admin'
            ],
            correctIndex: 1,
            explanation: 'Go 社区推崇 Mono-repo 模式，在一个项目（单个 go.mod）下使用多个 cmd 入口（如 cmd/front/main.go 和 cmd/admin/main.go），它们编译出来是两个独立的二进制程序，但完美复用 internal 文件夹中的所有公共库。',
          },
          {
            question: 'Go 中若需要平替 MyBatis-Plus 的 JSON 转换器（TypeHandler），应如何做？',
            options: [
              '必须在 go.mod 中声明加载 XML 文件来实现',
              '直接使用 reflect 反射机制在每次查询时动态解析字段',
              '对结构体字段对应的自定义类型实现 sql.Scanner 和 driver.Valuer 接口以支持写入和读取自动加解密 JSON 串',
              'GORM 不能处理 JSON 类型，必须转为 text 自行拼接'
            ],
            correctIndex: 2,
            explanation: '通过实现 standard database 驱动接口 Scanner (读取转换) 与 Valuer (存入转换)，Go 结构体属性可以直接声明为自定义的结构体或 map，由 ORM 在读写时自动与 JSON/JSONB 字节流进行映射，无需任何第三方框架配置。',
          },
          {
            question: '在支付等回调高并发处理中，使用分布式锁和事务时正确的 Go 语言开发惯例是？',
            options: [
              '将 GORM 开启事务 tx := db.Begin() 操作放在 Redis 加锁动作的范围外边',
              '不设置 defer tx.Rollback() 以加快事务提交的速度',
              '在分布式锁（如 Redis 加锁成功）内部，显式声明 tx := db.Begin()，并紧随 defer tx.Rollback()，在成功时调用 tx.Commit()，最后在此锁范围退出时释放锁',
              '完全依赖数据库行锁，不需要使用 Redis 锁'
            ],
            correctIndex: 2,
            explanation: '分布式锁用于控制入口请求的物理并发以杜绝重入漏洞；在锁的作用区间内，必须使用显式事务 block 以实现真正的原子数据处理，利用 defer tx.Rollback() 规避 panic 或中途返回时的连接悬挂与未提交死锁。',
          },
        ]}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-card-border">
        <Link href="/chapters/architecture" className="text-sm text-muted-fg hover:text-accent transition-colors flex items-center gap-1">
          ← 工程篇
        </Link>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2">
          🎉 返回首页
        </Link>
      </div>
    </article>
  )
}
