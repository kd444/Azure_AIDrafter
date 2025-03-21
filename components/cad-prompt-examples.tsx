"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CadPromptExamplesProps {
  onSelectExample: (example: string) => void
}

export function CadPromptExamples({ onSelectExample }: CadPromptExamplesProps) {
  const examples = [
    {
      title: "Modern House",
      description: "A single-story modern house with open floor plan",
      prompt:
        "Design a modern single-story house with an open floor plan. Include a large living room connected to the kitchen and dining area. Add 3 bedrooms, with the master bedroom having an en-suite bathroom. Include large windows on the south-facing wall for natural light. The house should have a minimalist design with clean lines and a flat roof.",
    },
    {
      title: "Office Space",
      description: "An open office with meeting rooms and amenities",
      prompt:
        "Create an open office space for a tech company with 20 employees. Include a reception area, 3 meeting rooms of different sizes, an open workspace with desks, a kitchen/break area, and 2 bathrooms. The space should have large windows for natural light and a modern, collaborative feel.",
    },
    {
      title: "Retail Store",
      description: "A retail space with display areas and storage",
      prompt:
        "Design a retail store layout for a clothing boutique. Include a main display area, fitting rooms, a checkout counter, a small storage room, and a staff break room. The entrance should have large display windows, and the interior should have a clean, modern aesthetic with good flow for customers to browse merchandise.",
    },
    {
      title: "Restaurant",
      description: "A restaurant with dining areas and kitchen",
      prompt:
        "Create a restaurant layout with seating for 60 people. Include a main dining area, a bar section, a private dining room, restrooms, and a commercial kitchen. The entrance should have a waiting area, and the layout should optimize server workflow while creating a pleasant dining experience.",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Prompts</CardTitle>
        <CardDescription>Select an example to get started quickly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {examples.map((example, index) => (
          <div
            key={index}
            className="border rounded-md p-3 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <h3 className="font-medium mb-1">{example.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{example.description}</p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => onSelectExample(example.prompt)}>
              Use This Example
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

