import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: '请提供 Go 代码' },
        { status: 400 }
      )
    }

    if (code.length > 10000) {
      return NextResponse.json(
        { error: '代码长度超过限制（最多 10000 字符）' },
        { status: 400 }
      )
    }

    const response = await fetch('https://go.dev/_/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        version: '2',
        body: code,
        withVet: 'true',
      }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Go Playground 服务暂时不可用 (${response.status})` },
        { status: 502 }
      )
    }

    const data = await response.json()
    
    // Parse the Go Playground response format
    let output = ''
    let hasError = false

    if (data.Errors) {
      output = data.Errors
      hasError = true
    } else if (data.Events) {
      output = data.Events.map((e: { Message: string }) => e.Message).join('')
    }

    return NextResponse.json({
      output: output.trim(),
      hasError,
      vetErrors: data.VetErrors || '',
    })
  } catch (error) {
    console.error('Go Playground proxy error:', error)
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
}
