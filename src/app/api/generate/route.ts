import { NextRequest, NextResponse } from 'next/server'
import { openaiChatCompletion } from '@/openai-api'
import type { GenerationResult, GenerateRequest } from '@/types/dream-buddy'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: GenerateRequest = await request.json()
    const { pfpDescription, evolutionStyle, platforms } = body

    if (!pfpDescription || !evolutionStyle || !platforms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Build the system prompt
    const systemPrompt = `You are the DreamNet Alchemist, a creative AI that transforms PFPs into fully-formed DreamNet characters with rich lore and evolution paths.

Your task:
1. Create a unique DreamNet Codename (no overlaps with known characters, make it feel original and memorable)
2. Write 2-3 paragraphs of tight lore explaining:
   - Origin world
   - Powers / glitches
   - How it connects into the fictional "DreamNet Realm"
3. Generate ${evolutionStyle === 'soft' ? '3' : evolutionStyle === 'medium' ? '4' : '5'} Evolution Paths with:
   - Name (e.g., "Quantum Bloom Form")
   - How the visuals change while staying ${evolutionStyle === 'soft' ? 'very close' : evolutionStyle === 'medium' ? 'recognizable but noticeably upgraded' : 'spiritually related but boldly different'} to the original
   - A specific Grok image/video prompt (include camera angles, motion, vibe, background, style)
4. Create post-ready copy for ${platforms.join(', ')} (each ~200-230 characters, reference DreamNet and the new form)

CRITICAL RULES:
- ${evolutionStyle === 'soft' ? 'Stay VERY close to the original, only subtle enhancements' : evolutionStyle === 'medium' ? 'Make noticeable upgrades but keep it recognizable' : 'Go bold and creative but maintain spiritual connection'}
- Keep everything brandable and usable as a profile pic or short video
- Make Grok prompts EXTREMELY specific (camera angles, motion, vibe, background, style)
- Each evolution path should feel unique and exciting

Return ONLY valid JSON in this exact format:
{
  "codename": "string",
  "lore": "string (2-3 paragraphs)",
  "evolutionPaths": [
    {
      "name": "string",
      "visualChanges": "string",
      "grokPrompt": "string (very detailed)"
    }
  ],
  "postCopy": {
    "base": "string (~200-230 chars)",
    "farcaster": "string (~200-230 chars)",
    "x": "string (~200-230 chars)"
  }
}`

    const userPrompt = `Transform this PFP into a DreamNet character:

PFP Description: ${pfpDescription}

Evolution Style: ${evolutionStyle}
Target Platforms: ${platforms.join(', ')}

Create the full character transformation with codename, lore, evolution paths, and social copy.`

    // Call OpenAI
    const response = await openaiChatCompletion({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No content returned from AI')
    }

    // Parse JSON response
    let result: GenerationResult
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
      const jsonString = jsonMatch ? jsonMatch[1] : content
      result = JSON.parse(jsonString.trim())
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      throw new Error('Invalid JSON response from AI')
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating DreamBuddy:', error)
    return NextResponse.json(
      { error: 'Failed to generate DreamBuddy' },
      { status: 500 }
    )
  }
}
