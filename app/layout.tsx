import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Java → Go | 技术博客",
  description:
    "面向 Java 程序员的 Go 语言深度技术博客。运行时调度、内存逃逸、并发范式、工程平替——系统性拆解从 Java 到 Go 的思维转型。",
  keywords: ["Java", "Go", "Golang", "技术博客", "教程", "转型", "编程", "对比"],
  openGraph: {
    title: "Java → Go | 技术博客",
    description: "面向 Java 程序员的 Go 语言深度技术博客",
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
                <span className="font-semibold text-foreground">Java → Go</span> · 技术博客
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
