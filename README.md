# Java to Go

面向 Java 开发者的 Go 语言迁移学习平台。项目通过并排代码对照、概念迁移说明、在线 Go 练习和本地进度记录，帮助熟悉 Java/Spring 生态的开发者更系统地理解 Go 的工程写法。

## 核心功能

- **Java vs Go 双轨代码对照**：使用 `CodeDuel` 展示两种语言的同一业务场景，并支持关键词联动高亮。
- **体系化学习路线**：从基础类型、组合设计、错误处理、并发模型，到 Web、数据库、中间件、工程架构和企业案例。
- **在线 Go 练习**：通过 `/api/run-go` 代理调用 Go Playground 编译接口，支持练习代码运行和输出校验。
- **本地学习进度**：练习和测验进度保存在浏览器 `localStorage`，不需要账号和后端数据库。
- **导航体验**：提供章节侧边栏、命令面板、深浅色主题切换和响应式页面。

## 学习路线

1. 基础篇：类型、变量、指针、字符串、集合
2. 结构篇：从 Java OOP 到 Go 组合与接口
3. 异常篇：从 `try-catch` 到显式 `error`
4. 并发篇：线程、goroutine、channel、context
5. Web 篇：Spring MVC 到 Gin 风格 API
6. 数据篇：连接池、ORM、显式事务
7. 服务篇：Redis、gRPC、结构化日志
8. 工程篇：目录结构、测试、部署
9. 实战篇：企业级 AI 助手服务端迁移案例

## 本地运行

```bash
npm install
npm run dev
```

启动后访问 [http://localhost:3000](http://localhost:3000)。

## 质量检查

```bash
npm run lint
npm run build
node scripts/verify-repair.mjs
```

项目使用 Next.js 16、React 19、Tailwind CSS 4 和 TypeScript。`next.config.ts` 已开启 `typedRoutes`，动态路由链接会在构建阶段进行类型校验。

## Go Playground 依赖

在线练习会请求 `/api/run-go`，由服务端代理转发到 `https://go.dev/_/compile`。部署环境需要允许出站访问 `go.dev`，否则练习运行功能会不可用。

代理接口会做基础输入校验、代码长度限制、上游超时处理和响应格式校验，避免客户端直接依赖外部接口细节。

## 隐私说明

- 本项目没有账号系统。
- 学习进度只保存在当前浏览器的 `localStorage`。
- 在线练习代码会发送到 Go Playground 编译接口，请不要提交敏感业务代码或私密信息。

## 本地素材目录

开发时可以在仓库根目录放置本地 Java 代码参考素材目录。该目录已写入 `.gitignore`，不是开源项目的一部分，也不应该提交到 GitHub。

## 贡献

欢迎提交 issue 或 pull request。建议在提交前运行：

```bash
npm run lint
npm run build
node scripts/verify-repair.mjs
```

如果新增章节练习或测验，请同步更新 `lib/data.ts` 中的任务元数据，避免进度统计失真。

## License

MIT License. See [LICENSE](./LICENSE).
