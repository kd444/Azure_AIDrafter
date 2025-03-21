"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Moon, MoveHorizontal, RotateCw, Sun, Sunrise, Sunset, Video } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"

export function Visualization3D({ projectId }: { projectId: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "day" | "evening" | "night">("day")
  const [sliderValue, setSliderValue] = useState([50])

  useEffect(() => {
    if (containerRef.current) {
      // In a real implementation, this would initialize Three.js
      // and load the 3D model for the project
      console.log("Initializing 3D visualization for project", projectId)
    }
  }, [projectId])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-medium">3D Visualization</h2>
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={timeOfDay === "morning" ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setTimeOfDay("morning")}
                >
                  <Sunrise className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Morning Light</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={timeOfDay === "day" ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setTimeOfDay("day")}
                >
                  <Sun className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Day Light</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={timeOfDay === "evening" ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setTimeOfDay("evening")}
                >
                  <Sunset className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Evening Light</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={timeOfDay === "night" ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setTimeOfDay("night")}
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Night Light</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 bg-neutral-900 relative" ref={containerRef}>
        {/* Placeholder for 3D rendering */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="mb-4 opacity-50">3D Model Would Render Here</div>
            <div className="text-sm opacity-30">Using Three.js / React Three Fiber</div>
          </div>
        </div>

        {/* 3D controls overlay */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <MoveHorizontal className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <RotateCw className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <Calendar className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <Video className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 flex items-center space-x-4">
        <span className="text-sm">Lighting Intensity</span>
        <div className="flex-1">
          <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
        </div>
        <span className="text-sm w-8 text-right">{sliderValue[0]}%</span>
      </div>
    </div>
  )
}

