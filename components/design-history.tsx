"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check, History, RotateCcw } from "lucide-react"
import { useState } from "react"

export function DesignHistory({ projectId }: { projectId: string }) {
  // Mock history data - in real app this would come from API
  const [history, setHistory] = useState([
    { id: 1, date: "2023-04-15T10:30:00", name: "Initial Design", active: false },
    { id: 2, date: "2023-04-15T14:45:00", name: "Added North Wing", active: false },
    { id: 3, date: "2023-04-16T09:15:00", name: "Updated Roof Design", active: false },
    { id: 4, date: "2023-04-16T16:20:00", name: "Optimized for Sustainability", active: true },
  ])

  const [currentVersion, setCurrentVersion] = useState(3) // 0-based index

  const setActiveVersion = (index: number) => {
    if (index < 0 || index >= history.length) return

    setCurrentVersion(index)
    setHistory(history.map((item, i) => ({ ...item, active: i === index })))
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Design History</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentVersion <= 0}
              onClick={() => setActiveVersion(currentVersion - 1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentVersion >= history.length - 1}
              onClick={() => setActiveVersion(currentVersion + 1)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="relative">
          <div className="absolute left-2 h-full w-0.5 bg-border" />

          {history.map((version, index) => (
            <div
              key={version.id}
              className={`relative flex items-start mb-3 pl-6 cursor-pointer ${version.active ? "" : "opacity-70"}`}
              onClick={() => setActiveVersion(index)}
            >
              <div
                className={`absolute left-0 top-0 w-4 h-4 rounded-full flex items-center justify-center ${
                  version.active
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-muted-foreground/40 bg-background"
                }`}
              >
                {version.active && <Check className="h-3 w-3" />}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium">{version.name}</h4>
                    <p className="text-xs text-muted-foreground">{new Date(version.date).toLocaleString()}</p>
                  </div>

                  {version.active && (
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                        Compare
                      </Button>
                      {index !== history.length - 1 && (
                        <Button variant="outline" size="icon" className="h-7 w-7">
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" className="w-full gap-1">
          <History className="h-4 w-4" />
          View All Versions
        </Button>
      </CardContent>
    </Card>
  )
}

