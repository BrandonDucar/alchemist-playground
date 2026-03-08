import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Basic proxy for OpenAI API calls
    if (body.origin === 'api.openai.com') {
      const apiKey = process.env.OPENAI_API_KEY
      
      if (!apiKey) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        )
      }
      
      const response = await fetch(`https://${body.origin}${body.path}`, {
        method: body.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...body.headers
        },
        body: body.body ? body.body : undefined
      })
      
      const data = await response.text()
      return new Response(data, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'application/json'
        }
      })
    }
    
    return NextResponse.json({ error: 'Unsupported proxy request' }, { status: 400 })
    
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
