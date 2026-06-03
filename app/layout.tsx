import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Java → Go | 从 Java 到 Go 的交互式学习平台",
  description:
    "为 Java 程序员量身打造的 Go 语言学习平台。双轨代码对比、思维模型转换、在线实操练习、避坑指南——助你高效完成语言切换。",
  keywords: ["Java", "Go", "Golang", "学习", "教程", "转型", "编程", "对比"],
  openGraph: {
    title: "Java → Go | 交互式学习平台",
    description: "从 Java 到 Go 的高效学习之路",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-card-border py-8 px-4 text-center text-sm text-muted-fg">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <span>
                <span className="gradient-text font-semibold">Java → Go</span> · 开源学习平台
              </span>
              <div className="flex items-center gap-4">
                <a href="https://github.com" className="hover:text-foreground transition-colors">GitHub</a>
                <a href="https://github.com" className="hover:text-foreground transition-colors">贡献指南</a>
                <span>MIT License</span>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
