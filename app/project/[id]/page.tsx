"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { AgentFeedback } from "@/components/agent-feedback"
import { DesignCanvas } from "@/components/design-canvas"
import { DesignControls } from "@/components/design-controls"
import { DesignHistory } from "@/components/design-history"
import { ProjectHeader } from "@/components/project-header"
import { Visualization3D } from "@/components/visualization-3d"
import { VoiceInput } from "@/components/voice-input"
import { useState } from "react"

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [inputMode, setInputMode] = useState<"sketch" | "voice">("sketch")

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
      <ProjectHeader projectId={params.id} />

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <div className="lg:col-span-2 flex flex-col space-y-4 overflow-hidden">
          <Card className="flex-1 overflow-hidden flex flex-col">
            <Tabs defaultValue="input" className="flex flex-col h-full">
              <div className="px-4 pt-4">
                <TabsList>
                  <TabsTrigger value="input">Design Input</TabsTrigger>
                  <TabsTrigger value="visualization">3D Visualization</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="input" className="flex-1 p-4 flex flex-col">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Design Input</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setInputMode("sketch")}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        inputMode === "sketch"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      Sketch
                    </button>
                    <button
                      onClick={() => setInputMode("voice")}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        inputMode === "voice"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      Voice
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  {inputMode === "sketch" ? (
                    <DesignCanvas projectId={params.id} />
                  ) : (
                    <VoiceInput projectId={params.id} />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="visualization" className="flex-1 flex flex-col">
                <Visualization3D projectId={params.id} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="flex flex-col space-y-4 overflow-auto">
          <DesignControls projectId={params.id} />
          <AgentFeedback projectId={params.id} />
          <DesignHistory projectId={params.id} />
        </div>
      </div>
    </div>
  )
}

