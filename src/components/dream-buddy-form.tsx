'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2 } from 'lucide-react'

interface DreamBuddyFormProps {
  onGenerate: (data: {
    pfpDescription: string
    evolutionStyle: 'soft' | 'medium' | 'wild'
    platforms: string[]
  }) => Promise<void>
  isGenerating: boolean
}

export function DreamBuddyForm({ onGenerate, isGenerating }: DreamBuddyFormProps): JSX.Element {
  const [pfpDescription, setPfpDescription] = useState<string>('')
  const [evolutionStyle, setEvolutionStyle] = useState<'soft' | 'medium' | 'wild'>('medium')
  const [platforms, setPlatforms] = useState<string[]>(['all'])

  const handlePlatformToggle = (platform: string): void => {
    if (platform === 'all') {
      setPlatforms(['all'])
    } else {
      const newPlatforms = platforms.includes('all')
        ? [platform]
        : platforms.includes(platform)
        ? platforms.filter((p: string): boolean => p !== platform)
        : [...platforms, platform]
      
      setPlatforms(newPlatforms.length === 0 ? ['all'] : newPlatforms)
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    
    if (!pfpDescription.trim()) {
      alert('Please describe your PFP')
      return
    }

    await onGenerate({
      pfpDescription,
      evolutionStyle,
      platforms: platforms.includes('all') ? ['farcaster', 'base', 'x'] : platforms,
    })
  }

  return (
    <Card className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl border-purple-300/30 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-300" />
          Character Lab
        </CardTitle>
        <CardDescription className="text-purple-200 text-lg">
          Describe your PFP and watch it transform into a DreamNet entity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* PFP Description */}
          <div className="space-y-3">
            <Label htmlFor="pfp-description" className="text-white text-lg font-semibold">
              Describe Your PFP
            </Label>
            <Textarea
              id="pfp-description"
              placeholder="Example: A purple fox with golden eyes, wearing a cosmic hoodie with star patterns. Has a playful vibe with a tech-savvy aesthetic..."
              value={pfpDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => setPfpDescription(e.target.value)}
              className="min-h-32 bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300/50 resize-none"
              disabled={isGenerating}
            />
            <p className="text-sm text-purple-300">
              Include color, species, vibe, accessories, and any lore
            </p>
          </div>

          {/* Evolution Style */}
          <div className="space-y-4">
            <Label className="text-white text-lg font-semibold">Evolution Style</Label>
            <RadioGroup
              value={evolutionStyle}
              onValueChange={(value: string): void => setEvolutionStyle(value as 'soft' | 'medium' | 'wild')}
              className="space-y-3"
              disabled={isGenerating}
            >
              <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-lg border border-purple-300/20 hover:bg-white/10 transition-colors">
                <RadioGroupItem value="soft" id="soft" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="soft" className="text-white font-semibold cursor-pointer">
                    Soft Evolution
                  </Label>
                  <p className="text-sm text-purple-200">Very close to original, subtle enhancements</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-lg border border-purple-300/20 hover:bg-white/10 transition-colors">
                <RadioGroupItem value="medium" id="medium" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="medium" className="text-white font-semibold cursor-pointer">
                    Medium Evolution
                  </Label>
                  <p className="text-sm text-purple-200">Noticeable upgrade, still recognizable</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-lg border border-purple-300/20 hover:bg-white/10 transition-colors">
                <RadioGroupItem value="wild" id="wild" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="wild" className="text-white font-semibold cursor-pointer">
                    Wild Evolution
                  </Label>
                  <p className="text-sm text-purple-200">Farther out, spiritually related but bold</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Platform Selection */}
          <div className="space-y-4">
            <Label className="text-white text-lg font-semibold">Where will you use it?</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'all', label: 'All Platforms' },
                { id: 'farcaster', label: 'Farcaster' },
                { id: 'base', label: 'Base' },
                { id: 'x', label: 'X (Twitter)' },
              ].map((platform: { id: string; label: string }) => (
                <div
                  key={platform.id}
                  className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-purple-300/20 hover:bg-white/10 transition-colors"
                >
                  <Checkbox
                    id={platform.id}
                    checked={platforms.includes(platform.id)}
                    onCheckedChange={(): void => handlePlatformToggle(platform.id)}
                    className="border-purple-300"
                    disabled={isGenerating}
                  />
                  <Label
                    htmlFor={platform.id}
                    className="text-white cursor-pointer flex-1"
                  >
                    {platform.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-6"
            disabled={isGenerating || !pfpDescription.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Alchemizing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Transform into DreamNet Entity
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
