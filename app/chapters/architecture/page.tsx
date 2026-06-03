'use client'

import { CodeDuel } from '@/components/code-duel'
import { GoPlayground } from '@/components/go-playground'
import { GotchaCallout } from '@/components/gotcha-callout'
import { MindShift } from '@/components/mind-shift'
import { ChapterQuiz } from '@/components/chapter-quiz'
import Link from 'next/link'
import { ChapterIcon } from '@/components/chapter-icon'

export default function ArchitecturePage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      {/* Chapter header */}
      <div className="mb-10 border-b border-card-border pb-6">
        <span className="text-sm text-accent font-mono mb-2 block">Chapter 8</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-2.5">
          <span className="text-slate-500"><ChapterIcon id="architecture" className="w-8 h-8" /></span>
          <span>工程篇 — 工程架构、测试与发布</span>
        </h1>
        <p className="text-lg text-muted-fg leading-relaxed">
          打通企业落地的最后一公里。对比 Java Maven/Gradle 多模块骨架、JUnit 反射测试、以及胖 JRE 容器镜像，理解 Go 物理包边界控制、Go 独有的表驱动测试（Table-Driven Tests），以及多阶段极简 Docker 打包部署。
        </p>
      </div>

      {/* Section 1: Project layout */}
      <section id="layout" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-zinc-600 flex items-center justify-center text-white text-sm font-bold">8.1</span>
          项目目录结构：Maven 多模块 vs 标准 Go 项目骨架
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 的 Maven 项目习惯使用经典的多模块结构（如 `api`, `service`, `dao`），并且目录深达 `src/main/java/com/company/project/controller/...`。由于 Java 运行时可以通过代理延迟加载，各包之间容易编写出纵横交错的循环依赖。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 在编译期对依赖有严格的安全洁癖。Go 强制**禁止循环导入**（Circular Import）。
          为了防止架构腐化，Go 社区总结出了一套公认的**标准项目布局 (Standard Go Project Layout)**：
        </p>
        <div className="p-5 rounded-xl bg-card border border-card-border mb-6">
          <ul className="text-sm text-muted-fg space-y-2.5 font-mono">
            <li>📂 <strong>/cmd</strong>：项目的入口文件夹。每个子目录代表一个可执行程序（如 `cmd/api/main.go`、`cmd/cron/main.go`），此目录不应写任何业务逻辑。</li>
            <li>📂 <strong>/internal</strong>：私有业务逻辑。该目录下的代码仅能被当前模块内部包引入，拒绝外部包非法导入。它是 Go 限制代码耦合强有力的物理保护网。</li>
            <li>📂 <strong>/pkg</strong>：公共共享组件。可被外部项目安全引用（如工具类、客户端 client SDK 契约）。</li>
          </ul>
        </div>

        <CodeDuel
          title="Maven 工程结构 vs Go 标准骨架"
          javaCode={`# Maven 典型布局 (深度嵌套)
project-root/
  ├── pom.xml
  ├── project-api/
  │    └── src/main/java/com/comp/api/
  ├── project-service/
  │    └── src/main/java/com/comp/service/
  └── project-dao/`}
          goCode={`# Standard Go Project Layout
project-root/
  ├── go.mod
  ├── cmd/
  │    └── api/
  │         └── main.go       # 入口
  ├── internal/              # 核心业务 (包外无法 import!)
  │    ├── service/
  │    └── db/
  └── pkg/                   # 公共包
       └── util/`}
          highlights={[
            { java: 'pom.xml', go: 'go.mod' },
            { java: '项目结构依靠 Maven', go: '物理隔离的 internal/' },
          ]}
        />
      </section>

      {/* Section 2: Testing */}
      <section id="testing" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-zinc-600 flex items-center justify-center text-white text-sm font-bold">8.2</span>
          单元测试与 Mock 机制：JUnit/Mockito 代理 vs 表驱动测试 (Table-Driven)
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 依靠 JUnit 和 Mockito，通过在运行时劫持类加载器或使用动态代理（ByteBuddy）来强制 Mock 对象。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 不支持动态类替换，其内置的 `testing` 框架提供了一种极其优雅且独具 Go 特色的写法：<strong>表驱动测试（Table-Driven Tests）</strong>。
          通过在一个测试函数内部，声明一个匿名结构体切片（“数据表”，包含测试名称、输入参数、期望输出），再利用 <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">t.Run()</code> 循环运行这些测试用例。这种方式将测试逻辑与测试数据彻底分离，新增用例只需在切片中添加一行数据，极易扩展和维护。
        </p>

        <CodeDuel
          title="Mockito 动态拦截 vs 表驱动测试数据分离"
          javaCode={`// Java: Mockito 动态打桩
@Test
public void testAdd() {
    Calculator calc = Mockito.mock(Calculator.class);
    Mockito.when(calc.add(2, 3)).thenReturn(5);
    
    assertEquals(5, calc.add(2, 3));
}`}
          goCode={`// Go: 结构体测试表，逻辑高度复用
func TestAdd(t *testing.T) {
    // 声明测试数据表
    tests := []struct {
        name string
        a, b int
        want int
    }{
        {"positive", 2, 3, 5},
        {"negative", -1, -2, -3},
        {"zero", 0, 5, 5},
    }

    // 循环并并发运行子测试
    for _, tc := range tests {
        t.Run(tc.name, func(t *testing.T) {
            got := Add(tc.a, tc.b)
            if got != tc.want {
                t.Errorf("Add(%d, %d) = %d; want %d", tc.a, tc.b, got, tc.want)
            }
        })
    }
}`}
          highlights={[
            { java: 'Mockito.mock', go: '接口替换 Mock' },
            { java: '@Test', go: 'TestXxx(t *testing.T)' },
          ]}
        />

        <GoPlayground
          id="arch-table-test"
          title="练习：编写表驱动测试用例"
          difficulty="medium"
          description="补全测试代码，使用表驱动测试方法编写 TestIsAdult(t *testing.T) 测试逻辑，确保检验 3 组输入输出数据是否满足成年条件（age >= 18）。"
          starterCode={`package main

import (
	"fmt"
	"testing"
)

func IsAdult(age int) bool {
	return age >= 18
}

// 模拟单元测试运行
func RunSimulation() {
	// TODO: 声明测试表切片，包含 age int, want bool 字段
	tests := []struct {
		name string
		age  int
		want bool
	}{
		// 补全三组数据: 17岁(false)、18岁(true)、25岁(true)
	}

	for _, tc := range tests {
		got := IsAdult(tc.age)
		if got != tc.want {
			fmt.Printf("FAIL: %s | IsAdult(%d) = %v; want %v\n", tc.name, tc.age, got, tc.want)
			return
		}
	}
	fmt.Println("PASS: 表驱动单元测试全部通过")
}

func main() {
	RunSimulation()
}`}
          solution={`package main

import (
	"fmt"
)

func IsAdult(age int) bool {
	return age >= 18
}

func RunSimulation() {
	tests := []struct {
		name string
		age  int
		want bool
	}{
		{"minor", 17, false},
		{"exact adult", 18, true},
		{"older adult", 25, true},
	}

	for _, tc := range tests {
		got := IsAdult(tc.age)
		if got != tc.want {
			fmt.Printf("FAIL: %s | IsAdult(%d) = %v; want %v\n", tc.name, tc.age, got, tc.want)
			return
		}
	}
	fmt.Println("PASS: 表驱动单元测试全部通过")
}

func main() {
	RunSimulation()
}`}
          expectedOutput={`PASS: 表驱动单元测试全部通过`}
          hints={[
            '匿名结构体字段分别映射：用例名 name、输入 age 和预期输出 want',
            '用切片字面量初始化 tests'
          ]}
        />
      </section>

      {/* Section 3: Deploy */}
      <section id="deploy" className="scroll-mt-24 mb-16">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-zinc-600 flex items-center justify-center text-white text-sm font-bold">8.3</span>
          容器化部署：胖 JRE 基础镜像 vs 10MB 极简二进制镜像
        </h2>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Java 应用打包成 Fat JAR 后，为了运行，Docker 容器必须配置完整的 OpenJDK/JRE 运行环境。
          这使得生成的 Docker 镜像体积很难降到 150MB 以下。并且，由于 JVM 运行时吃内存较深，如果 Docker 资源限额（Memory Limit）设置不当且没有配置 JVM 堆内存参数，容易导致容器在启动或高吞吐时直接被宿主机内核 **OOM Killer 强杀**。
        </p>
        <p className="text-muted-fg mb-6 leading-relaxed">
          Go 在设计上是强编译型语言，不需要任何 JRE 虚拟机支持。
          我们可以利用 Docker 的<strong>多阶段构建（Multi-stage Build）</strong>机制：
          第一阶段利用包含了 Go SDK 的构建镜像编译出独立可执行二进制文件；第二阶段直接把这个物理二进制文件（仅有 10MB+）拷贝到一个**完全为空的基础镜像**（如 `scratch` 或 Google 的 `distroless`）中运行。
          最终镜像中不含任何系统 Shell 和多余工具，**安全级别极高，体积仅有 10-15MB，且内存开销从几百兆陡降到十几兆**，启动仅需 1 毫秒，这为云原生和 K8s 扩容提供了极致的速度和资源节约。
        </p>

        <CodeDuel
          title="Java 胖 JAR 镜像 vs Go 多阶段编译镜像"
          javaCode={`# Dockerfile for Java (胖镜像)
FROM openjdk:17-jdk-alpine

WORKDIR /app
COPY target/app.jar app.jar

# 必须细致微调 JVM 物理参数，否则极易触发容器 OOM 强杀
ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]`}
          goCode={`# Dockerfile for Go (多阶段精简镜像)
# ---- 阶段 1: 编译可执行二进制 ----
FROM golang:1.21-alpine AS builder
WORKDIR /build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/api/main.go

# ---- 阶段 2: 极简纯净二进制拷贝 ----
FROM scratch
WORKDIR /app
COPY --from=builder /build/main .

# 极快启动 (1ms)，没有 JRE 开销，镜像总体仅约 12MB！
ENTRYPOINT ["./main"]`}
          highlights={[
            { java: 'openjdk:17-jdk-alpine (150M+)', go: 'scratch (0M)' },
            { java: '-Xms256m -Xmx512m 调优', go: '无 VM 调优，内存占用几兆' },
          ]}
        />
      </section>

      {/* Chapter Quiz */}
      <ChapterQuiz
        id="architecture"
        title="工程篇测验"
        questions={[
          {
            question: '在 Go 的项目骨架中，为什么需要单独为 /internal 文件夹设计物理可见性约束？',
            options: [
              '在 /internal 目录下的代码不需要进行单元测试',
              '因为这是 Go 语言内建的物理限制：该目录下的包不能被其他外部项目或本模块外的包导入，强有力地提供了架构防腐隔离',
              'internal 文件夹代表只对前端工程师可见',
              '为了减小编译出来的文件大小'
            ],
            correctIndex: 1,
            explanation: '这是 Go 物理包边界控制的核心设计。Go 编译器在物理层禁止从项目包外部导入 internal 中的组件，防止私有核心业务被乱用或非法耦合。',
          },
          {
            question: 'Go 表驱动测试（Table-Driven Tests）的精髓理念是什么？',
            options: [
              '把测试数据存入 MySQL 数据库，读取进行测试',
              '将“测试数据（Anonymous Struct Slice）”与“测试逻辑（断言校验）”彻底剥离，增加用例仅需增加一行结构体数据，逻辑高度重用',
              '用 Excel 驱动接口测试',
              'Mockito 自动代理断言'
            ],
            correctIndex: 1,
            explanation: '这是 Go 并发测试和单测的主流推荐写法。通过声明一个匿名结构体切片并使用 range 循环，可以使单元测试非常干净、高度可复用，并可通过 t.Run 进行精细的子测试控制。',
          },
          {
            question: '为什么 Go 可以使用 scratch 作为基础 Docker 镜像，从而使最终镜像只有 10MB 左右？',
            options: [
              '因为 Go 已经把整套 JVM 编译进了可执行二进制文件中',
              'Go 是静态编译语言，编译生成的可执行文件直接携带了运行时（Runtime）和调度逻辑，不依赖外部虚拟运行环境和动态链接库',
              'scratch 会自动在运行时从网络下载 Go 的环境包',
              'Go 代码不需要系统 CPU 调度'
            ],
            correctIndex: 1,
            explanation: 'Go 程序在 `CGO_ENABLED=0` 编译后成为完全自包含的静态物理二进制。它不需要 JRE 虚拟机，甚至不需要 Alpine 镜像中的 bash 工具，只需内核调度即可直接裸跑，实现极简、高安全与极速部署。',
          },
        ]}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-card-border">
        <Link href="/chapters/middleware" className="text-sm text-muted-fg hover:text-accent transition-colors flex items-center gap-1">
          ← 服务篇
        </Link>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2">
          🎉 返回首页
        </Link>
      </div>
    </article>
  )
}
