'use client'

import { CodeDuel } from '@/components/code-duel'
import { GoPlayground } from '@/components/go-playground'
import { GotchaCallout } from '@/components/gotcha-callout'
import { MindShift } from '@/components/mind-shift'
import { ChapterQuiz } from '@/components/chapter-quiz'
import Link from 'next/link'
import { ChapterIcon } from '@/components/chapter-icon'

export default function OOPPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      {/* Chapter header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-accent font-mono mb-2 block">Chapter 2</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-2.5">
          <span className="text-purple-500"><ChapterIcon id="oop" className="w-8 h-8" /></span>
          <span>结构篇 — OOP → Composition</span>
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          告别深重的类继承树，拥抱扁平的结构体组合。Go 的设计哲学是<strong>“组合优于继承”</strong>，并通过隐式接口（鸭子类型）实现了极致的解耦与多态。
        </p>
      </div>

      <MindShift
        type="inheritance-to-composition"
        title="继承树 → 扁平组合"
        javaConcept="深层类继承关系"
        goConcept="扁平结构体组合"
        description="Java 习惯用 extends 构建纵向层次；Go 拒绝继承，提倡用隐式接口与嵌套（Embedding）建立松耦合的横向组合。"
      />

      {/* Section 1: Struct vs Class */}
      <section id="struct" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">2.1</span>
          类与结构体：getter/setter 消失术
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 极度崇尚“封装”，提倡将字段设为 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">private</code>，然后编写大量的 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">getter/setter</code> 方法（或使用 Lombok 插件）。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          在 Go 中，<strong>结构体（Struct）没有这些繁杂的模板代码</strong>。Go 采用了一种极其直观的封装规则：<strong>首字母大小写决定可见性</strong>。
          首字母大写的字段/函数会被“导出”（相当于 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">public</code>，包外可见）；首字母小写的字段/函数则是“未导出”的（相当于同一包内可见的包私有，或者同一包内的 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">private</code>）。并且，Go 并不建议无脑为每个小写字段写 getter/setter，而是提倡直接访问导出字段，除非有复杂的逻辑校验。
        </p>

        <CodeDuel
          title="Class 封装 vs Struct 导出"
          javaCode={`// Java: 属性封装 + Getter/Setter
public class Account {
    private String id;
    private double balance;

    public Account(String id, double balance) {
        this.id = id;
        this.balance = balance;
    }

    public String getId() { return id; }
    
    public double getBalance() { return balance; }
    
    public void deposit(double amt) {
        if (amt > 0) this.balance += amt;
    }
}`}
          goCode={`// Go: 首字母大写导出，小写私有
package bank

type Account struct {
    ID      string    // 首字母大写：公开字段，外部直接读写
    balance float64   // 首字母小写：包内私有，外部不可见
}

// 构造工厂函数 (习惯命名为 NewXxx)
func NewAccount(id string, initial float64) *Account {
    return &Account{ID: id, balance: initial}
}

// 方法：通过指针接收者修改 balance
func (a *Account) Deposit(amt float64) {
    if amt > 0 {
        a.balance += amt // 外部无法直接修改 a.balance
    }
}`}
          highlights={[
            { java: 'private double balance', go: 'balance float64' },
            { java: 'public Account', go: 'func NewAccount' },
            { java: 'this.balance', go: 'a.balance' },
          ]}
        />

        <GotchaCallout
          level="tip"
          title="零值可用（Make Zero-Value Useful）"
          javaWay={`// Java 必须要 new 实例并调用构造函数初始化所有组件`}
          goWay={`var buf bytes.Buffer // 无需显式初始化即可使用！
buf.WriteString("hello")`}
        >
          Go 的一项经典最佳实践是**让结构体的零值可以直接使用**。例如 Go 内部的 <code>sync.Mutex</code> 声明后即可直接加锁，不需要 <code>NewMutex()</code>。当设计结构体时，尽量避免“必须调用构造函数才能工作”的设计。
        </GotchaCallout>

        <GoPlayground
          id="oop-struct"
          title="练习：定义带有校验的 BankAccount"
          difficulty="easy"
          description="定义一个 BankAccount 结构体，包含导出字段 Owner，以及未导出字段 balance。实现 Deposit（存款，非负数）和 Withdraw（取款，不能超支）方法。"
          starterCode={`package main

import "fmt"

// TODO: 定义 BankAccount 结构体
type BankAccount struct {
	// ...
}

// TODO: 实现 NewBankAccount 工厂函数
func NewBankAccount(owner string, initial float64) *BankAccount {
	return nil
}

// TODO: 实现 Deposit(amt float64) 和 Withdraw(amt float64) bool 方法
// 提示：用指针接收者 (*BankAccount)

func main() {
	acc := NewBankAccount("Alice", 100)
	acc.Deposit(50)
	// 预期存款后余额 150，取款 200 失败，取款 80 成功且剩余 70
	fmt.Println("Owner:", acc.Owner)
}`}
          solution={`package main

import "fmt"

type BankAccount struct {
	Owner   string
	balance float64
}

func NewBankAccount(owner string, initial float64) *BankAccount {
	return &BankAccount{Owner: owner, balance: initial}
}

func (a *BankAccount) Deposit(amt float64) {
	if amt > 0 {
		a.balance += amt
	}
}

func (a *BankAccount) Withdraw(amt float64) bool {
	if amt > 0 && a.balance >= amt {
		a.balance -= amt
		return true
	}
	return false
}

func (a *BankAccount) GetBalance() float64 {
	return a.balance
}

func main() {
	acc := NewBankAccount("Alice", 100)
	acc.Deposit(50)
	fmt.Printf("Balance after deposit: %.1f\n", acc.GetBalance())
	w1 := acc.Withdraw(200)
	fmt.Printf("Withdraw 200: %v\n", w1)
	w2 := acc.Withdraw(80)
	fmt.Printf("Withdraw 80: %v, remaining: %.1f\n", w2, acc.GetBalance())
}`}
          expectedOutput={`Balance after deposit: 150.0
Withdraw 200: false
Withdraw 80: true, remaining: 70.0`}
          hints={[
            '若要在方法内改变结构体内部字段，必须使用指针接收者: (a *BankAccount)',
            '只读的 balance 字段需要一个小写的变量名，并通过一个类似 GetBalance() 的方法暴露给外部',
          ]}
        />
      </section>

      {/* Section 2: Embedding */}
      <section id="embedding" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">2.2</span>
          继承 vs 嵌入：没有多态的“继承”
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 习惯用 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">extends</code> 让子类继承父类的属性和方法。子类自动具有父类的类型特征，并可以向上转型实现多态。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 不支持类继承。Go 使用<strong>结构体嵌入（Struct Embedding）</strong>（也称匿名内部结构体）来实现代码复用。当一个结构体嵌入另一个结构体时，外部结构体会“继承”（提升）内部结构体的字段和方法。
          <strong>但请注意：这只是单纯的代码复用和字段提升，并没有父子类型关系！</strong> 外部结构体无法当成内部结构体使用。
        </p>

        <CodeDuel
          title="继承多态 vs 嵌入组合"
          javaCode={`// Java: extends 具有类型兼容性
class Engine {
    void start() { System.out.println("Vroom"); }
}

class Car extends Engine {
    // 继承了 start()
}

Engine e = new Car();         // 向上转型（多态）
e.start();`}
          goCode={`// Go: 嵌入只是字段提升语法糖
type Engine struct{}

func (e *Engine) Start() { fmt.Println("Vroom") }

type Car struct {
    Engine                     // 匿名嵌入
}

c := Car{}
c.Start()                      // 自动“提升”：相当于 c.Engine.Start()

// ❌ 编译错误！Car 不是 Engine 类型
// var e Engine = Car{} `}
          highlights={[
            { java: 'class Car extends Engine', go: 'Engine (匿名嵌入)' },
            { java: 'Engine e = new Car()', go: 'Car 不是 Engine 类型' },
          ]}
        />

        <GotchaCallout
          level="warning"
          title="方法重写 (Overriding) 并没有多态效果"
          javaWay={`class Parent { void print() { log("P"); } }
class Child extends Parent { void print() { log("C"); } }
Parent p = new Child();
p.print(); // 动态绑定，执行的是 Child 的 print()`}
          goWay={`type Parent struct{}
func (Parent) Print() { fmt.Println("Parent") }
type Child struct { Parent }
func (Child) Print() { fmt.Println("Child") }

var c Child
c.Print()        // 打印 "Child" （覆盖）
c.Parent.Print() // 打印 "Parent" （显式调用）
// 没有向上转型的概念！`}
        >
          Go 的结构体嵌入不能实现真正的虚方法调用（Dynamic Dispatch）。当外层结构体“重写”内层方法时，内层结构体自己的其他内部调用**不会**跳转到外层重写的方法。它依然是物理的嵌套关系，而非继承树。
        </GotchaCallout>
      </section>

      {/* Section 3: Interfaces */}
      <section id="interfaces" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">2.3</span>
          接口实现：显式契约 vs 鸭子类型 (Duck Typing)
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 的接口实现是“侵入式”的：类必须通过 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">implements</code> 显式声明它实现了某个接口。这也意味着，如果您引用了第三方库的 Class，但在您的系统里想用一个自定义接口去接它，您必须写一个适配器（Adapter）类。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 的接口则是<strong>非侵入式</strong>的，俗称<strong>鸭子类型（Duck Typing）</strong>：“如果它走起来像鸭子，叫起来也像鸭子，那它就是鸭子”。
          只要一个结构体实现了一个接口所声明的所有方法，Go 编译器就会自动判定该结构体实现了这个接口。您不需要在结构体上写任何实现声明！这能让您在自己的包中自由定义小接口，解耦第三方库。
        </p>

        <CodeDuel
          title="显式 implements vs 鸭子类型"
          javaCode={`// Java: 强绑定契约
interface Reader {
    String readData();
}

// 必须声明 implements，否则无法向上转型
class FileReader implements Reader {
    public String readData() { return "data"; }
}`}
          goCode={`// Go: 自动隐式契约
type Reader interface {
    ReadData() string
}

type FileReader struct{}

// 没有任何 "implements Reader" 的痕迹
func (f FileReader) ReadData() string {
    return "data"
}

// 只要FileReader定义了该方法，即可隐式转换：
var r Reader = FileReader{}`}
          highlights={[
            { java: 'implements Reader', go: '(隐式绑定)' },
          ]}
        />

        <div className="my-6 p-5 rounded-xl bg-card border border-card-border">
          <h4 className="text-sm font-bold mb-2 text-foreground">🔬 Go 接口底层：`iface` 内存解密</h4>
          <p className="text-sm text-muted-fg leading-relaxed">
            Go 接口变量的底层并不是普通的指针，它在运行时被表示为包含两个字段的结构体 <strong>iface</strong>：
          </p>
          <ul className="text-sm text-muted-fg list-disc pl-5 my-2">
            <li><strong>tab 指针</strong>：指向包含该变量的实际动态类型、接口类型和具体方法表的元数据（itab）。</li>
            <li><strong>data 指针</strong>：指向实际数据的物理内存地址。</li>
          </ul>
          <p className="text-sm text-muted-fg leading-relaxed">
            这解释了为什么 Go 中的接口可以用 <code>r == nil</code> 比较，但当接口变量包含一个非 nil 的具体类型指针（如内容为 nil 的结构体）时，接口变量本身 <code>r != nil</code>。这是经典的 Go 面试陷阱！
          </p>
        </div>
      </section>

      {/* Section 4: Generics */}
      <section id="generics" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">2.4</span>
          泛型：类型具化 vs 类型擦除 (Type Erasure)
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 从 5.0 开始支持泛型。但为了向下兼容，Java 泛型采用的是<strong>类型擦除（Type Erasure）</strong>机制。在编译期，所有泛型类型（如 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">List&lt;String&gt;</code>）都会被擦除为原始的 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">Object</code>，运行时没有真正的泛型信息，容易造成强制类型转换的性能损耗，且无法通过反射获取泛型对象的 Class。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 在 1.18+ 引入了泛型。Go 采用的是<strong>类型具化（Monomorphization）</strong>机制。编译期，编译器会将泛型函数或结构体针对具体使用的类型进行展开实例化。
          如果调用了 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">Max[int]</code> 和 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">Max[float64]</code>，编译器会物理生成两份代码。因此，Go 泛型在运行时不需要任何动态反射或类型转换，效率与手写特定类型完全一致。
        </p>

        <MindShift
          type="generics-comparison"
          title="泛型编译机制对比"
          javaConcept="Java 编译后擦除为 Object"
          goConcept="Go 编译后具化为多份实体代码"
          description="Java 运行期共享单份代码（擦除），Go 运行期具备强物理类型（具化）。"
        />
      </section>

      {/* Section 5: Packages & DI */}
      <section id="pkg-di" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">2.5</span>
          [新增] 包设计与依赖注入：消除反射魔法
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          <strong>在 Java Spring 生态中</strong>，我们习惯于深度递归目录，为每个微小概念建包，并写满大量注解（<code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">@Component</code>, <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">@Autowired</code>）。Spring 通过在启动时动态扫描 Classpath，用**大量的反射和动态代理**在运行时拼装依赖关系，将配置“魔法化”。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          <strong>在 Go 的工程规范里，提倡扁平包设计和显式连线（Explicit Wiring）</strong>。Go 不支持动态类加载，也没有运行时反射容器。
          Go 提倡：所有的组件依赖关系应该在 `main()` 函数启动时，通过纯代码显式创建并注入构造器中，或者使用代码生成工具（如 Google Wire）在编译前自动生成显式组装的代码。
        </p>

        <CodeDuel
          title="Spring DI 反射 vs Go 构造注入"
          javaCode={`// Java: Spring 运行时反射自动扫描并注入
@Service
public class UserService {
    @Autowired
    private UserDao userDao; // 隐式自动装配
    
    public void register(String name) {
        userDao.save(name);
    }
}`}
          goCode={`// Go: 显式连线（无需运行时反射容器）
package service

type UserService struct {
    userDao db.UserDao // 显式字段，常通过接口声明
}

// 显式构造注入
func NewUserService(dao db.UserDao) *UserService {
    return &UserService{userDao: dao}
}

func (s *UserService) Register(name string) {
    s.userDao.Save(name)
}

// ---- main.go 中手动拼装 ----
func main() {
    dao := db.NewSQLUserDao()
    svc := service.NewUserService(dao) // 彻底消除依赖魔法，结构清晰
    svc.Register("Bob")
}`}
          highlights={[
            { java: '@Autowired', go: 'NewUserService(dao)' },
            { java: '运行时扫描', go: 'main.go 中手动组装' },
          ]}
        />

        <GotchaCallout
          level="danger"
          title="包的循环依赖（Circular Dependency）"
          javaWay={`// Java Spring 允许 A 注入 B，B 注入 A（通过三级缓存解决）`}
          goWay={`// package a 导入 package b，package b 导入 package a
// 编译错误：import cycle not allowed`}
        >
          这是 Java 程序员写 Go 时碰到的最大阻碍之一。Go 在编译期彻底禁止包之间的循环引用。
          如果遇到循环依赖，说明您的包划分不合理。解决方法是：
          1. 提取公共接口到第三个包。
          2. 将两个包合并。
          3. 使用隐式接口在调用端解耦。
        </GotchaCallout>

        <GoPlayground
          id="oop-di"
          title="练习：手动实现依赖注入"
          difficulty="medium"
          description="定义一个 DB 接口（含 Query 方法），实现 MockDB 结构体。再定义一个 UserService 并注入 DB 接口，通过手动组装测试注册逻辑。"
          starterCode={`package main

import "fmt"

// TODO: 定义 DB 接口，包含 Query(sql string) string 方法
type DB interface {
	// ...
}

// TODO: 实现 MockDB 结构体，实现 DB 接口
type MockDB struct{}

// TODO: 实现 UserService 结构体，持有 DB 接口，实现 GetUser 方法
type UserService struct {
	// ...
}

func main() {
	// TODO: 模拟 Spring 的运行时依赖注入，在 Go 中进行手动 Wire：
	// 1. 实例化 MockDB
	// 2. 实例化 UserService 并注入 MockDB
	// 3. 调用 UserService 触发查询并打印结果
}`}
          solution={`package main

import "fmt"

type DB interface {
	Query(sql string) string
}

type MockDB struct{}

func (d MockDB) Query(sql string) string {
	return "Mock User Data for: " + sql
}

type UserService struct {
	db DB
}

func NewUserService(database DB) *UserService {
	return &UserService{db: database}
}

func (s *UserService) GetUser(id int) string {
	sql := fmt.Sprintf("SELECT * FROM users WHERE id = %d", id)
	return s.db.Query(sql)
}

func main() {
	// 手动依赖注入
	mockDB := MockDB{}
	userService := NewUserService(mockDB)
	
	result := userService.GetUser(42)
	fmt.Println(result)
}`}
          expectedOutput={`Mock User Data for: SELECT * FROM users WHERE id = 42`}
          hints={[
            '首先定义 DB 接口，任何实现了 Query 方法的类型都自动是 DB',
            'UserService 的构造方法 NewUserService 应该接收一个 DB 接口类型的参数，而不是具体类，以实现多态',
          ]}
        />
      </section>

      {/* Chapter Quiz */}
      <ChapterQuiz
        id="oop"
        title="结构篇测验"
        questions={[
          {
            question: 'Go 中控制结构体字段和方法的包外可见性的方式是什么？',
            options: [
              '显式标记 public / private 关键字',
              '首字母的大小写判定',
              '在 go.mod 中声明导出权限',
              'Go 中的字段对所有包默认全部公开'
            ],
            correctIndex: 1,
            explanation: 'Go 语言没有可见性修饰符。它使用极其简单且极具表现力的命名规则：首字母大写即为包外可见 (Exported)，首字母小写即为包内私有。',
          },
          {
            question: 'Go 编译器对于循环依赖（A 包引用 B 包，B 包引用 A 包）会采取何种处理？',
            options: [
              '运行时报错崩溃',
              '编译直接报错 import cycle not allowed，拒绝生成程序',
              '像 Java Spring 一样，利用底层缓存默默处理',
              '自动合并两个包'
            ],
            correctIndex: 1,
            explanation: 'Go 的编译机制极其严谨，直接在编译期拒绝任何形式的循环依赖，强迫开发者设计合理的单向依赖架构。',
          },
          {
            question: 'Go 中的接口变量（iface）如果赋值了一个值为 nil 的具体指针类型，该接口变量与 nil 比较结果如何？',
            options: [
              '接口变量等于 nil',
              '接口变量不等于 nil',
              '编译不通过',
              '运行时 panic'
            ],
            correctIndex: 1,
            explanation: 'iface 底层同时包含 itab（类型信息）和 data（具体值）。虽然 data 为 nil 指针，但 itab（类型）非空，因此接口变量本身不等于 nil。',
          },
        ]}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-card-border">
        <Link href="/chapters/basics" className="text-sm text-muted-fg hover:text-accent transition-colors flex items-center gap-1">
          ← 基础篇
        </Link>
        <Link href="/chapters/errors" className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2">
          下一章：异常篇 →
        </Link>
      </div>
    </article>
  )
}
