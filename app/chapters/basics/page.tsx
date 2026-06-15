import { CodeDuel } from '@/components/code-duel'
import { GoPlayground } from '@/components/go-playground'
import { GotchaCallout } from '@/components/gotcha-callout'
import { ChapterQuiz } from '@/components/chapter-quiz'
import { BeginnerGuide } from '@/components/beginner-guide'
import Link from 'next/link'
import { ChapterIcon } from '@/components/chapter-icon'

export default function BasicsPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <BeginnerGuide
        stepNumber={1}
        chapterTitle="基础篇 — Types & Variables"
        javaPrereqs={['int / Integer 区别', '对象引用传递', 'String', 'ArrayList / HashMap']}
        goKeywords={['零値 zero value', '指针 * 和 &', 'string + rune', 'slice / map', '逃逸分析']}
        mindShift="Go 没有包装类（Integer、Boolean…）。所有类型声明后自动赋「零値」（int=0、string=&quot;&quot;、bool=false），永远不会出现未初始化状态。要表达 ‘缺失値’请用指针 *int。"
      />
      {/* Chapter header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-accent font-mono mb-2 block">Chapter 1</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-2.5">
          <span className="text-blue-500"><ChapterIcon id="basics" className="w-8 h-8" /></span>
          <span>基础篇 — Types & Variables</span>
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          从 Java 的类型系统出发，理解 Go 的基本类型、零值（zero value）、值拷贝语义、指针操作、字符串 UTF-8 编码以及切片（Slice）和映射（Map）的底层机制。这些是您理解 Go 高效运行的基石。
        </p>
      </div>

      {/* Go Basics Syntax Cheat Sheet */}
      <div className="p-6 rounded-md bg-card border border-card-border mb-12 shadow-[var(--shadow-sm)]">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-foreground">
          <span>🚦 Go 基础语法快速对照 (Basics Cheat Sheet)</span>
        </h3>
        <p className="text-sm text-muted-fg mb-5 leading-relaxed">
          哪怕是资深 Java 开发者，在开始学习 Go 的底层机理前，也需要对 Go 的基础语法有一个直观的体感。Go 秉持“少即是多”的极简主义，用最纯粹的结构实现了核心控制流：
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-muted-fg font-sans border-collapse">
            <thead>
              <tr className="border-b border-card-border">
                <th className="text-left py-2 pb-3 font-bold text-foreground w-1/5">语法维度</th>
                <th className="text-left py-2 pb-3 font-bold text-foreground w-2/5">Java ☕</th>
                <th className="text-left py-2 pb-3 font-bold text-foreground w-2/5">Go 🐹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/50">
              <tr>
                <td className="py-3 font-semibold text-foreground">变量与常量声明</td>
                <td className="py-3 font-mono leading-relaxed">
                  int age = 18;<br/>
                  final String name = &quot;Go&quot;;
                </td>
                <td className="py-3 font-mono leading-relaxed">
                  var age int = 18 <span className="text-zinc-500">(显式)</span><br/>
                  name := &quot;Go&quot; <span className="text-zinc-500">(推推导，仅限函数内)</span><br/>
                  const pi = 3.14 <span className="text-zinc-500">(常量)</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-foreground">条件分支 (if)</td>
                <td className="py-3 font-mono leading-relaxed">
                  if (age &gt;= 18) {"{"}<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;System.out.println(&quot;adult&quot;);<br/>
                  {"}"}
                </td>
                <td className="py-3 font-mono leading-relaxed">
                  if age &gt;= 18 {"{"} <span className="text-zinc-500">{'// 括号省略，'}{"{"}{' 必须同行'}</span><br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;println(&quot;adult&quot;)<br/>
                  {"}"}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-foreground">循环控制 (for)</td>
                <td className="py-3 font-mono leading-relaxed">
                  for (int i=0; i&lt;10; i++) {"{"} ... {"}"}<br/>
                  while (cond) {"{"} ... {"}"}<br/>
                  for (String s : list) {"{"} ... {"}"}
                </td>
                <td className="py-3 font-mono leading-relaxed">
                  for i := 0; i &lt; 10; i++ {"{"} ... {"}"}<br/>
                  for cond {"{"} ... {"}"} <span className="text-zinc-500">{'// Go 唯一循环，等同 while'}</span><br/>
                  for index, item := range slice {"{"} ... {"}"}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-foreground">函数与多返回值</td>
                <td className="py-3 font-mono leading-relaxed">
                  public int add(int a, int b) {"{"}<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;return a + b;<br/>
                  {"}"}
                </td>
                <td className="py-3 font-mono leading-relaxed">
                  func add(a, b int) int {"{"} <span className="text-zinc-500">{'// 类型后置'}</span><br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;return a + b<br/>
                  {"}"}<br/>
                  func div(a, b int) (int, error) <span className="text-zinc-500">{'// 支持多返回值'}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-accent mt-4 bg-accent-light/50 border border-accent/20 p-3 rounded-lg flex items-center gap-1.5 leading-relaxed">
          <span>💡 <strong>Java 程序员过渡核心提示</strong>：在 Go 中，语句末尾不需要写分号 <code>;</code>。Go 的编译器会在编译时根据换行符自动补全分号，这也是为什么 Go 的左大括号 <code>{"{"}</code> 必须跟控制条件写在同一行，换行会导致直接编译报错。</span>
        </p>
      </div>

      {/* Section 1: Types & Escape Analysis */}
      <section id="types" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">1.1</span>
          基本类型、零值与逃逸分析 (Escape Analysis)
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 严格区分基本数据类型（如 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">int</code>）和对应的包装类（如 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">Integer</code>）。基本类型在栈上分配，包装类在堆上分配。在 Go 中，<strong>没有包装类</strong>的概念，类型设计极其扁平。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          更关键的是，Go 引入了<strong>零值 (Zero Value)</strong> 机制：声明即初始化，默认赋初值，永远不存在未分配内存的 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">null</code> 引发空指针异常（针对基本类型）。
        </p>

        <div className="my-6 p-5 rounded-md bg-card border border-card-border">
          <h4 className="text-sm font-bold mb-2 text-foreground">💡 灵魂拷问：Go 是如何决定变量在栈上还是堆上分配的？</h4>
          <p className="text-sm text-muted-fg leading-relaxed">
            在 Java 中，非原始类型（Object）总是分配在堆上，容易产生 GC 压力。而 Go 编译器使用<strong>逃逸分析 (Escape Analysis)</strong>：在编译期分析变量的生命周期。
            如果一个函数内部声明的变量没有被函数外部引用，它会直接分配在**栈 (Stack)** 上，随着函数退出而自动销毁。只有当变量被外部引用（例如返回了局部变量的指针）时，它才会“逃逸”到**堆 (Heap)** 上。这使得 Go 的内存分配速度极快。
          </p>
        </div>

        <CodeDuel
          title="类型声明与逃逸分析对比"
          javaCode={`// Java: 区分原始类型与堆对象
int a = 0;                     // 栈上分配：基本数据类型，存储在栈帧中
Integer b = null;              // 堆对象，可为 null，有自动装箱/拆箱的性能开销
String s = "Hello";            // 堆上常量池引用：字符串为堆对象，s存储其引用指针

// 函数返回局部对象
public User createUser() {
    User u = new User("Alice"); // 在堆上分配新对象内存
    return u;                  // 传递引用，由 JVM GC 负责后续的垃圾回收
}`}
          goCode={`// Go: 统一类型，没有包装类，由编译器逃逸分析决定物理分配位置
var a int                      // 默认零值: 0。生命周期未逃逸，直接在栈（Stack）上分配，效率极高
var s string                   // 默认零值: ""。结构体本身在栈上分配，无包装类开销
// 注意：在 Go 中，没有可以为 nil 的基础整型（例如 int），只能用指针 *int 表达空值

// 函数返回局部变量指针
func createUser() *User {
    u := User{Name: "Alice"}   // 实例化局部变量
    return &u                  // 核心特性：返回局部变量的指针。编译器检测到 u 逃逸到外部，自动在堆（Heap）上分配其内存，确保安全
}`}
          highlights={[
            { java: 'Integer', go: 'var a int' },
            { java: 'null', go: '零值' },
            { java: 'new User', go: '&u' },
          ]}
        />

        <GotchaCallout
          level="warning"
          title="零值不等于 null"
          javaWay={`Integer score = null;
if (score == null) {
    // 逻辑：尚未输入分数
}`}
          goWay={`var score int // score == 0，无法判断是“没输入”还是“输了 0 分”
// 正确写法：使用指针表示空值，或者使用 ok 标志
var score *int = nil // 此时指针可以为 nil`}
        >
          Java 程序员习惯用 <code>null</code> 代表缺失或未初始化的状态。而在 Go 中，数字零值是 <code>0</code>，字符串零值是 <code>&quot;&quot;</code>，布尔值是 <code>false</code>。如果您需要表达“缺失值”，请使用**指针类型**（如 <code>*int</code>，此时其零值为 <code>nil</code>）或配合 <code>bool</code> 标记字段。
        </GotchaCallout>

        <GoPlayground
          id="basics-types"
          title="练习：观察逃逸分析与零值"
          difficulty="easy"
          description="尝试声明不同类型的零值变量并用 %v 打印。同时，在本地可用 `go build -gcflags=-m` 查看编译器的逃逸分析输出。"
          starterCode={`package main

import "fmt"

func main() {
	// TODO: 声明以下类型，不赋初值，并用 fmt.Printf 打印其值
	// 1. 整型 i
	// 2. 浮点型 f
	// 3. 布尔型 b
	// 4. 字符串 s
	// 5. 切片 sl
	// 6. 映射 m

	fmt.Println("请在此处打印零值...")
}`}
          solution={`package main

import "fmt"

func main() {
	var i int
	var f float64
	var b bool
	var s string
	var sl []int
	var m map[string]int

	fmt.Printf("int: %v\n", i)
	fmt.Printf("float64: %v\n", f)
	fmt.Printf("bool: %v\n", b)
	fmt.Printf("string: %q\n", s)
	fmt.Printf("slice: %v (is nil: %v)\n", sl, sl == nil)
	fmt.Printf("map: %v (is nil: %v)\n", m, m == nil)
}`}
          expectedOutput={`int: 0
float64: 0
bool: false
string: ""
slice: [] (is nil: true)
map: map[] (is nil: true)`}
          hints={[
            '使用 var name type 的语法声明变量，Go 自动将其初始化为零值',
            '字符串在 Printf 中使用 %q 格式化，可以清晰看到空引号 ""',
            '切片 (slice) 和映射 (map) 的零值是 nil，但直接打印时会显示为 [] 或 map[]',
          ]}
        />
      </section>

      {/* Section 2: Pointers & Copies */}
      <section id="pointers" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">1.2</span>
          引用传递 vs 指针与值拷贝
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 程序员常说“Java 只有值传递，但传递的是对象引用”。当您把一个对象传递给方法时，方法内部对该对象属性的修改会影响原对象，因为它们指向同一个堆地址。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          <strong>在 Go 中，一切都是值拷贝 (Pass by Value)</strong>。当您把一个结构体传给函数时，Go 会在栈上复制一份完整的结构体副本！如果结构体很大，这会带来严重的性能开销。因此，Go 提供了<strong>显式指针</strong>（<code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">&</code> 取地址，<code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">*</code> 解引用）来实现跨函数内存共享，并且不支持任何指针运算，避免了 C/C++ 的内存安全地雷。
        </p>

        <CodeDuel
          title="值拷贝 vs 指针传递"
          javaCode={`// Java: 对象作为方法参数时，默认传递引用的拷贝，方法内修改影响原对象
class User { String name; }

void rename(User u) {
    u.name = "Bob";            // 修改了原对象在堆上的属性
}

User user = new User();
user.name = "Alice";
rename(user);                  // 传入 user 引用的拷贝，指向同一堆对象
// 结果：user.name 变为了 "Bob"`}
          goCode={`// Go: 结构体作为方法参数时，默认是值拷贝（深拷贝数据），指针用于显式共享内存
type User struct { Name string }

// 传入结构体值（会发生完整内容复制，相当于新副本）
func renameValue(u User) {
    u.Name = "Bob"             // 仅修改副本中的字段，不影响函数外的原结构体
}

// 传入结构体指针（仅复制 8 字节的物理内存地址）
func renamePointer(u *User) {
    u.Name = "Bob"             // 修改了原变量 (*u).Name 的值（Go 自动解引用，等同于 (*u).Name = "Bob"）
}

user := User{Name: "Alice"}
renameValue(user)              // 传入副本：user.Name 依旧是 "Alice"
renamePointer(&user)           // 传入地址：&user 取得地址，user.Name 成功变为了 "Bob"`}
          highlights={[
            { java: 'rename(user)', go: 'renamePointer(&user)' },
            { java: 'User u', go: 'u *User' },
          ]}
        />

        <GotchaCallout
          level="danger"
          title="指针不是引用的代名词"
          javaWay={`User u = null; // 安全的空值标记
u.name = "Bob"; // 运行时抛出 NullPointerException`}
          goWay={`var u *User = nil // 指针零值为 nil
u.Name = "Bob" // 运行时 panic: runtime error: invalid memory address`}
        >
          在 Go 中解引用一个 <code>nil</code> 指针会直接触发系统级 <strong>panic (崩溃)</strong>。在访问指针指向的结构体字段前，必须养成前置检查 <code>if u != nil</code> 的好习惯。
        </GotchaCallout>

        <GoPlayground
          id="basics-pointers"
          title="练习：通过指针改变状态"
          difficulty="easy"
          description="实现一个 SetAge 函数，利用指针修改 User 结构体中的 Age 字段。同时实现一个错误的修改函数，观察值拷贝现象。"
          starterCode={`package main

import "fmt"

type User struct {
	Name string
	Age  int
}

// TODO: 实现此函数，用指针接收修改
func SetAge(u *User, newAge int) {
	// 你的代码
}

func main() {
	u := User{Name: "Charlie", Age: 18}
	fmt.Printf("Before: %v\n", u)
	
	// TODO: 调用 SetAge 将年龄改为 25
	
	fmt.Printf("After: %v\n", u)
}`}
          solution={`package main

import "fmt"

type User struct {
	Name string
	Age  int
}

func SetAge(u *User, newAge int) {
	if u != nil {
		u.Age = newAge
	}
}

func main() {
	u := User{Name: "Charlie", Age: 18}
	fmt.Printf("Before: %v\n", u)
	
	SetAge(&u, 25)
	
	fmt.Printf("After: %v\n", u)
}`}
          expectedOutput={`Before: {Charlie 18}
After: {Charlie 25}`}
          hints={[
            '函数定义中，接收指针的参数类型为 *User',
            '调用该函数时，需使用 &u 传入结构体的地址',
            '在 Go 中，指针访问结构体字段不需要写 (*u).Age，直接写 u.Age 即可，Go 会自动解引用',
          ]}
        />
      </section>

      {/* Section 3: Strings */}
      <section id="strings" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">1.3</span>
          字符串与 Unicode/UTF-8 字符遍历
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 的 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">String</code> 内部基于 UTF-16 编码存储，每个 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">char</code> 占 2 字节（不考虑 Surrogate Pair）。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 的 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">string</code> 设计则非常激进：<strong>它是一个只读的字节切片（[]byte），默认采用 UTF-8 编码</strong>。这意味着，英文字符占 1 字节，而常用中文字符占 3 字节。因此，遍历 Go 字符串时如果按索引读取字节，会导致多字节的中文字符被“截断”成乱码。
        </p>

        <CodeDuel
          title="字符串字符统计与遍历"
          javaCode={`// Java: 内部以 UTF-16 编码存储
String s = "Go语言";
int len = s.length();             // 返回 4 (代表字符个数：'G', 'o', '语', '言')
char c = s.charAt(2);             // 获取第三个字符 '语'

// 正常遍历字符
for (int i = 0; i < s.length(); i++) {
    System.out.println(s.charAt(i)); // 逐个打印字符
}`}
          goCode={`// Go: 内部以 UTF-8 字节编码存储，本身是一个只读的 []byte 字节切片
s := "Go语言"
byteLen := len(s)                 // 返回 8 (字节长度！G=1, o=1, 中文字符'语'占3字节, '言'占3字节)
runeLen := utf8.RuneCountInString(s) // 返回 4 (获取实际 Unicode 码点数)

// ❌ 错误遍历方式：直接按字节索引遍历
for i := 0; i < len(s); i++ {
    fmt.Printf("%c ", s[i])       // 打印字节，中文字符的多字节会被拆散，从而打印出乱码
}

// ✅ 正确遍历方式：使用 range 关键字迭代
for idx, r := range s {
    fmt.Printf("%d:%c ", idx, r)  // 自动将 UTF-8 字节流解码为单个 rune 码点（int32）
    // 输出的索引是字节偏移，会发生跳跃: 0:G, 1:o, 2:语, 5:言 (语占3字节，下一个字符索引为2+3=5)
}`}
          highlights={[
            { java: 's.length()', go: 'utf8.RuneCountInString(s)' },
            { java: 's.charAt(i)', go: 'range s' },
          ]}
        />

        <GotchaCallout
          level="danger"
          title="range 遍历的索引跳跃陷阱"
          javaWay={`// 索引总是递增 1
for (int i = 0; i < s.length(); i++) {
    // i = 0, 1, 2, 3
}`}
          goWay={`// Go 的 range 索引代表字节偏移量而非字符序号
for idx, r := range "Go语言" {
    // idx 依次是 0, 1, 2, 5 (因为“语”占了 3 个字节)
}`}
        >
          由于 Go 字符串底层是 UTF-8 字节流，<code>range</code> 迭代时产生的索引是每个字符首字节的物理地址偏移量。如果您在循环体内依赖 <code>idx++</code> 或以为索引是连续的整数，会引发越界或数据错乱。
        </GotchaCallout>

        <GoPlayground
          id="basics-strings"
          title="练习：截取中文字符串"
          difficulty="medium"
          description="编写一个 CutString(s string, limit int) string 函数。在不破坏 UTF-8 编码的前提下，截取前 limit 个字符（非字节）。"
          starterCode={`package main

import "fmt"

// TODO: 实现 CutString，安全截取指定字符数量的子串
func CutString(s string, limit int) string {
	// 提示：先将 string 转换为 []rune 切片
	return ""
}

func main() {
	text := "Go语言交互式学习"
	// 期望截取前 4 个字符，输出: "Go语言"
	fmt.Println(CutString(text, 4))
}`}
          solution={`package main

import "fmt"

func CutString(s string, limit int) string {
	runes := []rune(s)
	if limit >= len(runes) {
		return s
	}
	return string(runes[:limit])
}

func main() {
	text := "Go语言交互式学习"
	fmt.Println(CutString(text, 4))
}`}
          expectedOutput={`Go语言`}
          hints={[
            'Go 中的 rune 类型等价于 int32，代表一个 Unicode 码点',
            '使用 []rune(s) 可以将字节数组重新组合为字符数组',
            '截取 []rune 后，再使用 string(runes) 强制转换回 UTF-8 字符串',
          ]}
        />
      </section>

      {/* Section 4: Collections & Memory */}
      <section id="collections" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">1.4</span>
          切片底层结构 (Slice Header) 与 Map 并发安全
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 提供了极其庞大的集合框架（List, Set, Map）。Go 的内置集合极其精简，最常用的两个是 <strong>Slice（切片）</strong> 和 <strong>Map（映射）</strong>。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="p-5 rounded-md bg-card border border-card-border">
            <h3 className="font-bold text-base mb-2 text-accent">🔍 切片底层：Slice Header 内存模型</h3>
            <p className="text-sm text-muted-fg leading-relaxed mb-4">
              切片本身不是一个数组，它只是一个**轻量级结构体**，仅占用 24 字节内存，在 Go 源码中定义为：
            </p>
            <pre className="text-xs font-mono bg-code-bg p-3 rounded-lg text-zinc-300">
{`type SliceHeader struct {
    Data uintptr // 指向底层数组首地址的指针
    Len  int     // 当前切片的长度
    Cap  int     // 底层数组的物理容量
}`}
            </pre>
            <p className="text-sm text-muted-fg leading-relaxed mt-3">
              当您进行切片操作（如 <code className="font-mono text-xs">s2 := s1[1:3]</code>）时，并未拷贝底层数据！它们共享同一个数组。修改 <code className="font-mono text-xs">s2</code> 会直接影响 <code className="font-mono text-xs">s1</code>，除非 <code className="font-mono text-xs">append</code> 触发扩容导致底层数组重分配。
            </p>
          </div>

          <div className="p-5 rounded-md bg-card border border-card-border">
            <h3 className="font-bold text-base mb-2 text-red-400">⚠️ Go Map 的阿喀琉斯之踵：并发 Panic</h3>
            <p className="text-sm text-muted-fg leading-relaxed mb-3">
              Java 的 <code className="font-mono text-xs">HashMap</code> 在多线程并发写时可能导致死循环或数据丢失，但不会直接崩溃。
            </p>
            <p className="text-sm text-muted-fg leading-relaxed mb-3">
              <strong>Go 的 map 在设计上彻底拒绝并发写入</strong>。如果检测到有两个协程同时读写 map，运行时会直接抛出不可恢复的致命错误：
              <code className="text-red-400 font-mono text-xs">fatal error: concurrent map writes</code> 导致程序强行退出！
            </p>
            <p className="text-sm text-muted-fg leading-relaxed">
              要保证并发安全，必须显式加锁（如 <code className="font-mono text-xs">sync.Mutex</code>）或者使用内置的 <code className="font-mono text-xs">sync.Map</code>。
            </p>
          </div>
        </div>

        <CodeDuel
          title="集合核心操作对比"
          javaCode={`// Java: ArrayList 与 HashMap，均在堆上分配，多线程写 HashMap 会导致并发修改异常或死循环
List<String> list = new ArrayList<>();
list.add("Alice");             // 动态追加元素
list.remove(0);                // 移除指定位置的元素
int size = list.size();        // 获取大小

Map<String, Integer> map = new HashMap<>();
map.put("Java", 20);           // 存入键值
int val = map.getOrDefault("Go", 0); // 避免空指针获取默认值

// 线程安全容器
Map<String, Integer> concurrentMap = new ConcurrentHashMap<>();`}
          goCode={`// Go: 切片 (Slice) 与 映射 (Map)
var list []string              // 声明 nil 切片，不需要初始化即可直接进行 append 操作
list = append(list, "Alice")   // 追加元素。如超出底层容量，Go 自动重新分配底层数组并复制
list = list[1:]                // 物理截取（仅修改 Slice Header 属性，不拷贝底层数组，性能极高）
size := len(list)              // 获取当前切片长度

m := make(map[string]int)      // Map 必须使用 make 初始化后才能写入，否则向 nil map 写入会 panic
m["Java"] = 20                 // 存入键值
val, ok := m["Go"]             // comma ok 校验模式！如果 ok 为 false，代表 key 不存在，val 自动为零值 0

// ⚠️ 并发安全的 map
var mu sync.RWMutex
mu.Lock()
m["Java"] = 30
mu.Unlock()`}
          highlights={[
            { java: 'ArrayList', go: 'Slice Header' },
            { java: 'getOrDefault', go: 'val, ok := m["Go"]' },
            { java: 'ConcurrentHashMap', go: 'sync.RWMutex' },
          ]}
        />

        <CodeDuel
          title="集合深拷贝与切片/映射扩容"
          javaCode={`// Java: 容器复制与初始化
List<String> src = Arrays.asList("A", "B");
List<String> dest = new ArrayList<>(src); // 复制列表
dest.set(0, "C"); // 修改副本不影响原列表

// 预分配容量，避免底层数组频繁扩容
List<String> list = new ArrayList<>(1000);`}
          goCode={`// Go: 切片/映射的拷贝与 make 预分配
src := []string{"A", "B"}

// ❌ 浅拷贝陷阱：只复制了 Slice Header，底层数组依然共享！
shallowDest := src
shallowDest[0] = "C" // 修改副本导致 src[0] 也被修改为 "C"

// ✅ 深拷贝切片：必须先 make 分配内存空间，再使用 copy()
deepDest := make([]string, len(src)) // 预分配等长空间
copy(deepDest, src)                 // 拷贝底层数据
deepDest[0] = "D"                   // 修改副本，原切片不受影响

// ✅ 深拷贝 Map：必须 make 新的 map，再手动 for range 循环赋值
srcMap := map[string]int{"A": 1}
deepMap := make(map[string]int, len(srcMap)) // 预分配容量
for k, v := range srcMap {
    deepMap[k] = v
}

// 💡 预分配切片容量，避开自动扩容性能损耗
largeSlice := make([]int, 0, 1000) // 长度为0，容量为1000`}
          highlights={[
            { java: 'new ArrayList<>(src)', go: 'copy(deepDest, src)' },
            { java: 'new ArrayList<>(1000)', go: 'make([]int, 0, 1000)' },
          ]}
        />

        <GotchaCallout
          level="danger"
          title="切片共享底层数组内存泄漏风险"
          javaWay={`// Java SubList 会持有原列表引用，但 GC 表现较温和`}
          goWay={`var bigArray = make([]byte, 10*1024*1024) // 10MB
var smallSlice = bigArray[0:2] // 只要 smallSlice 存活，整个 10MB 的底层数组就永远无法被 GC 回收`}
        >
          当从小切片指向巨大底层数组时，整块内存都会被锁定。如果只需要小部分数据，建议使用 <code>copy()</code> 函数将其拷贝到新切片中，彻底断开与大数组的联系，让 GC 释放空间。
        </GotchaCallout>

        <GoPlayground
          id="basics-collections"
          title="练习：去重与交集统计"
          difficulty="hard"
          description="Go 没有内置 Set（集合）类型。利用 map[T]bool 模拟 Set，统计两个切片的公共元素（交集）并输出。"
          starterCode={`package main

import "fmt"

// TODO: 实现 Intersection 函数，求两个切片的公共元素
func Intersection(a, b []string) []string {
	// 1. 声明一个 map 充当 Set
	// 2. 遍历 a 将元素存入 map
	// 3. 遍历 b，如果元素在 map 中存在，加入结果切片
	return nil
}

func main() {
	slice1 := []string{"apple", "banana", "orange", "peach"}
	slice2 := []string{"banana", "pear", "peach", "grape"}
	
	// 预期输出: [banana peach] (顺序不限)
	fmt.Println(Intersection(slice1, slice2))
}`}
          solution={`package main

import "fmt"

func Intersection(a, b []string) []string {
	set := make(map[string]bool)
	for _, item := range a {
		set[item] = true
	}

	var result []string
	for _, item := range b {
		if set[item] {
			result = append(result, item)
		}
	}
	return result
}

func main() {
	slice1 := []string{"apple", "banana", "orange", "peach"}
	slice2 := []string{"banana", "pear", "peach", "grape"}
	fmt.Println(Intersection(slice1, slice2))
}`}
          expectedOutput={`[banana peach]`}
          hints={[
            '在 Go 中，map[type]bool 或 map[type]struct{} 是模拟 Set 的标准写法，后者更节省空间',
            '使用 val, exists := myMap[key] 检查 key 是否存在',
            '切片使用 append(slice, element) 动态添加元素',
          ]}
        />
      </section>

      {/* Chapter Quiz */}
      <ChapterQuiz
        id="basics"
        title="基础篇测验"
        questions={[
          {
            question: '在 Go 中，如果函数内部返回了一个局部变量的指针，会发生什么？',
            options: [
              '会产生野指针，属于未定义行为（编译错误）',
              '编译器检测到逃逸，将该变量分配在堆（Heap）上，可安全返回',
              '编译器将其强行留在栈上，调用函数退出后该指针失效',
              'Go 会隐式抛出运行时错误'
            ],
            correctIndex: 1,
            explanation: 'Go 拥有逃逸分析机制，当编译器发现局部变量的地址被返回，就会自动将其从栈上提升到堆上，垃圾回收器会在没有引用时清理它，这是 Go 的核心设计精髓。',
          },
          {
            question: 'Go 中，若 map 被多个协程同时进行无锁写入，会引发什么后果？',
            options: [
              '数据会产生覆盖，类似于 Java 的 HashMap，但程序不会崩溃',
              '写入会被串行化，只是性能有所下降',
              '运行时会直接 fatal error 崩溃，程序强制退出',
              '写操作会直接丢失'
            ],
            correctIndex: 2,
            explanation: '为了性能，Go 的内置 map 未做内部并发同步。并发读写直接触发 fatal error 并强行终止进程，因此必须使用互斥锁、读写锁或 sync.Map。',
          },
          {
            question: '对于以下切片操作：s2 := s1[1:3]，当修改 s2[0] 时，会发生什么？',
            options: [
              's1[0] 被修改了',
              's1[1] 被修改了',
              '没有任何副作用，s2 是完整拷贝',
              '程序抛出越界异常'
            ],
            correctIndex: 1,
            explanation: 's2 共享 s1 的底层数组。因为 s2 起始于 s1[1]，所以 s2[0] 指向的物理内存正是 s1[1]。因此修改 s2[0] 会直接影响 s1[1]。',
          },
        ]}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-card-border">
        <Link
          href="/"
          className="text-sm text-muted-fg hover:text-accent transition-colors flex items-center gap-1"
        >
          ← 返回首页
        </Link>
        <Link
          href="/chapters/oop"
          className="px-5 py-2.5 rounded-md bg-accent text-white text-sm font-medium
                     hover:bg-accent-hover transition-colors flex items-center gap-2"
        >
          下一章：结构篇
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </article>
  )
}
