import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

const codeDuel = read('components/code-duel.tsx')
assert(
  codeDuel.includes('function escapeHtmlAttribute'),
  'CodeDuel should define a dedicated HTML attribute escaping helper.'
)
assert(
  codeDuel.includes('const escapedKeyword = escapeHtmlAttribute(kw)'),
  'CodeDuel should escape highlight keywords before placing them in data-keyword.'
)
assert(
  codeDuel.includes('data-keyword="${escapedKeyword}"'),
  'CodeDuel data-keyword should use the escaped keyword value.'
)

const progress = read('lib/progress.ts')
assert(
  progress.includes('chapterTaskCounts'),
  'Progress should derive per-chapter task counts from exported metadata.'
)
assert(
  progress.includes('totalTaskCount'),
  'Progress should derive total task count from exported metadata.'
)
assert(
  !progress.includes('Each chapter has 4 exercises') && !progress.includes('Total: 16 exercises + 4 quizzes = 20 tasks'),
  'Progress should not contain the old hardcoded task count comments.'
)

const route = read('app/api/run-go/route.ts')
assert(route.includes('AbortController'), 'Go runner should abort slow upstream Playground requests.')
assert(route.includes('PLAYGROUND_TIMEOUT_MS'), 'Go runner should use a named timeout constant.')
assert(route.includes('UPSTREAM_TIMEOUT'), 'Go runner should return a stable upstream timeout code.')
assert(route.includes('isPlaygroundResponse'), 'Go runner should validate the upstream response shape.')

console.log('Static repair assertions passed.')
