'use client'

import { CodeDuel } from '@/components/code-duel'
import { GoPlayground } from '@/components/go-playground'
import { GotchaCallout } from '@/components/gotcha-callout'
import { ChapterQuiz } from '@/components/chapter-quiz'
import Link from 'next/link'

export default function ProjectPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      {/* Chapter header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-accent font-mono mb-2 block">Chapter 9</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
          🚀 实战篇 — 企业级案例实战
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          打通从基础语法到企业落地的最后一关。通过真实的“用户服务”案例，深度剖析在 Go 中如何规范目录组织、划分分层业务代码，以及通过编译期显式装配替代 Spring Boot 反射容器，实现高效健壮的云原生服务。
        </p>
      </div>

      {/* Section 1: Directory Layout */}
      <section id="proj-layout" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">9.1</span>
          物理架构目录：Spring Multi-Module vs Go Standard Layout
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          在 Java 企业级开发中，我们习惯使用 Maven/Gradle 的多模块结构（如 <code>api</code>, <code>service</code>, <code>dao</code>）来实现物理隔离。配合极其冗长的包路径（如 <code>src/main/java/com/corporation/project/module/controller/...</code>），虽然层次清晰，但也极其繁琐。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 的设计思想是<strong>扁平与实用</strong>。Go 官方和社区推荐一套约定俗成的<strong>标准项目布局 (Standard Go Project Layout)</strong>。它直接利用物理文件目录的可见性以及编译规则来实现强制性边界防腐：
        </p>
        <div className="p-5 rounded-xl bg-card border border-card-border mb-6">
          <ul className="text-sm text-muted-fg space-y-2.5 font-mono">
            <li>📂 <strong>/cmd</strong>：所有可执行二进制程序的入口。每个子目录代表一个主程序（如 <code>cmd/api/main.go</code> 用于 HTTP 服务，<code>cmd/cron/main.go</code> 用于定时任务）。<code>main</code> 包在此定义，在此<strong>不应包含任何具体业务逻辑</strong>。</li>
            <li>📂 <strong>/internal</strong>：私有核心业务代码。该目录是 Go 编译器在物理层控制代码可见性的工具。<strong>任何 internal 外的包如果尝试 import 该目录下的代码，将直接导致编译失败。</strong> 它是防腐、防止核心业务被滥用的天然保护网。</li>
            <li>📂 <strong>/pkg</strong>：公共共享组件。可以被外部项目直接引用的独立包（如公共工具、RPC SDK 契约）。</li>
            <li>📂 <strong>/configs</strong>：存放配置模板或环境配置（如 <code>config.yaml</code>）。</li>
          </ul>
        </div>

        <CodeDuel
          title="Java Maven 多模块结构 vs Go 标准骨架"
          javaCode={`# Maven 典型布局 (层次繁复且包名嵌套深)
user-service-parent/
  ├── pom.xml
  ├── user-api/                     # 暴露外部的 DTO 与接口契约
  │    └── src/main/java/com/corp/api/dto/UserRegisterDTO.java
  ├── user-dao/                     # 数据持久层
  │    ├── src/main/resources/mapper/UserMapper.xml
  │    └── src/main/java/com/corp/dao/UserMapper.java
  └── user-service-impl/            # 核心业务实现层
       └── src/main/java/com/corp/service/impl/UserServiceImpl.java`}
          goCode={`# Standard Go Project Layout (扁平、独立、强物理隔离)
user-service/
  ├── go.mod
  ├── cmd/
  │    └── api/
  │         └── main.go             # 整个程序的连线装配与运行入口
  ├── internal/                     # 强保护业务代码 (禁止包外部导入!)
  │    ├── handler/                 # 接入层 (API 控制器)
  │    │    └── user.go
  │    ├── service/                 # 业务核心层
  │    │    └── user.go
  │    └── repository/              # 持久化存储层
  │         └── user.go
  ├── pkg/                          # 可供外部引用的公共包 (工具、客户端)
  └── configs/                      # 配置文件`}
          highlights={[
            { java: 'pom.xml 多模块配置', go: '单个 go.mod 与扁平物理目录' },
            { java: 'com/corp/service/impl/ 深度嵌套', go: 'internal/ 保证外部包只读隔离' },
          ]}
        />
      </section>

      {/* Section 2: Business Core Code */}
      <section id="proj-code" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">9.2</span>
          业务核心代码：Spring-MVC-Service-DAO vs Gin-Service-Repository
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Spring Boot 的精髓是<strong>注解（Annotations）与隐式增强</strong>。框架通过字节码增强及运行时反射来接管控制权。比如 <code>@RestController</code>、<code>@Autowired</code>，以及声明式事务 <code>@Transactional</code>。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          在 Go 的世界里，<strong>“显式优于隐式”</strong>（Explicit is better than implicit）。Go 不提倡使用注解（因为 Go 本身也不支持）。我们直接使用<strong>结构体指针与接收器函数</strong>来表示组件关系：
        </p>
        <div className="p-5 rounded-xl bg-card border border-card-border mb-6">
          <ul className="text-sm text-muted-fg space-y-2.5">
            <li><strong>Handler (相当于 Controller)</strong>：持有 Service 结构体指针，负责解析 HTTP 请求（如 Gin 绑定的 JSON），调用 Service 处理业务，并返回标准 JSON。</li>
            <li><strong>Service</strong>：持有 Repository 结构体指针，承载核心业务逻辑，显式通过 <code>context.Context</code> 往下透传链路超时与调用信息。</li>
            <li><strong>Repository (相当于 Mapper)</strong>：持有底层的数据库连接句柄（如 <code>*gorm.DB</code>），直接操作数据库完成持久化。</li>
          </ul>
        </div>

        <CodeDuel
          title="Spring Boot 注解驱动分层 vs Go 显式指针组合"
          javaCode={`// Java: 隐式注解与动态代理代理
@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserVO> register(@Valid @RequestBody UserReq req) {
        UserVO vo = userService.registerUser(req);
        return ResponseEntity.ok(vo);
    }
}

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserMapper userMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserVO registerUser(UserReq req) {
        UserEntity entity = new UserEntity(req.getName(), req.getEmail());
        userMapper.insert(entity);
        return new UserVO(entity.getId(), entity.getName());
    }
}`}
          goCode={`// Go: 显式结构体与指针注入 (清晰、可追踪)

// 1. Handler 层
type UserHandler struct {
	svc *UserService // 显式持有所需服务的结构体指针
}

func NewUserHandler(svc *UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

func (h *UserHandler) Register(c *gin.Context) {
	var req UserReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.svc.RegisterUser(c.Request.Context(), &req)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, resp)
}

// 2. Service 层
type UserService struct {
	repo *UserRepository // 显式持有底层 Repository 指针
}

func NewUserService(repo *UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) RegisterUser(ctx context.Context, req *UserReq) (*UserResp, error) {
	// 所有业务操作均显式透传 Context，方便做链路追踪与优雅超时中断
	user := &User{Name: req.Name, Email: req.Email}
	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}
	return &UserResp{ID: user.ID, Name: user.Name}, nil
}

// 3. Repository 层
type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, u *User) error {
	return r.db.WithContext(ctx).Create(u).Error
}`}
          highlights={[
            { java: '@Autowired 自动反射装配', go: 'NewUserHandler(svc) 显式指针传入' },
            { java: '@Transactional 代理切面', go: '用 db.WithContext(ctx) 或 tx 闭包实现显式隔离' },
          ]}
          outline={[
            { name: '接入层 (Controller / Handler)', icon: '🎯', javaLine: 2, goLine: 3, description: 'UserController 与 UserHandler 接入定义' },
            { name: '业务层 (Service)', icon: '⚙️', javaLine: 15, goLine: 26, description: 'UserService 核心接口与业务实现' },
            { name: '数据层 (Mapper / Repository)', icon: '💾', javaLine: 24, goLine: 44, description: 'UserMapper 与 UserRepository 访问及持久化' },
          ]}
        />
      </section>

      {/* Section 3: Dependency Assembly */}
      <section id="proj-main" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">9.3</span>
          依赖显式连线组装：ComponentScan 反射容器 vs main.go 手动 Wire
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Spring Boot 项目启动时会执行庞大的 Classpath 扫描（<code>@ComponentScan</code>），利用反射将所有的 Bean 注册进 ApplicationContext（IoC 容器），甚至通过复杂的算法解决“循环依赖”。这使得启动非常“智能”，但同时也成为了<b>运行时的黑盒</b>：排查 Bean 注入缺失错误十分痛苦，且导致了 JVM 极慢的启动速度和庞大的运行时内存损耗。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 没有运行时的 IoC 扫描。所有的依赖关系都在 <code>cmd/api/main.go</code> 中通过纯代码的形式进行<strong>显式连线组装 (Manual Wiring)</strong>。
          代码以“自底向上”的顺序进行层层初始化：
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          这种方式极为朴素，但为我们带来了三大压倒性优势：
          1. **编译期完备保障**：如果有任何注入缺失或类型错误，编译器在<b>编译阶段</b>就会直接红线报错，绝对不会等到生产环境运行时抛出 <code>NullPointerException</code>。
          2. **零运行时反射开销**：由于不需要在启动时扫描反射，Go 程序能在 <b>1~3 毫秒内瞬间启动完毕</b>，启动即巅峰。
          3. **100% 逻辑可见性**：没有魔幻加载，任何程序员通过查看 <code>main.go</code> 就能直接追踪对象的生成路径。对超大型项目，可以使用 <code>google/wire</code> 等工具来自动生成这些组装代码（同样是编译期生成，零运行时反射损耗）。
        </p>

        <CodeDuel
          title="ComponentScan 隐式魔法 vs main.go 显式组装连线"
          javaCode={`// Java: Classpath 扫描启动 (所有 Bean 隐藏在反射中)
@SpringBootApplication
public class UserApplication {
    public static void main(String[] args) {
        // Spring Boot 在运行时反射扫描当前包下所有 Class
        // 自动解析依赖，装配 bean
        SpringApplication.run(UserApplication.class, args);
    }
}`}
          goCode={`// Go: cmd/api/main.go 显式连线组装依赖

package main

import (
	"log"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	
	"myproject/internal/handler"
	"myproject/internal/repository"
	"myproject/internal/service"
)

func main() {
	// 1. 初始化物理基础层 (DSN 数据库配置与池化实例)
	dsn := "root:secret@tcp(127.0.0.1:3306)/app?charset=utf8mb4&parseTime=True"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("数据库连接初始化失败: %v", err)
	}

	// 2. 自底向上，显式将底层实例连线注入到顶层逻辑
	userRepo := repository.NewUserRepository(db)         // 将 db 注入持久化层
	userSvc := service.NewUserService(userRepo)         // 将 repository 注入业务层
	userHandler := handler.NewUserHandler(userSvc)      // 将 service 注入控制器

	// 3. 构建路由引擎并注册
	r := gin.Default()
	r.POST("/users/register", userHandler.Register)

	// 4. 瞬间运行 HTTP 监听
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("应用启动失败: %v", err)
	}
}`}
          highlights={[
            { java: 'SpringApplication.run(Class)', go: 'gorm.Open(...) 初始化依赖' },
            { java: '通过 Classpath 反射寻找 Bean', go: '自底向上显式连线组装' },
          ]}
          outline={[
            { name: '主入口与初始化', icon: '🔧', javaLine: 4, goLine: 16, description: '环境入口 main 方法定义与 DB 连接初始化' },
            { name: '依赖连线组装', icon: '🔗', javaLine: 2, goLine: 24, description: '反射扫描 IOC vs 手动层层实例化注入' },
            { name: '路由配置与运行', icon: '🌐', javaLine: 7, goLine: 29, description: 'Web 路由映射以及监听端口启动服务' },
          ]}
        />

        <GotchaCallout
          level="danger"
          title="编译杀手：包循环导入 (Circular Import Cycle)"
          javaWay={`// Java: 允许 AService 依赖 BService，且 BService 同时依赖 AService
@Service
public class AService {
    @Autowired
    private BService bService;
}`}
          goWay={`// Go: 如果包 a 导入包 b，且包 b 导入包 a，编译报错：
// ❌ import cycle not allowed
// 
// 必须重构解决：
// 1. 抽取共享的结构体/函数到独立的包 (例如 pkg/types)
// 2. 将高耦合的包合并为一个物理包
// 3. 定义接口(Interface)实现“依赖倒置” (AService 依赖 B 的接口，不引用其具体包)`}
        >
          Spring Boot 的 IoC 容器依靠三级缓存巧妙地容忍并绕过了“循环依赖”。这让许多 Java 程序员写出了高度耦合的意大利面条式架构。
          而在 Go 中，<b>循环导入在编译阶段就是非法的</b>。这逼迫 Go 程序员在设计物理目录和结构体时，必须遵循严格的方向性和分层性（从上往下），强制降低系统内各包的耦合度。
        </GotchaCallout>
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
	fmt.Printf("[DB SQL] 保存用户: %s 到数据库 (%s)\n", u.Name, r.db.DSN)
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

	// TODO: 2. 实例化 UserRepository，传入刚刚创建的 db 指针
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
		fmt.Printf("注册遇到错误: %v\n", err)
		return
	}
	fmt.Println("PASS: 企业级分层依赖显式组装成功！")
}
`}
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
	fmt.Printf("[DB SQL] 保存用户: %s 到数据库 (%s)\n", u.Name, r.db.DSN)
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
		fmt.Printf("注册遇到错误: %v\n", err)
		return
	}
	fmt.Println("PASS: 企业级分层依赖显式组装成功！")
}
`}
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
            question: '在 Go 的标准项目布局 (Standard Layout) 中，/internal 目录的特殊物理边界是什么？',
            options: [
              '它只能包含系统配置参数，不能包含 Go 代码',
              '任何位于 internal 目录外的包在编译时都无法导入该目录下的代码，是由 Go 编译器强制限制的私有边界防护',
              '它类似于 Java 中的 resources 目录，专门存放静态网页资源',
              '该目录下的代码会被编译器强制优化成内联汇编'
            ],
            correctIndex: 1,
            explanation: '这是 Go 包可见性约束（Internal packages）的核心机制。任何外部包或非当前模块的包，导入带有 internal 的路径时，会在编译阶段直接被拦截并报编译错误，为企业级项目的包划分提供了坚实防腐层。',
          },
          {
            question: '在 Go 业务开发中，如果遇到了 "import cycle not allowed" 编译错误，以下哪种是推荐的系统级解耦重构方案？',
            options: [
              '在 go.mod 中配置 allow_cycle: true 强制编译器通过',
              '使用反射 reflect 包在运行时强行获取彼此的私有函数以实现调用',
              '将相互依赖的共享结构体/数据拆解移入独立的包（如 types/models 包），或者定义接口进行依赖倒置，或者将紧密关联的代码块合并为同一个物理包',
              '直接使用 synchronized 关键字强行切断关联'
            ],
            correctIndex: 2,
            explanation: 'Go 语言在编译期禁止包之间发生环状依赖。解决该问题必须从架构上入手：可以将高度共享的模型抽出至 models 包，或者利用接口使调用链条单向化（面向接口编程），从而斩断循环引用。',
          },
          {
            question: '为什么在 Go 企业开发中，我们绝大多数时候直接在 main.go 中手动进行依赖组装（Manual Wiring），而不是引入像 Spring 类似的运行时 IoC 容器？',
            options: [
              '因为 Go 不支持结构体相互嵌套',
              '因为手动组装能在编译阶段提前校验所有参数注入缺失与类型错误，且无需运行时包扫描反射，极大地加速了应用启动（1ms 级别）',
              '因为 Go 标准库已经提供了 @Inject 注解',
              '手动组装是为了绕过操作系统内核对端口占用的限制'
            ],
            correctIndex: 1,
            explanation: 'Go 语言拥护“显式优于隐式”的开发哲学。编译期直接检测所有的类型组装错误可降低排雷成本，没有运行时类扫描开销也使得微服务非常轻量快速，非常契合云原生 Serverless 与微服务场景。',
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
