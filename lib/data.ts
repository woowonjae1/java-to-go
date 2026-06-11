// Java ↔ Go keyword mapping for interactive highlighting
export const keywordMap: Record<string, string> = {
  // Types & Structure
  'class': 'struct',
  'struct': 'class',
  'interface': 'interface',
  'extends': 'embedding',
  'implements': 'interface',
  'abstract': 'interface',
  'enum': 'const+iota',
  'package': 'package',
  'import': 'import',
  
  // Modifiers
  'public': '(exported)',
  'private': '(unexported)',
  'protected': '(unexported)',
  'static': 'package-level',
  'final': 'const',
  'const': 'final',
  'synchronized': 'sync.Mutex',
  'volatile': 'atomic',
  
  // Control flow
  'try': 'if err',
  'catch': '!= nil',
  'throw': 'return err',
  'throws': '(T, error)',
  'finally': 'defer',
  'defer': 'finally',
  
  // Types
  'String': 'string',
  'string': 'String',
  'int': 'int',
  'Integer': 'int',
  'long': 'int64',
  'Long': 'int64',
  'double': 'float64',
  'Double': 'float64',
  'boolean': 'bool',
  'Boolean': 'bool',
  'void': '(no return)',
  'null': 'nil',
  'nil': 'null',
  'Object': 'interface{}',
  
  // Concurrency
  'Thread': 'goroutine',
  'goroutine': 'Thread',
  'Runnable': 'func()',
  'ExecutorService': 'WaitGroup',
  'Future': 'chan',
  'BlockingQueue': 'chan',
  'chan': 'BlockingQueue',
  'Lock': 'sync.Mutex',
  
  // Collections
  'ArrayList': 'slice',
  'slice': 'ArrayList',
  'HashMap': 'map',
  'map': 'HashMap',
  'List': 'slice',
  'Set': 'map[T]bool',
  'Iterator': 'range',
  'range': 'Iterator',
  
  // OOP
  'new': 'composite literal',
  'this': 'receiver',
  'super': 'embedded field',
  'instanceof': 'type assertion',
  'override': '(implicit)',
  'getter/setter': 'exported field',
}

export interface ChapterMeta {
  id: string
  title: string
  titleEn: string
  icon: string
  color: string
  description: string
  sections: SectionMeta[]
}

export interface SectionMeta {
  id: string
  title: string
  javaConcept: string
  goConcept: string
}

export interface Exercise {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  description: string
  starterCode: string
  solution: string
  expectedOutput: string
  hints: string[]
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface ChapterTaskMeta {
  chapterId: string
  exerciseIds: string[]
  quizIds: string[]
}

export const chapters: ChapterMeta[] = [
  {
    id: 'basics',
    title: '基础篇',
    titleEn: 'Types & Variables',
    icon: '',
    color: 'from-blue-500 to-cyan-500',
    description: '类型系统、指针与值传递——从 Java 的包装类到 Go 的 zero value',
    sections: [
      { id: 'types', title: '基本类型与 Zero Value', javaConcept: '基本类型与包装类', goConcept: '基本类型 + zero value' },
      { id: 'pointers', title: '指针与引用', javaConcept: '引用传递 vs 值传递', goConcept: '指针 * 和 &' },
      { id: 'strings', title: '字符串处理', javaConcept: 'String 操作', goConcept: 'strings 包 + rune' },
      { id: 'collections', title: '集合与切片', javaConcept: '数组与集合框架', goConcept: 'slice, map' },
    ],
  },
  {
    id: 'oop',
    title: '结构篇',
    titleEn: 'OOP → Composition',
    icon: '',
    color: 'from-purple-500 to-pink-500',
    description: '从深层类继承到扁平结构体组合——Go 的设计哲学',
    sections: [
      { id: 'struct', title: '类与结构体', javaConcept: 'Class', goConcept: 'Struct' },
      { id: 'embedding', title: '继承与嵌入', javaConcept: '继承 (extends)', goConcept: '嵌入 (embedding)' },
      { id: 'interfaces', title: '接口实现', javaConcept: 'Interface (显式)', goConcept: 'Interface (鸭子类型)' },
      { id: 'generics', title: '泛型', javaConcept: 'Java 泛型', goConcept: 'Go 1.18+ 泛型' },
      { id: 'pkg-di', title: '包与依赖注入', javaConcept: 'Spring DI 反射', goConcept: '扁平包与手动 Wire' },
    ],
  },
  {
    id: 'errors',
    title: '异常篇',
    titleEn: 'Exceptions → Errors',
    icon: '',
    color: 'from-orange-500 to-red-500',
    description: '告别 try-catch，拥抱显式错误处理——Go 的错误即值理念',
    sections: [
      { id: 'try-catch', title: '异常到错误值', javaConcept: 'try-catch-finally', goConcept: 'if err != nil' },
      { id: 'custom-errors', title: '自定义错误', javaConcept: '自定义异常类', goConcept: '自定义 error 类型' },
      { id: 'error-wrapping', title: '错误传播', javaConcept: 'throws 声明', goConcept: '错误包装 fmt.Errorf' },
      { id: 'panic-recover', title: 'Panic 与 Recover', javaConcept: 'RuntimeException', goConcept: 'panic/recover' },
    ],
  },
  {
    id: 'concurrency',
    title: '并发篇',
    titleEn: 'Threads → Goroutines',
    icon: '',
    color: 'from-green-500 to-emerald-500',
    description: '从重量级线程到轻量级协程——Go 的 CSP 并发模型',
    sections: [
      { id: 'goroutines', title: 'Goroutine 入门', javaConcept: 'Thread / Runnable', goConcept: 'Goroutine' },
      { id: 'mutex', title: '互斥锁', javaConcept: 'synchronized', goConcept: 'sync.Mutex' },
      { id: 'channels', title: 'Channel 通信', javaConcept: 'BlockingQueue', goConcept: 'Channel' },
      { id: 'patterns', title: '并发模式', javaConcept: 'ExecutorService', goConcept: 'WaitGroup + Select' },
      { id: 'context', title: 'Context 传递', javaConcept: 'ThreadLocal 隐式', goConcept: 'context.Context 显式' },
    ],
  },
  {
    id: 'web',
    title: 'Web 篇',
    titleEn: 'Web & API Development',
    icon: '',
    color: 'from-rose-500 to-red-500',
    description: 'Spring Boot 转化为轻量 Web 路由——中间件拦截与数据绑定验证',
    sections: [
      { id: 'routing', title: '路由与控制器', javaConcept: 'Spring MVC Controller', goConcept: 'Gin Engine / Group' },
      { id: 'middleware', title: '中间件机制', javaConcept: 'Interceptor / Filter', goConcept: 'Gin Middleware (c.Next)' },
      { id: 'binding', title: '数据绑定与校验', javaConcept: 'Bean Validation (@NotNull)', goConcept: 'ShouldBindJSON (binding)' },
    ],
  },
  {
    id: 'database',
    title: '数据篇',
    titleEn: 'Database & Transactions',
    icon: '',
    color: 'from-amber-500 to-yellow-600',
    description: '告别隐式声明式事务魔法——ORM 映射与显式事务的编写',
    sections: [
      { id: 'orm', title: 'ORM 框架对比', javaConcept: 'MyBatis / JPA', goConcept: 'GORM / sqlx' },
      { id: 'pool', title: '数据库连接池', javaConcept: 'HikariCP 配置', goConcept: 'database/sql 自动连接池' },
      { id: 'transaction', title: '显式事务处理', javaConcept: '声明式 @Transactional', goConcept: 'db.Begin() 与 defer 回滚' },
    ],
  },
  {
    id: 'middleware',
    title: '服务篇',
    titleEn: 'Middleware & RPC',
    icon: '',
    color: 'from-teal-500 to-emerald-600',
    description: '高并发网络中间件——go-redis 缓存、gRPC 契约与高性能 Zap 日志',
    sections: [
      { id: 'redis', title: '缓存访问', javaConcept: 'RedisTemplate', goConcept: 'go-redis (Pipeline)' },
      { id: 'grpc', title: '微服务 RPC 通信', javaConcept: 'Spring Cloud OpenFeign', goConcept: 'gRPC / Protobuf' },
      { id: 'logging', title: '高性能结构化日志', javaConcept: 'Logback / SLF4J', goConcept: 'Zap / Logrus (零分配)' },
    ],
  },
  {
    id: 'architecture',
    title: '工程篇',
    titleEn: 'Project & Deployment',
    icon: '',
    color: 'from-slate-500 to-zinc-600',
    description: '标准项目布局设计、表驱动测试、以及 10M 极简 Docker 二进制镜像打包',
    sections: [
      { id: 'layout', title: '项目目录分层', javaConcept: 'Controller-Service-Dao', goConcept: 'cmd/ & internal/ & pkg/' },
      { id: 'testing', title: '表驱动测试', javaConcept: 'JUnit + Mockito', goConcept: 'testing 包 + Table-Driven' },
      { id: 'deploy', title: '多阶段容器打包', javaConcept: 'Maven + heavy JRE (100MB+)', goConcept: 'Multi-stage Docker (10MB+)' },
    ],
  },
  {
    id: 'project',
    title: '实战篇',
    titleEn: 'Enterprise Case Study',
    icon: '',
    color: 'from-indigo-500 to-violet-600',
    description: '以核心模块“订单支付与队列处理”为背景，打通从 DTO 参数校验、本地事务、支付 Webhook 签名验证到 RabbitMQ 异步通知的完整工业级链路。',
    sections: [
      { id: 'proj-dto', title: 'DTO 参数校验', javaConcept: 'Spring Boot Bean Validation', goConcept: 'Gin Struct Binding' },
      { id: 'proj-db', title: '数据模型与事务管理', javaConcept: 'MyBatis-Plus Entity & Transactional', goConcept: 'GORM Tags & Defer Rollback' },
      { id: 'proj-payment', title: '三方支付与签名验证', javaConcept: 'Stripe Java Webhook constructEvent', goConcept: 'Gin io.ReadAll & Stripe Go verify' },
      { id: 'proj-mq', title: 'RabbitMQ 异步管道', javaConcept: 'Spring AMQP Template & Listener', goConcept: 'amqp091 Channel Pub/Sub & Loop' },
    ],
  },
]

export const chapterTasks: ChapterTaskMeta[] = [
  {
    chapterId: 'basics',
    exerciseIds: ['basics-types', 'basics-pointers', 'basics-strings', 'basics-collections'],
    quizIds: ['basics'],
  },
  {
    chapterId: 'oop',
    exerciseIds: ['oop-struct', 'oop-di'],
    quizIds: ['oop'],
  },
  {
    chapterId: 'errors',
    exerciseIds: ['errors-try-catch', 'errors-wrapping'],
    quizIds: ['errors'],
  },
  {
    chapterId: 'concurrency',
    exerciseIds: ['concurrency-goroutines', 'concurrency-context'],
    quizIds: ['concurrency'],
  },
  {
    chapterId: 'web',
    exerciseIds: ['web-gin-handler'],
    quizIds: ['web'],
  },
  {
    chapterId: 'database',
    exerciseIds: ['db-transaction'],
    quizIds: ['database'],
  },
  {
    chapterId: 'middleware',
    exerciseIds: ['middleware-logging'],
    quizIds: ['middleware'],
  },
  {
    chapterId: 'architecture',
    exerciseIds: ['arch-table-test'],
    quizIds: ['architecture'],
  },
  {
    chapterId: 'project',
    exerciseIds: ['proj-manual-wiring'],
    quizIds: ['project-quiz'],
  },
]
