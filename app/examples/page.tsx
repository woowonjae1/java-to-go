'use client'

import { CodeDuel } from '@/components/code-duel'
import { GotchaCallout } from '@/components/gotcha-callout'
import { useState } from 'react'

interface ExampleData {
  id: string
  category: string
  title: string
  titleEn: string
  scenario: string
  javaCode: string
  goCode: string
  highlights?: { java: string; go: string }[]
  gotcha: {
    level: 'warning' | 'danger' | 'tip'
    title: string
    javaWay?: string
    goWay?: string
    body: React.ReactNode
  }
}

const examples: ExampleData[] = [
  {
    id: 'dto-mapping',
    category: 'Web 开发',
    title: 'DTO ↔ Entity 转换',
    titleEn: 'DTO Mapping',
    scenario:
      '把数据库实体转换为对外的响应对象，是 CRUD 服务里最高频的操作。Java 靠 MapStruct/BeanUtils 反射魔法，Go 则推崇手写显式映射函数。',
    javaCode: `// Java: 依赖 MapStruct 注解处理器在编译期生成映射
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(source = "createdAt", target = "registerTime")
    UserVO toVO(User entity);

    List<UserVO> toVOList(List<User> entities);
}

// 调用处（隐藏了大量生成代码）
UserVO vo = UserMapper.INSTANCE.toVO(user);`,
    goCode: `// Go: 一个普通函数，显式、可读、可调试
func toUserVO(u User) UserVO {
    return UserVO{
        ID:           u.ID,
        Name:         u.Name,
        RegisterTime: u.CreatedAt.Format(time.RFC3339),
    }
}

func toUserVOList(us []User) []UserVO {
    out := make([]UserVO, 0, len(us)) // 预分配容量，避免多次扩容
    for _, u := range us {
        out = append(out, toUserVO(u))
    }
    return out
}`,
    highlights: [
      { java: '@Mapper', go: 'func' },
      { java: 'List', go: 'slice' },
    ],
    gotcha: {
      level: 'tip',
      title: '别再找 “Go 版 MapStruct” 了',
      javaWay: 'UserVO vo = mapper.toVO(user); // 反射，运行时才暴露字段不匹配',
      goWay: 'vo := toUserVO(user) // 编译期就能发现字段写错',
      body: (
        <>
          Java 程序员转 Go 第一反应是找一个自动映射库。<strong>请抵制这个冲动。</strong>
          手写映射函数虽然“啰嗦”，但它显式、零反射、编译期类型安全、IDE 可直接跳转。
          一旦字段对不上，编译直接报错，而不是上线后才发现某个字段是空的。这正是
          “Clear is better than clever” 的体现。
        </>
      ),
    },
  },
  {
    id: 'http-client',
    category: '网络',
    title: 'HTTP Client 封装',
    titleEn: 'HTTP Client',
    scenario:
      '调用第三方 API 时，超时控制和连接复用是生产级代码的底线。Java 用 RestTemplate/OkHttp，Go 用标准库 net/http——但默认的 http.Get 有个致命坑。',
    javaCode: `// Java: RestTemplate（注意要配置超时，否则默认无限等待）
RestTemplate rest = new RestTemplateBuilder()
    .setConnectTimeout(Duration.ofSeconds(3))
    .setReadTimeout(Duration.ofSeconds(5))
    .build();

ResponseEntity<UserVO> resp = rest.getForEntity(
    "https://api.example.com/users/1", UserVO.class);
UserVO user = resp.getBody();`,
    goCode: `// Go: 复用一个带超时的 Client（不要每次 new！）
var apiClient = &http.Client{
    Timeout: 5 * time.Second, // 整体超时，必须显式设置
}

func fetchUser(ctx context.Context, id string) (*UserVO, error) {
    url := "https://api.example.com/users/" + id
    req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
    if err != nil {
        return nil, err
    }
    resp, err := apiClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close() // 必须关闭，否则连接泄漏

    var user UserVO
    if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
        return nil, err
    }
    return &user, nil
}`,
    highlights: [
      { java: 'RestTemplate', go: 'http.Client' },
      { java: 'setReadTimeout', go: 'Timeout' },
    ],
    gotcha: {
      level: 'danger',
      title: 'http.Get 默认永不超时 + Body 必须关闭',
      javaWay: 'http.Get(url) // 默认 Client 没有超时，对端不响应就永久挂起',
      goWay: 'client := &http.Client{Timeout: 5*time.Second}; resp, _ := client.Do(req)',
      body: (
        <>
          <code>http.DefaultClient</code> 和 <code>http.Get</code> 的{' '}
          <strong>Timeout 默认为 0，即无限等待</strong>——生产环境一个慢接口就能拖垮你的协程池。
          另外每个成功响应都必须 <code>defer resp.Body.Close()</code>，否则底层 TCP
          连接无法归还连接池，最终耗尽文件描述符。这两个坑，Java 的框架帮你兜底了，Go 需要你自己负责。
        </>
      ),
    },
  },
  {
    id: 'concurrent-fanout',
    category: '并发',
    title: '并发聚合调用（Fan-out）',
    titleEn: 'Concurrent Fan-out',
    scenario:
      '同时请求多个下游服务再聚合结果，是微服务里的经典场景。Java 用 CompletableFuture，Go 用 goroutine + errgroup，后者代码量少一个数量级。',
    javaCode: `// Java: CompletableFuture 并行聚合
ExecutorService pool = Executors.newFixedThreadPool(3);
try {
    CompletableFuture<Profile> f1 =
        CompletableFuture.supplyAsync(() -> fetchProfile(id), pool);
    CompletableFuture<List<Order>> f2 =
        CompletableFuture.supplyAsync(() -> fetchOrders(id), pool);

    CompletableFuture.allOf(f1, f2).join();
    Dashboard dash = new Dashboard(f1.get(), f2.get());
} catch (Exception e) {
    throw new RuntimeException(e);
} finally {
    pool.shutdown();
}`,
    goCode: `// Go: errgroup —— 任一失败即取消其余，自动收集第一个 error
func buildDashboard(ctx context.Context, id string) (*Dashboard, error) {
    g, ctx := errgroup.WithContext(ctx)

    var profile *Profile
    var orders []Order

    g.Go(func() (err error) {
        profile, err = fetchProfile(ctx, id)
        return err
    })
    g.Go(func() (err error) {
        orders, err = fetchOrders(ctx, id)
        return err
    })

    if err := g.Wait(); err != nil { // 等待全部完成或首个错误
        return nil, err
    }
    return &Dashboard{Profile: profile, Orders: orders}, nil
}`,
    highlights: [
      { java: 'CompletableFuture', go: 'errgroup' },
      { java: 'ExecutorService', go: 'WaitGroup' },
      { java: 'allOf', go: 'g.Wait' },
    ],
    gotcha: {
      level: 'warning',
      title: '闭包捕获循环变量（Go 1.22 前的经典坑）',
      javaWay: 'for (var task : tasks) pool.submit(() -> handle(task)); // Java 要求 final',
      goWay: 'for _, task := range tasks { task := task; g.Go(func() error { return handle(task) }) }',
      body: (
        <>
          在 <strong>Go 1.22 之前</strong>，<code>for range</code> 的循环变量是复用的同一个地址，
          直接在 goroutine 闭包里引用它，所有协程跑完后往往拿到的是最后一个值。老代码里到处是{' '}
          <code>task := task</code> 这种“变量重影”。Go 1.22 起每轮迭代变量独立，这个坑才消失——
          但读老项目时务必警惕。优先用 <code>errgroup</code> 而非裸 <code>sync.WaitGroup</code>，
          它能自动传播错误和取消信号。
        </>
      ),
    },
  },
  {
    id: 'file-scanner',
    category: 'IO',
    title: '逐行读取大文件',
    titleEn: 'File Scanner',
    scenario:
      '读取日志/CSV 等大文件时，绝不能一次性读进内存。Java 用 BufferedReader，Go 用 bufio.Scanner——但 Scanner 有个默认行长度上限的暗坑。',
    javaCode: `// Java: try-with-resources 自动关闭
int count = 0;
try (BufferedReader br = Files.newBufferedReader(Path.of("access.log"))) {
    String line;
    while ((line = br.readLine()) != null) {
        if (line.contains("ERROR")) {
            count++;
        }
    }
} catch (IOException e) {
    throw new UncheckedIOException(e);
}
System.out.println("errors: " + count);`,
    goCode: `// Go: defer 关闭 + bufio.Scanner 流式读取
func countErrors(path string) (int, error) {
    f, err := os.Open(path)
    if err != nil {
        return 0, err
    }
    defer f.Close()

    count := 0
    scanner := bufio.NewScanner(f)
    for scanner.Scan() { // 每次读一行，内存恒定
        if strings.Contains(scanner.Text(), "ERROR") {
            count++
        }
    }
    if err := scanner.Err(); err != nil { // 别忘了检查扫描错误
        return 0, err
    }
    return count, nil
}`,
    highlights: [
      { java: 'BufferedReader', go: 'bufio' },
      { java: 'readLine', go: 'Scan' },
    ],
    gotcha: {
      level: 'danger',
      title: 'bufio.Scanner 单行默认上限 64KB',
      javaWay: 'br.readLine() // 没有行长度限制',
      goWay: 'buf := make([]byte, 1024*1024); scanner.Buffer(buf, len(buf)) // 提升到 1MB',
      body: (
        <>
          <code>bufio.Scanner</code> 默认单行最大 <strong>64KB</strong>，超过会以{' '}
          <code>bufio.ErrTooLong</code> 失败。如果你的日志里有超长 JSON 行，循环会提前中断——
          而且<strong>容易被忽略</strong>，因为 <code>scanner.Scan()</code> 返回 false 看起来就像正常读完了。
          所以循环后<strong>务必检查 <code>scanner.Err()</code></strong>，并按需用{' '}
          <code>scanner.Buffer()</code> 调大缓冲区。
        </>
      ),
    },
  },
  {
    id: 'json-binding',
    category: '序列化',
    title: 'JSON 序列化与字段控制',
    titleEn: 'JSON Marshaling',
    scenario:
      'JSON 是服务间通信的通用语言。Java 用 Jackson 注解，Go 用 struct tag——但 Go 的“零值字段照样输出”是 Java 程序员最容易栽的坑。',
    javaCode: `// Java: Jackson 注解
public class UserVO {
    @JsonProperty("user_name")
    private String name;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String nickname; // null 时不输出

    @JsonIgnore
    private String password; // 永不序列化
}

String json = objectMapper.writeValueAsString(vo);`,
    goCode: `// Go: struct tag 控制
type UserVO struct {
    Name     string \`json:"user_name"\`
    Nickname string \`json:"nickname,omitempty"\` // 零值("")时省略
    Password string \`json:"-"\`                   // 永不序列化
    Age      int    \`json:"age"\`                  // 注意：0 也会被输出！
}

b, err := json.Marshal(vo)
if err != nil {
    return err
}`,
    highlights: [
      { java: '@JsonProperty', go: 'json' },
      { java: '@JsonIgnore', go: '-' },
    ],
    gotcha: {
      level: 'warning',
      title: 'omitempty 无法区分“零值”和“未设置”',
      javaWay: 'Integer age; // null 表示未设置，0 表示真的是 0，能区分',
      goWay: 'Age int `json:"age,omitempty"` // 0 会被当成“空”而省略，无法表达“真的是 0”',
      body: (
        <>
          Go 的基本类型没有 null，<code>int</code> 的零值就是 <code>0</code>。加了{' '}
          <code>omitempty</code> 后，<code>Age: 0</code> 会被当作“空”直接从 JSON 里消失，
          前端就收不到这个字段。如果你需要区分“年龄是 0”和“没填年龄”，必须用指针{' '}
          <code>*int</code>（nil 表示未设置）。这是 Java 的包装类（Integer）能自然表达、而 Go
          需要刻意处理的语义差异。
        </>
      ),
    },
  },
  {
    id: 'map-ops',
    category: '集合',
    title: '嵌套 Map 操作与存在性判断',
    titleEn: 'Map Operations',
    scenario:
      '统计、分组、缓存查找都离不开 Map。Java 有 computeIfAbsent 一行搞定，Go 的 map 则有两个新手必踩的 panic 坑。',
    javaCode: `// Java: computeIfAbsent 优雅处理分组
Map<String, List<Order>> byUser = new HashMap<>();
for (Order o : orders) {
    byUser.computeIfAbsent(o.getUserId(), k -> new ArrayList<>())
          .add(o);
}

// 取值，key 不存在返回 null
List<Order> list = byUser.get("u1");
if (list != null) { /* ... */ }`,
    goCode: `// Go: nil map 不能写！必须先 make
byUser := make(map[string][]Order) // 关键：初始化
for _, o := range orders {
    byUser[o.UserID] = append(byUser[o.UserID], o)
    // append 对 nil slice 安全，所以这里无需先判断 key
}

// 取值用 "comma ok" 惯用法判断是否存在
if list, ok := byUser["u1"]; ok {
    _ = list // 存在
}`,
    highlights: [
      { java: 'computeIfAbsent', go: 'append' },
      { java: 'HashMap', go: 'map' },
    ],
    gotcha: {
      level: 'danger',
      title: '向 nil map 写入直接 panic',
      javaWay: 'Map<String,Integer> m; m.put("a", 1); // Java 是 NullPointerException',
      goWay: 'var m map[string]int       // m 是 nil\nm["a"] = 1                 // panic: assignment to entry in nil map\nm = make(map[string]int)   // 必须先 make 才能写',
      body: (
        <>
          声明了 <code>var m map[string]int</code> 但没 <code>make</code>，它就是 nil。
          <strong>读 nil map 不会报错</strong>（返回零值），但<strong>写 nil map 会直接 panic</strong>，
          这个不对称非常坑。结构体里的 map 字段尤其危险——它默认就是 nil，必须在构造时初始化。
          记住口诀：<strong>map 用前先 make，slice 可以直接 append</strong>。
        </>
      ),
    },
  },
  {
    id: 'singleton',
    category: '设计模式',
    title: '单例与懒加载初始化',
    titleEn: 'Singleton / Lazy Init',
    scenario:
      '配置加载、连接池、客户端实例通常全局只需一份。Java 靠 Spring 容器管理单例，Go 没有容器，用 sync.Once 实现线程安全的懒加载。',
    javaCode: `// Java: Spring 默认单例，或经典 DCL 双重检查锁
@Component
public class ConfigHolder {
    // Spring 保证容器内单例
}

// 不用 Spring 时的双重检查锁（容易写错）
public class Lazy {
    private static volatile Lazy instance;
    public static Lazy get() {
        if (instance == null) {
            synchronized (Lazy.class) {
                if (instance == null) {
                    instance = new Lazy();
                }
            }
        }
        return instance;
    }
}`,
    goCode: `// Go: sync.Once —— 标准、简洁、绝对线程安全
var (
    once     sync.Once
    instance *Config
)

func GetConfig() *Config {
    once.Do(func() {
        instance = loadConfigFromFile() // 全局只执行一次
    })
    return instance
}

// Go 1.21+ 更简洁：
// var GetConfig = sync.OnceValue(func() *Config {
//     return loadConfigFromFile()
// })`,
    highlights: [
      { java: 'volatile', go: 'sync.Once' },
      { java: 'synchronized', go: 'once.Do' },
    ],
    gotcha: {
      level: 'tip',
      title: '别手写双重检查锁，用 sync.Once',
      javaWay: 'volatile + synchronized + 双重 null 检查（极易写错内存可见性）',
      goWay: 'once.Do(func(){ ... }) // 一行，永远正确',
      body: (
        <>
          Java 的双重检查锁（DCL）历史上因为指令重排序坑了无数人，必须配合 <code>volatile</code> 才正确。
          Go 直接提供 <code>sync.Once</code>，<code>Do</code> 内的函数保证<strong>有且仅执行一次</strong>，
          且对所有 goroutine 内存可见，无需你操心锁和可见性。Go 1.21 还新增了{' '}
          <code>sync.OnceValue</code> / <code>sync.OnceFunc</code>，连全局变量都省了。
        </>
      ),
    },
  },
  {
    id: 'graceful-shutdown',
    category: '工程',
    title: '优雅关闭与信号处理',
    titleEn: 'Graceful Shutdown',
    scenario:
      '服务收到 SIGTERM（如 K8s 滚动更新）时，要先停止接收新请求、再把手头的活做完。Java 用 ShutdownHook，Go 用 signal.NotifyContext + context。',
    javaCode: `// Java: 注册 JVM 关闭钩子
HttpServer server = startServer();
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
    System.out.println("shutting down...");
    server.stop(10); // 最多等 10 秒
}));`,
    goCode: `// Go: context + signal，关闭逻辑显式可控
func main() {
    // 收到 Ctrl+C / SIGTERM 时自动 cancel ctx
    ctx, stop := signal.NotifyContext(context.Background(),
        syscall.SIGINT, syscall.SIGTERM)
    defer stop()

    srv := &http.Server{Addr: ":8080", Handler: router()}

    go func() {
        if err := srv.ListenAndServe(); err != nil &&
            err != http.ErrServerClosed {
            log.Fatal(err)
        }
    }()

    <-ctx.Done() // 阻塞直到收到信号
    log.Println("shutting down...")

    // 给在途请求 10 秒处理时间
    shutdownCtx, cancel := context.WithTimeout(
        context.Background(), 10*time.Second)
    defer cancel()
    srv.Shutdown(shutdownCtx)
}`,
    highlights: [
      { java: 'addShutdownHook', go: 'NotifyContext' },
      { java: 'Thread', go: 'go' },
    ],
    gotcha: {
      level: 'tip',
      title: 'context 是 Go 优雅关闭的中枢',
      javaWay: 'ThreadLocal / 全局 volatile 标志位 来传递“该停了”',
      goWay: '把 ctx 一路传到每个 goroutine，<-ctx.Done() 统一感知取消',
      body: (
        <>
          Java 里取消信号常靠中断标志或共享标志位隐式传递。Go 把它显式化为{' '}
          <code>context.Context</code>：从 <code>main</code> 开始，把 <code>ctx</code>{' '}
          作为<strong>第一个参数</strong>一路传给每个下游函数和 goroutine。任何一层调用都能通过{' '}
          <code>&lt;-ctx.Done()</code> 感知到“该收尾了”。请把 <code>ctx</code> 显式传递当成肌肉记忆，
          不要塞进 struct 字段，更不要用全局变量。
        </>
      ),
    },
  },
]

const categories = ['全部', ...Array.from(new Set(examples.map((e) => e.category)))]

export default function ExamplesPage() {
  const [activeCat, setActiveCat] = useState('全部')

  const filtered =
    activeCat === '全部'
      ? examples
      : examples.filter((e) => e.category === activeCat)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-accent font-mono mb-2 block">
          Cookbook · 速查菜谱
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-3">
          📚 实战示例库
          <span className="text-base font-normal text-muted-fg">Examples Library</span>
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          不想翻教科书时来这里。每个片段都是企业开发的高频套路：左 Java、右 Go 的可复制对比，
          外加一句话<strong className="text-foreground">「避坑点评」</strong>——
          直接告诉你哪里会 panic、哪里有默认值陷阱。
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-10 sticky top-16 z-30 py-3 bg-background/80 backdrop-blur-sm">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border cursor-pointer
              ${
                activeCat === cat
                  ? 'bg-accent text-white border-accent shadow-sm'
                  : 'bg-muted text-muted-fg border-card-border hover:text-foreground hover:bg-muted-hover'
              }`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-muted-fg font-mono">
          {filtered.length} / {examples.length} 个示例
        </span>
      </div>

      {/* Examples */}
      <div className="space-y-20">
        {filtered.map((ex, idx) => (
          <section key={ex.id} id={ex.id} className="scroll-mt-32">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-md bg-accent-light text-accent text-[11px] font-semibold">
                {ex.category}
              </span>
              <span className="text-xs text-muted-fg font-mono">
                #{String(idx + 1).padStart(2, '0')}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {ex.title}{' '}
              <span className="text-base font-normal text-muted-fg">/ {ex.titleEn}</span>
            </h2>
            <p className="text-muted-fg leading-relaxed mb-2">{ex.scenario}</p>

            <CodeDuel
              title={`${ex.title} — Java ☕ vs Go 🐹`}
              javaCode={ex.javaCode}
              goCode={ex.goCode}
              highlights={ex.highlights}
            />

            <GotchaCallout
              level={ex.gotcha.level}
              title={ex.gotcha.title}
              javaWay={ex.gotcha.javaWay}
              goWay={ex.gotcha.goWay}
            >
              {ex.gotcha.body}
            </GotchaCallout>
          </section>
        ))}
      </div>
    </div>
  )
}
