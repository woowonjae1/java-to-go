import { NextRequest, NextResponse } from 'next/server'

const PLAYGROUND_TIMEOUT_MS = 10000
const MAX_CODE_LENGTH = 10000

interface PlaygroundEvent {
  Message: string
}

interface PlaygroundResponse {
  Errors?: string
  Events?: PlaygroundEvent[]
  VetErrors?: string
}

function jsonError(error: string, code: string, status: number) {
  return NextResponse.json({ error, code }, { status })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPlaygroundResponse(value: unknown): value is PlaygroundResponse {
  if (!isRecord(value)) return false

  const { Errors, Events, VetErrors } = value
  const errorsValid = Errors === undefined || typeof Errors === 'string'
  const vetErrorsValid = VetErrors === undefined || typeof VetErrors === 'string'
  const eventsValid =
    Events === undefined ||
    (Array.isArray(Events) &&
      Events.every((event) => isRecord(event) && typeof event.Message === 'string'))

  return errorsValid && vetErrorsValid && eventsValid
}

function isAbortError(error: unknown) {
  return isRecord(error) && error.name === 'AbortError'
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return jsonError('请求体不是有效 JSON', 'INVALID_JSON', 400)
    }

    if (!isRecord(body)) {
      return jsonError('请求体不是有效 JSON 对象', 'INVALID_JSON', 400)
    }

    const { code } = body

    if (!code || typeof code !== 'string') {
      return jsonError('请提供 Go 代码', 'INVALID_CODE', 400)
    }

    if (code.length > MAX_CODE_LENGTH) {
      return jsonError(`代码长度超过限制（最多 ${MAX_CODE_LENGTH} 字符）`, 'CODE_TOO_LARGE', 400)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), PLAYGROUND_TIMEOUT_MS)
    let response: Response

    try {
      response = await fetch('https://go.dev/_/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          version: '2',
          body: code,
          withVet: 'true',
        }),
        signal: controller.signal,
      })
    } catch (error) {
      if (isAbortError(error)) {
        return jsonError('Go Playground 服务响应超时，请稍后重试', 'UPSTREAM_TIMEOUT', 504)
      }

      console.error('Go Playground upstream request error:', error)
      return jsonError('Go Playground 服务暂时不可用', 'UPSTREAM_UNAVAILABLE', 502)
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      return jsonError(`Go Playground 服务暂时不可用 (${response.status})`, 'UPSTREAM_UNAVAILABLE', 502)
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      return jsonError('Go Playground 返回了无法解析的响应', 'UPSTREAM_MALFORMED', 502)
    }

    if (!isPlaygroundResponse(data)) {
      return jsonError('Go Playground 返回了未知响应格式', 'UPSTREAM_MALFORMED', 502)
    }

    // Parse the Go Playground response format.
    let output = ''
    let hasError = false

    if (data.Errors) {
      output = data.Errors
      hasError = true
    } else if (data.Events) {
      output = data.Events.map((event) => event.Message).join('')
    }

    return NextResponse.json({
      output: output.trim(),
      hasError,
      vetErrors: data.VetErrors || '',
    })
  } catch (error) {
    console.error('Go Playground proxy error:', error)
    return jsonError('服务器内部错误，请稍后重试', 'INTERNAL_ERROR', 500)
  }
}
