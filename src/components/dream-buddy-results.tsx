'use client'

import { useState } from 'react'
import type { GenerationResult, EvolutionPath } from '@/types/dream-buddy'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Sparkles, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

interface DreamBuddyResultsProps {
  result: GenerationResult
  onReset: () => void
}

export function DreamBuddyResults({ result, onReset }: DreamBuddyResultsProps): JSX.Element {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const handleCopy = async (text: string, label: string): Promise<void> => {
    await navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout((): void => setCopiedText(null), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Codename */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-purple-300/30">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <Badge className="bg-purple-500 text-white text-lg px-4 py-1">
                DreamNet Entity
              </Badge>
            </div>
            <CardTitle className="text-5xl font-bold text-white mb-2">
              {result.codename}
            </CardTitle>
            <CardDescription className="text-purple-200 text-lg">
              Your PFP has been transformed into a DreamNet character
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Lore Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-white/10 backdrop-blur-xl border-purple-300/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Origin Lore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p className="text-purple-100 whitespace-pre-wrap leading-relaxed">
                {result.lore}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Evolution Paths */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-white/10 backdrop-blur-xl border-purple-300/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Evolution Paths</CardTitle>
            <CardDescription className="text-purple-200">
              Explore how your character can transform across the DreamNet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.evolutionPaths.map((path: EvolutionPath, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg p-6 border border-purple-300/20"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-500 text-white">
                        Path {index + 1}
                      </Badge>
                      <h3 className="text-xl font-bold text-white">{path.name}</h3>
                    </div>
                    <p className="text-purple-200 text-sm">{path.visualChanges}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-purple-300 text-sm font-semibold">
                      Grok Prompt for Generation:
                    </Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async (): Promise<void> => await handleCopy(path.grokPrompt, `path-${index}`)}
                      className="text-purple-300 hover:text-white hover:bg-purple-500/20"
                    >
                      {copiedText === `path-${index}` ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-black/30 rounded p-3 border border-purple-500/20">
                    <code className="text-purple-100 text-sm break-words whitespace-pre-wrap">
                      {path.grokPrompt}
                    </code>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Post-Ready Copy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-white/10 backdrop-blur-xl border-purple-300/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Post-Ready Copy</CardTitle>
            <CardDescription className="text-purple-200">
              Share your DreamNet character on social platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="base" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-purple-900/30">
                <TabsTrigger value="base" className="data-[state=active]:bg-purple-500">
                  Base
                </TabsTrigger>
                <TabsTrigger value="farcaster" className="data-[state=active]:bg-purple-500">
                  Farcaster
                </TabsTrigger>
                <TabsTrigger value="x" className="data-[state=active]:bg-purple-500">
                  X (Twitter)
                </TabsTrigger>
              </TabsList>
              
              {Object.entries(result.postCopy).map(([platform, copy]: [string, string]) => (
                <TabsContent key={platform} value={platform} className="space-y-3">
                  <div className="bg-black/30 rounded p-4 border border-purple-500/20">
                    <p className="text-purple-100 mb-3">{copy}</p>
                    <Button
                      size="sm"
                      onClick={async (): Promise<void> => await handleCopy(copy, platform)}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      {copiedText === platform ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Caption
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reset Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-center"
      >
        <Button
          onClick={onReset}
          size="lg"
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Create Another DreamBuddy
        </Button>
      </motion.div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <label className={className}>{children}</label>
}
