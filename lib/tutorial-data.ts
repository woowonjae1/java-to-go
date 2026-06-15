export interface TutorialChapter {
  id: string
  title: string
  path: string
}

export const tutorialChapters: TutorialChapter[] = [
  { id: 'intro', title: '1. Go 简介', path: '/tutorial/intro' },
  { id: 'structure', title: '2. Go 语言结构', path: '/tutorial/structure' },
  { id: 'syntax', title: '3. Go 基础语法', path: '/tutorial/syntax' },
  { id: 'variables', title: '4. Go 变量与常量', path: '/tutorial/variables' },
  { id: 'types', title: '5. Go 数据类型', path: '/tutorial/types' },
  { id: 'operators', title: '6. Go 运算符', path: '/tutorial/operators' },
  { id: 'conditions', title: '7. Go 条件语句', path: '/tutorial/conditions' },
  { id: 'loops', title: '8. Go 循环语句', path: '/tutorial/loops' },
  { id: 'functions', title: '9. Go 函数', path: '/tutorial/functions' },
  { id: 'scope', title: '10. Go 作用域', path: '/tutorial/scope' },
  { id: 'arrays', title: '11. Go 数组', path: '/tutorial/arrays' },
  { id: 'pointers', title: '12. Go 指针', path: '/tutorial/pointers' },
  { id: 'structs', title: '13. Go 结构体', path: '/tutorial/structs' },
  { id: 'slices', title: '14. Go 切片 (Slice)', path: '/tutorial/slices' },
  { id: 'range', title: '15. Go 范围 (Range)', path: '/tutorial/range' },
  { id: 'maps', title: '16. Go 集合 (Map)', path: '/tutorial/maps' },
  { id: 'interfaces', title: '17. Go 接口', path: '/tutorial/interfaces' },
  { id: 'errors', title: '18. Go 错误处理', path: '/tutorial/errors' },
  { id: 'concurrency', title: '19. Go 并发', path: '/tutorial/concurrency' },
]
