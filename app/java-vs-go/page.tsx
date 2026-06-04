import { CodeDuel } from '@/components/code-duel'
import { GotchaCallout } from '@/components/gotcha-callout'

interface Row {
  concept: string
  java: string
  go: string
  note?: string
}

interface MappingGroup {
  id: string
  title: string
  icon: string
  rows: Row[]
}

const groups: MappingGroup[] = [
  {
    id: 'keywords',
    title: '关键字与修饰符',
    icon: '🔑',
    rows: [
      { concept: '访问控制', java: 'public / private / protected', go: '首字母大写 = 导出，小写 = 包内私有', note: 'Go 没有 protected，可见性由命名决定' },
      { concept: '常量', java: 'final int X = 1;', go: 'const X = 1', note: 'Go 的 const 仅支持编译期常量' },
      { concept: '静态成员', java: 'static', go: '包级变量 / 函数', note: 'Go 无 static，用包作用域替代' },
      { concept: '枚举', java: 'enum Color { RED, GREEN }', go: 'const ( Red = iota; Green )', note: 'iota 自增；本质是类型别名 + 常量组' },
      { concept: '三元运算符', java: 'a > b ? a : b', go: '（无）必须写 if/else', note: 'Go 故意删除三元，强制可读' },
      { concept: '行尾分号', java: '必须写 ;', go: '编译器自动插入，不写', note: '所以 { 必须与控制语句同行' },
    ],
  },
  {
    id: 'types',
    title: '类型系统',
    icon: '🧬',
    rows: [
      { concept: '整型', java: 'int / Integer / long', go: 'int / int32 / int64', note: 'Go 无包装类，无装箱拆箱' },
      { concept: '浮点', java: 'double / float', go: 'float64 / float32', note: '默认 float64' },
      { concept: '布尔', java: 'boolean / Boolean', go: 'bool', note: '零值为 false' },
      { concept: '字符串', java: 'String（UTF-16，不可变）', go: 'string（UTF-8 字节，不可变）', note: '遍历 rune 才是字符，len() 是字节数' },
      { concept: '字符', java: 'char（16 位）', go: 'rune（int32，一个 Unicode 码点）', note: 'byte = uint8' },
      { concept: '空值', java: 'null', go: 'nil', note: 'nil 可用于指针/接口/map/slice/chan/func' },
      { concept: '万能类型', java: 'Object', go: 'any（即 interface{}）', note: 'Go 1.18 起 any 是 interface{} 的别名' },
      { concept: '类型转换', java: '(int) x 强转', go: 'int(x) 显式转换', note: 'Go 不存在隐式数值转换，必须显式' },
    ],
  },
  {
    id: 'collections',
    title: '集合与数据结构',
    icon: '📦',
    rows: [
      { concept: '动态数组', java: 'ArrayList<T>', go: '[]T（slice）', note: 'append 扩容；切片是底层数组的视图' },
      { concept: '定长数组', java: 'T[] arr', go: '[N]T', note: 'Go 数组长度是类型的一部分' },
      { concept: '哈希表', java: 'HashMap<K,V>', go: 'map[K]V', note: '用前必须 make；遍历顺序随机' },
      { concept: '集合 Set', java: 'HashSet<T>', go: 'map[T]struct{}', note: 'struct{} 零内存占位' },
      { concept: '队列/栈', java: 'Deque / LinkedList', go: 'slice 自行实现 或 container/list', note: '标准库没有现成 Queue' },
      { concept: '遍历', java: 'for (T t : list)', go: 'for i, v := range list', note: 'range 返回索引和值的拷贝' },
      { concept: '排序', java: 'Collections.sort(list)', go: 'slices.Sort(s) / sort.Slice', note: 'Go 1.21+ 用泛型 slices 包' },
    ],
  },
  {
    id: 'oop',
    title: '面向对象 → 组合',
    icon: '🏗️',
    rows: [
      { concept: '类', java: 'class User { }', go: 'type User struct { }', note: '数据与方法分离定义' },
      { concept: '方法', java: '类内定义方法', go: 'func (u User) Name() string', note: '通过 receiver 绑定到类型' },
      { concept: '构造函数', java: 'new User(...)', go: 'func NewUser(...) *User', note: '约定俗成的 New 工厂函数，无关键字' },
      { concept: '继承', java: 'class B extends A', go: 'struct B { A } 嵌入', note: '组合优于继承，字段/方法被提升' },
      { concept: '接口实现', java: 'implements Runnable（显式）', go: '只要方法签名匹配即自动实现', note: '鸭子类型，隐式满足' },
      { concept: '抽象方法', java: 'abstract method', go: 'interface 中声明方法', note: 'Go 无 abstract class' },
      { concept: '多态', java: '父类引用指向子类', go: '接口变量持有任意实现', note: '小接口（Reader/Writer）是惯例' },
      { concept: 'getter/setter', java: 'getName()/setName()', go: '直接导出字段 u.Name', note: '需要逻辑时才加方法，不要无脑封装' },
    ],
  },
  {
    id: 'errors',
    title: '异常 → 错误值',
    icon: '🛡️',
    rows: [
      { concept: '抛出错误', java: 'throw new Exception()', go: 'return errors.New("...")', note: '错误是返回值，不是控制流' },
      { concept: '捕获', java: 'try { } catch (E e) { }', go: 'if err != nil { }', note: '在调用处立即处理' },
      { concept: '清理', java: 'finally { }', go: 'defer cleanup()', note: 'defer 在函数返回前执行（LIFO）' },
      { concept: '错误包装', java: 'new E(msg, cause)', go: 'fmt.Errorf("...: %w", err)', note: '%w 保留错误链' },
      { concept: '类型判断', java: 'catch (SpecificE e)', go: 'errors.As(err, &target)', note: 'errors.Is 判断哨兵错误' },
      { concept: '不可恢复', java: 'RuntimeException / Error', go: 'panic（仅用于真正的 bug）', note: 'recover 只在 defer 中生效' },
      { concept: '受检异常', java: 'throws IOException', go: '（无）返回签名里的 error', note: 'Go 没有受检/非受检之分' },
    ],
  },
  {
    id: 'concurrency',
    title: '并发模型',
    icon: '⚡',
    rows: [
      { concept: '并发单元', java: 'Thread / Runnable（MB 级栈）', go: 'goroutine（KB 级栈）', note: 'go f() 即可启动，可开百万个' },
      { concept: '线程池', java: 'ExecutorService', go: 'goroutine + 有缓冲 chan 限流', note: '无需池化，按需启动' },
      { concept: '互斥锁', java: 'synchronized / ReentrantLock', go: 'sync.Mutex', note: 'Go 的 Mutex 不可重入！' },
      { concept: '读写锁', java: 'ReadWriteLock', go: 'sync.RWMutex', note: '' },
      { concept: '等待完成', java: 'CountDownLatch / join()', go: 'sync.WaitGroup', note: 'Add/Done/Wait 三件套' },
      { concept: '阻塞队列', java: 'BlockingQueue', go: 'chan T（带缓冲）', note: '通信即同步' },
      { concept: '一次性初始化', java: '双重检查锁', go: 'sync.Once', note: '永远正确，无可见性问题' },
      { concept: '原子操作', java: 'AtomicInteger', go: 'atomic.Int64（Go 1.19+）', note: '' },
      { concept: '上下文传递', java: 'ThreadLocal（隐式）', go: 'context.Context（显式第一参数）', note: '取消/超时/值传递' },
      { concept: 'Future', java: 'CompletableFuture', go: 'chan 结果 / errgroup', note: '' },
    ],
  },
  {
    id: 'toolchain',
    title: '工程与工具链',
    icon: '⚙️',
    rows: [
      { concept: '依赖管理', java: 'Maven / Gradle (pom.xml)', go: 'go mod (go.mod)', note: '无中央仓库，直接拉 Git' },
      { concept: '构建产物', java: 'jar/war（需 JRE）', go: '单一静态二进制', note: '无运行时依赖，镜像可做到 10MB' },
      { concept: '包管理', java: 'package + import', go: 'package + import', note: 'Go 的包以目录为单位' },
      { concept: '单元测试', java: 'JUnit + Mockito', go: 'testing 包 + 表驱动', note: '文件名 _test.go，函数 TestXxx' },
      { concept: '依赖注入', java: 'Spring @Autowired（反射容器）', go: 'main.go 手动 wire / google/wire', note: '显式组装，无运行时容器' },
      { concept: '格式化', java: '团队各自配置', go: 'gofmt（唯一标准）', note: '风格之争被官方终结' },
      { concept: '空接口检查', java: '编译器 + 注解', go: 'go vet / staticcheck', note: '' },
    ],
  },
]

export default function JavaVsGoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-accent font-mono mb-2 block">Cheat Sheet · 思维转换备忘录</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-3">
          🔄 Java vs Go 核心差异
          <span className="text-base font-normal text-muted-fg">Language Mapping</span>
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          一张随时校准思维范式的速查表。当你不确定「Java 的这个，Go 里对应什么」时，
          回这里扫一眼。重点是<strong className="text-foreground">别带着 Java 腔调写 Go</strong>——
          下方关键差异附了可运行的代码演示。
        </p>
      </div>

      {/* Quick nav */}
      <nav className="flex flex-wrap gap-2 mb-12">
        {groups.map((g) => (
          <a
            key={g.id}
            href={`#${g.id}`}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-fg
                       border border-card-border hover:text-accent hover:border-accent/30
                       transition-all duration-200 flex items-center gap-1.5"
          >
            <span>{g.icon}</span>
            {g.title}
          </a>
        ))}
      </nav>

      {/* Mapping tables */}
      <div className="space-y-14">
        {groups.map((g) => (
          <section key={g.id} id={g.id} className="scroll-mt-24">
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
              <span>{g.icon}</span>
              {g.title}
            </h2>
            <div className="rounded-2xl border border-card-border overflow-hidden shadow-[var(--shadow-sm)]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/60 text-left">
                      <th className="py-3 px-4 font-bold text-foreground w-1/6">概念</th>
                      <th className="py-3 px-4 font-bold text-java w-1/4">Java ☕</th>
                      <th className="py-3 px-4 font-bold text-go w-1/4">Go 🐹</th>
                      <th className="py-3 px-4 font-bold text-foreground">关键提示</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/60">
                    {g.rows.map((r, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors align-top">
                        <td className="py-3 px-4 font-semibold text-foreground">{r.concept}</td>
                        <td className="py-3 px-4 font-mono text-xs text-foreground/80 leading-relaxed">{r.java}</td>
                        <td className="py-3 px-4 font-mono text-xs text-foreground/80 leading-relaxed">{r.go}</td>
                        <td className="py-3 px-4 text-xs text-muted-fg leading-relaxed">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Deep-dive code demos */}
      <div className="mt-20 pt-10 border-t border-card-border">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">🔬 三个最易“写出 Java 腔”的差异</h2>
        <p className="text-muted-fg mb-8 leading-relaxed">
          表格能记住「对应关系」，但有些差异必须看代码才能形成肌肉记忆。下面三个是 Java 程序员转 Go 最常翻车的地方。
        </p>

        <section id="demo-sync" className="scroll-mt-24 mb-14">
          <h3 className="text-xl font-bold mb-2">① synchronized → 通信而非共享</h3>
          <p className="text-muted-fg mb-2 leading-relaxed">
            Java 用锁保护共享变量；Go 更推荐用 channel 让数据“只属于一个 goroutine”。
            下面计数器，左边是锁的思路（Go 也支持），右边是 channel 的 Go 惯用思路。
          </p>
          <CodeDuel
            title="并发计数器：锁 vs 通道"
            highlights={[
              { java: 'synchronized', go: 'Mutex' },
              { java: 'Lock', go: 'Mutex' },
            ]}
            javaCode={`// Java: 用 synchronized 保护共享状态
public class Counter {
    private int value = 0;

    public synchronized void inc() {
        value++;
    }

    public synchronized int get() {
        return value;
    }
}`}
            goCode={`// Go 思路 A：sync.Mutex（最接近 Java）
type Counter struct {
    mu    sync.Mutex
    value int
}

func (c *Counter) Inc() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.value++
}

// Go 思路 B（更地道）：让一个 goroutine 独占状态，
// 其余 goroutine 通过 channel 发指令，从根上避免竞争。
// ch := make(chan int)
// go func() { total := 0; for d := range ch { total += d } }()`}
          />
          <GotchaCallout
            level="warning"
            title="sync.Mutex 不可重入！"
            javaWay="synchronized 方法里调另一个 synchronized 方法 —— 可重入，没事"
            goWay="已 Lock 的 goroutine 再次 Lock 同一把锁 —— 直接死锁"
          >
            Java 的 <code>synchronized</code> 和 <code>ReentrantLock</code> 是<strong>可重入</strong>的：同一线程能反复获取自己已持有的锁。
            Go 的 <code>sync.Mutex</code> <strong>不可重入</strong>——在持锁状态下再次 <code>Lock()</code> 会立刻死锁。
            所以别把“加锁的公共方法”互相调用，应把临界区逻辑抽到一个不加锁的私有函数里。
          </GotchaCallout>
        </section>

        <section id="demo-generics" className="scroll-mt-24 mb-14">
          <h3 className="text-xl font-bold mb-2">② 泛型：类型擦除 vs 真泛型</h3>
          <p className="text-muted-fg mb-2 leading-relaxed">
            Java 泛型在编译后被擦除（运行时是 Object）；Go 1.18 的泛型通过类型参数 + 约束在编译期实例化，运行时保留类型信息。
          </p>
          <CodeDuel
            title="泛型 Map 函数"
            highlights={[
              { java: 'interface', go: 'interface' },
            ]}
            javaCode={`// Java: 类型参数 <T, R>，运行时被擦除为 Object
public static <T, R> List<R> map(
        List<T> list, Function<T, R> fn) {
    List<R> result = new ArrayList<>();
    for (T t : list) {
        result.add(fn.apply(t));
    }
    return result;
}

// 调用
List<Integer> lens = map(names, String::length);`}
            goCode={`// Go: 类型参数 [T, R any]，编译期实例化
func Map[T, R any](s []T, fn func(T) R) []R {
    result := make([]R, 0, len(s))
    for _, v := range s {
        result = append(result, fn(v))
    }
    return result
}

// 调用（类型自动推导）
lens := Map(names, func(s string) int {
    return len(s)
})`}
          />
          <GotchaCallout
            level="tip"
            title="约束（constraints）取代 extends 边界"
          >
            Java 用 <code>{'<T extends Comparable<T>>'}</code> 约束类型边界；Go 用 <strong>约束接口</strong>，
            如 <code>{'[T constraints.Ordered]'}</code> 表示“可比较大小的类型”。
            一个实战建议：<strong>不要一上来就泛型化</strong>。Go 社区偏好先写具体类型，确实出现重复时再抽象——
            过度泛型同样违背 “Clear is better than clever”。
          </GotchaCallout>
        </section>

        <section id="demo-constructor" className="scroll-mt-24">
          <h3 className="text-xl font-bold mb-2">③ 没有构造函数，如何做字段校验？</h3>
          <p className="text-muted-fg mb-2 leading-relaxed">
            Go 没有构造函数关键字。约定用 <code>NewXxx</code> 工厂函数承担“校验 + 初始化”的职责，并返回 <code>(*T, error)</code>。
          </p>
          <CodeDuel
            title="带校验的对象创建"
            highlights={[
              { java: 'throw', go: 'error' },
              { java: 'new', go: 'func' },
            ]}
            javaCode={`// Java: 构造函数里抛异常
public class Account {
    private final String owner;
    private final int balance;

    public Account(String owner, int balance) {
        if (owner == null || owner.isBlank()) {
            throw new IllegalArgumentException("owner required");
        }
        if (balance < 0) {
            throw new IllegalArgumentException("balance < 0");
        }
        this.owner = owner;
        this.balance = balance;
    }
}

Account a = new Account("alice", 100);`}
            goCode={`// Go: New 工厂函数返回 (*T, error)
type Account struct {
    owner   string // 小写=私有，强制外部走 New
    balance int
}

func NewAccount(owner string, balance int) (*Account, error) {
    if strings.TrimSpace(owner) == "" {
        return nil, errors.New("owner required")
    }
    if balance < 0 {
        return nil, errors.New("balance < 0")
    }
    return &Account{owner: owner, balance: balance}, nil
}

a, err := NewAccount("alice", 100)
if err != nil {
    return err
}`}
          />
          <GotchaCallout
            level="danger"
            title="零值结构体绕过一切校验"
            javaWay="new Account(...) 是创建对象的唯一入口，校验无法绕过"
            goWay="var a Account // 合法！owner='' balance=0，完全绕开了 NewAccount 的校验"
          >
            Go 里 <code>var a Account</code> 或 <code>Account{'{}'}</code> 永远合法，会得到一个零值结构体——
            它<strong>绕过了你 New 函数里的所有校验</strong>。防御办法：把字段设为<strong>私有（小写）</strong>，
            只暴露 <code>NewAccount</code> 作为入口；这样包外代码无法构造出未经校验的实例。
            这是 Go 用“可见性”而非“构造函数”来保证不变量的核心套路。
          </GotchaCallout>
        </section>
      </div>
    </div>
  )
}
