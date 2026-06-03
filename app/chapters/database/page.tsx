'use client'

import { CodeDuel } from '@/components/code-duel'
import { GoPlayground } from '@/components/go-playground'
import { GotchaCallout } from '@/components/gotcha-callout'
import { MindShift } from '@/components/mind-shift'
import { ChapterQuiz } from '@/components/chapter-quiz'
import Link from 'next/link'

export default function DatabasePage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      {/* Chapter header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-accent font-mono mb-2 block">Chapter 6</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
          💾 数据篇 — 数据库与事务管理
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          告别声明式事务魔法。对比 Java MyBatis/JPA，理解 Go 的 ORM 底层原理、`database/sql` 连接池的零配置自动调度，以及如何通过显式事务链及 defer 实现绝对可靠的数据事务一致性。
        </p>
      </div>

      {/* Section 1: ORM */}
      <section id="orm" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white text-sm font-bold">6.1</span>
          ORM 框架对比：JPA / MyBatis vs GORM
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 程序员极度依赖 Hibernate/JPA 的对象持久化，或是 MyBatis 的 XML/注解 SQL 映射。JPA 包含大量的实体生命周期管理、懒加载（Lazy Loading）、N+1 查询缺陷，以及一级/二级缓存，这在运行时带来了一定的“不确定性”。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 的主流 ORM 框架（如 <strong>GORM</strong>）则非常直观：它没有任何运行时缓存拦截，也没有懒加载代理对象，只是将简单的结构体标签映射为 SQL 字段，并利用链式操作进行执行。
          在 Go 社区中，许多中大型企业甚至更倾向于使用轻量级的高性能 SQL 扫描器（如 **sqlx** 或直接手写 SQL 配合代码生成工具 sqlc），以换取极致的吞吐量和控制力。
        </p>

        <CodeDuel
          title="MyBatis-Plus/JPA 映射 vs Go GORM"
          javaCode={`// Java: JPA 实体注解
@Entity
@Table(name = "t_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_name", nullable = false)
    private String userName;
    
    // 一对多关系，带有懒加载魔法
    @OneToMany(fetch = FetchType.LAZY)
    private List<Order> orders;
}`}
          goCode={`// Go: GORM 结构体标签映射 (无运行时魔法)
package model

type User struct {
    ID       uint   \`gorm:"primaryKey;column:id"\`
    UserName string \`gorm:"column:user_name;not null"\`
    
    // 一对多关系，必须显式 Preload 才会加载！
    Orders   []Order \`gorm:"foreignKey:UserID"\`
}

// 关联查询示例：
// db.Preload("Orders").Find(&users) // 显式声明，绝无隐式查询`}
          highlights={[
            { java: 'FetchType.LAZY', go: 'Preload("Orders")' },
            { java: '@Column', go: 'gorm:"column:user_name"' },
          ]}
        />

        <GotchaCallout
          level="warning"
          title="无感懒加载导致的 N+1 数据库灾难"
          javaWay={`// Java: 隐式触发 SQL
for (User u : users) {
    System.out.println(u.getOrders().size()); // 遍历时触发 N 次 SQL 查询！`}
          goWay={`// Go: 拒绝代理对象，不 Preload 则 orders 字段为空
for _, u := range users {
    fmt.Println(len(u.Orders)) // 始终是 0！除非你之前写了 Preload
}`}
        >
          Go 的 GORM 绝不支持任何隐式的数据库查询拦截。如果一个字段没有被查询填装（Preload/Join），它只会是零值。这虽然需要显式声明，但彻底杜绝了线上因循环执行隐式 SQL 而拖挂数据库的风险。
        </GotchaCallout>
      </section>

      {/* Section 2: Connection Pool */}
      <section id="pool" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white text-sm font-bold">6.2</span>
          连接池自动管理：HikariCP 繁重配置 vs database/sql
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 应用为了榨干数据库吞吐，通常需要引入第三方高性能数据库连接池（如 HikariCP、Druid），并且需要精心调试几十个参数：<code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">minimumIdle</code>、<code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">maximumPoolSize</code>、<code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">idleTimeout</code> 等。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 的标准库 <strong>`database/sql` 内部本身就已经开箱即用地集成了并发安全的连接池</strong>。
          您不需要引入任何第三方连接池插件。调用 `sql.Open` 时并不会立刻连接数据库，它只是返回一个维护着连接池状态的 `*sql.DB` 句柄，随后的增删改查动作会完全自动地由池进行分配、重用和回收。
        </p>

        <CodeDuel
          title="Hikari 繁多配置 vs 仅用 3 行设置 Go 连接池"
          javaCode={`// Java: HikariCP 属性设置
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:mysql://localhost:3306/db");
config.setMaximumPoolSize(20);
config.setMinimumIdle(5);
config.setIdleTimeout(60000);
config.setConnectionTimeout(30000);
HikariDataSource ds = new HikariDataSource(config);`}
          goCode={`// Go: database/sql 标准内置控制
db, err := sql.Open("mysql", "user:pwd@tcp(127.0.0.1:3306)/db")

// 仅用 3 个经典 API 完美覆盖连接池策略：
db.SetMaxOpenConns(20)          // 设置最大活动连接数
db.SetMaxIdleConns(5)           // 设置最大空闲连接数
db.SetConnMaxLifetime(time.Hour) // 设置连接的最大存活时间（重连防老连接断开）`}
          highlights={[
            { java: 'HikariDataSource', go: 'sql.Open (内置连接池)' },
            { java: 'setMaximumPoolSize', go: 'SetMaxOpenConns' },
          ]}
        />
      </section>

      {/* Section 3: Transaction */}
      <section id="transaction" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white text-sm font-bold">6.3</span>
          事务处理：声明式事务的消亡与显式 defer 保护
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java Spring 最引以为傲的声明式事务注解 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">@Transactional</code>，通过 AOP 动态代理织入事务切面。这极其方便，却是一个**巨大的隐式地雷区**：如果在同类中自调用、或是方法是 private、或者是多线程并发，都会导致事务切面静默失效，引起数据错乱。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 不存在动态织入。为了代码的可维护性和直观性，<strong>Go 强制采用显式事务控制</strong>。
          通过 `db.Begin()` 开启事务并返回 `tx` 对象，紧接着利用 **`defer tx.Rollback()`** 挂载一个全局的回滚保护。如果在随后的逻辑中顺利完成操作并显式调用了 `tx.Commit()`，则回滚操作会在退出函数时自动失效；若中途有任何报错提前返回，事务会由 `defer` 捕获并强制自动回滚。
        </p>

        <CodeDuel
          title="@Transactional 失效雷区 vs 显式 3 行回滚保障"
          javaCode={`// Java: 极其容易失效的 AOP 声明式事务
@Service
public class TradeService {

    // ❌ 陷阱：同类内部自调用，事务切面直接失效
    public void startTrade() {
        doTransfer(); 
    }

    @Transactional
    public void doTransfer() {
        accountDao.deduct(100);
        accountDao.add(100);
    }
}`}
          goCode={`// Go: 显式事务，绝无失效代理
func (s *TradeService) DoTransfer(ctx context.Context, from, to string, amt float64) error {
    tx := s.db.Begin() // 1. 显式开启事务
    defer tx.Rollback() // 2. 挂载默认回滚保护（若中途出错提前 return 会自动触发）

    if err := tx.Deduct(from, amt); err != nil {
        return err // 发生错误，函数退出，触发 defer 回滚
    }

    if err := tx.Add(to, amt); err != nil {
        return err
    }

    return tx.Commit() // 3. 全部成功后显式提交，此时 Rollback 变为 no-op 
}`}
          highlights={[
            { java: '@Transactional', go: 'tx := db.Begin()' },
            { java: '代理失效陷阱', go: 'defer tx.Rollback()' },
          ]}
        />

        <GoPlayground
          id="db-transaction"
          title="练习：实现带事务的转账逻辑"
          difficulty="hard"
          description="补全 GORM 数据库的事务转账逻辑。在模拟的数据库中，当查询付款人余额不足时，返回自定义 error 并利用 defer 自动回滚。"
          starterCode={`package main

import (
	"errors"
	"fmt"
)

type MockAccount struct {
	ID      int
	Balance float64
}

// 模拟数据库事务
type MockTx struct {
	committed bool
	rolledBack bool
	accounts  map[int]*MockAccount
}

func (tx *MockTx) Commit() error {
	tx.committed = true
	return nil
}

func (tx *MockTx) Rollback() {
	if !tx.committed {
		tx.rolledBack = true
	}
}

// TODO: 实现 Transfer 事务操作
func Transfer(tx *MockTx, fromID, toID int, amount float64) error {
	// 1. 显式挂载默认的 Rollback()
	// 提示：defer tx.Rollback()
	
	// 2. 校验余额是否足够
	fromAcc := tx.accounts[fromID]
	if fromAcc.Balance < amount {
		return errors.New("balance not enough") // 提前退出，触发 defer 自动回滚
	}

	// 3. TODO: 扣减 fromID 的余额，增加 toID 的余额
	
	// 4. TODO: 显式调用 tx.Commit() 提交事务并返回
	return nil
}

func main() {
	// 初始化账户: 1号账户 100元，2号账户 50元
	db := map[int]*MockAccount{
		1: {ID: 1, Balance: 100},
		2: {ID: 2, Balance: 50},
	}
	
	tx1 := &MockTx{accounts: db}
	err1 := Transfer(tx1, 1, 2, 200) // 尝试转账 200 (余额不足)
	fmt.Printf("转账200结果: 错误=%v, 回滚=%v, 提交=%v\\n", err1, tx1.rolledBack, tx1.committed)
	
	tx2 := &MockTx{accounts: db}
	err2 := Transfer(tx2, 1, 2, 30)  // 正常转账 30
	fmt.Printf("转账30结果: 错误=%v, 回滚=%v, 提交=%v, 1号余额=%.1f, 2号余额=%.1f\\n", 
		err2, tx2.rolledBack, tx2.committed, db[1].Balance, db[2].Balance)
}`}
          solution={`package main

import (
	"errors"
	"fmt"
)

type MockAccount struct {
	ID      int
	Balance float64
}

type MockTx struct {
	committed bool
	rolledBack bool
	accounts  map[int]*MockAccount
}

func (tx *MockTx) Commit() error {
	tx.committed = true
	return nil
}

func (tx *MockTx) Rollback() {
	if !tx.committed {
		tx.rolledBack = true
	}
}

func Transfer(tx *MockTx, fromID, toID int, amount float64) error {
	defer tx.Rollback()
	
	fromAcc := tx.accounts[fromID]
	toAcc := tx.accounts[toID]
	
	if fromAcc.Balance < amount {
		return errors.New("balance not enough")
	}

	fromAcc.Balance -= amount
	toAcc.Balance += amount
	
	return tx.Commit()
}

func main() {
	db := map[int]*MockAccount{
		1: {ID: 1, Balance: 100},
		2: {ID: 2, Balance: 50},
	}
	
	tx1 := &MockTx{accounts: db}
	err1 := Transfer(tx1, 1, 2, 200)
	fmt.Printf("转账200结果: 错误=%v, 回滚=%v, 提交=%v\n", err1, tx1.rolledBack, tx1.committed)
	
	tx2 := &MockTx{accounts: db}
	err2 := Transfer(tx2, 1, 2, 30)
	fmt.Printf("转账30结果: 错误=%v, 回滚=%v, 提交=%v, 1号余额=%.1f, 2号余额=%.1f\n", 
		err2, tx2.rolledBack, tx2.committed, db[1].Balance, db[2].Balance)
}`}
          expectedOutput={`转账200结果: 错误=balance not enough, 回滚=true, 提交=false
转账30结果: 错误=<nil>, 回滚=false, 提交=true, 1号余额=70.0, 2号余额=80.0`}
          hints={[
            '不要忘记在函数入口处写上 defer tx.Rollback()',
            '只有在操作全部结束后才调用 Commit()。如果已经调用了 Commit()，defer 执行 Rollback() 应该判断状态为 no-op，不产生任何副作用。'
          ]}
        />
      </section>

      {/* Chapter Quiz */}
      <ChapterQuiz
        id="database"
        title="数据篇测验"
        questions={[
          {
            question: '对于 GORM 等 Go ORM 框架，若不进行 Preload 关联查询，直接访问外键结构体切片属性（如 User.Orders）会发生什么？',
            options: [
              '框架会自动发送额外的 SQL 进行懒加载查询',
              '属性值为零值（空切片），没有任何隐式 SQL 执行',
              '运行报错抛出空指针异常',
              '自动报错编译拦截'
            ],
            correctIndex: 1,
            explanation: 'Go 社区完全摒弃了 JPA 复杂的 Lazy Loading 运行时代理机制。如果在查询阶段没有显式指定 Preload 或 Join，该关联字段将保留为其零值（如空切片），从而完全避免了由于循环懒加载带来的 N+1 查询隐式灾难。',
          },
          {
            question: '在 Go 中，我们为何不需要像 HikariCP 这样引入复杂的第三方连接池组件？',
            options: [
              '因为 Go 运行极快，每次增删改查都直接建立与关闭 TCP 连接，不需要连接池',
              '标准库 database/sql 内置就已经实现了并发安全的连接池，我们只需简单调整 MaxOpenConns 等参数',
              'Go 从根本上禁止使用连接池',
              'ORM 框架 GORM 会自动重写底层物理网络'
            ],
            correctIndex: 1,
            explanation: 'Go 在标准库 database/sql 层就已经集成了强大的内置连接池，因此 Go 开发者仅需调用标准 api 设置最大存活时间、活动和空闲连接数，即可得到工业级的高性能连接池保障。',
          },
          {
            question: '关于 Go 显式事务中 defer tx.Rollback() 的作用，下列哪项说法是错误的？',
            options: [
              '若函数在中途因发生 error 提前 return，事务会自动被 defer 回滚，保证一致性',
              '若函数正常执行并调用了 tx.Commit()，即使退出时依然调用了 defer tx.Rollback()，也是安全的，因为此时已提交，回滚动作在状态机上为 no-op 无效动作',
              '必须将 defer tx.Rollback() 声明放在 db.Begin() 之后',
              'defer tx.Rollback() 如果执行了，会强制导致当前物理线程崩溃'
            ],
            correctIndex: 3,
            explanation: 'defer tx.Rollback() 只是一个非常优雅的安全网。当事务已经 Commit，后续的 Rollback 会自动识别并成为无副作用的操作；而如果在 Commit 之前有任何 error 提前退出，defer 则能确保事务不发生残留泄漏。它绝不会导致物理线程挂掉。',
          },
        ]}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-card-border">
        <Link href="/chapters/web" className="text-sm text-muted-fg hover:text-accent transition-colors flex items-center gap-1">
          ← Web 篇
        </Link>
        <Link href="/chapters/middleware" className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2">
          下一章：服务篇 →
        </Link>
      </div>
    </article>
  )
}
