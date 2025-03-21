"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

export function DesignControls({ projectId }: { projectId: string }) {
  const [dimensions, setDimensions] = useState({
    width: 30,
    length: 50,
    height: 15,
  })

  const [materials, setMaterials] = useState({
    exterior: "concrete",
    windows: "standard",
    roof: "metal",
  })

  const [features, setFeatures] = useState({
    solarPanels: false,
    greenRoof: false,
    smartLighting: true,
  })

  return (
    <Card>
      <Tabs defaultValue="dimensions">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <CardContent className="pt-4">
          <TabsContent value="dimensions" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Width (m)</Label>
                <span className="text-sm">{dimensions.width} m</span>
              </div>
              <Slider
                value={[dimensions.width]}
                min={10}
                max={100}
                step={1}
                onValueChange={(value) => setDimensions({ ...dimensions, width: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Length (m)</Label>
                <span className="text-sm">{dimensions.length} m</span>
              </div>
              <Slider
                value={[dimensions.length]}
                min={10}
                max={100}
                step={1}
                onValueChange={(value) => setDimensions({ ...dimensions, length: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Height (m)</Label>
                <span className="text-sm">{dimensions.height} m</span>
              </div>
              <Slider
                value={[dimensions.height]}
                min={5}
                max={50}
                step={1}
                onValueChange={(value) => setDimensions({ ...dimensions, height: value[0] })}
              />
            </div>

            <div className="pt-2">
              <div className="rounded-md bg-primary/10 p-3">
                <div className="text-sm font-medium">Total Area</div>
                <div className="text-2xl font-bold">{dimensions.width * dimensions.length} m²</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Estimated volume: {dimensions.width * dimensions.length * dimensions.height} m³
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exterior-material">Exterior Material</Label>
              <Select
                value={materials.exterior}
                onValueChange={(value) => setMaterials({ ...materials, exterior: value })}
              >
                <SelectTrigger id="exterior-material">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concrete">Concrete</SelectItem>
                  <SelectItem value="brick">Brick</SelectItem>
                  <SelectItem value="metal">Metal Cladding</SelectItem>
                  <SelectItem value="glass">Glass Curtain Wall</SelectItem>
                  <SelectItem value="wood">Wood</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="window-type">Window Type</Label>
              <Select
                value={materials.windows}
                onValueChange={(value) => setMaterials({ ...materials, windows: value })}
              >
                <SelectTrigger id="window-type">
                  <SelectValue placeholder="Select window type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Glass</SelectItem>
                  <SelectItem value="lowE">Low-E Glass</SelectItem>
                  <SelectItem value="tinted">Tinted Glass</SelectItem>
                  <SelectItem value="smart">Smart Glass</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roof-material">Roof Material</Label>
              <Select value={materials.roof} onValueChange={(value) => setMaterials({ ...materials, roof: value })}>
                <SelectTrigger id="roof-material">
                  <SelectValue placeholder="Select roof material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metal">Metal</SelectItem>
                  <SelectItem value="tile">Tile</SelectItem>
                  <SelectItem value="green">Green Roof</SelectItem>
                  <SelectItem value="solar">Integrated Solar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="my-2" />

            <div className="text-sm text-muted-foreground">
              Estimated material cost: <span className="font-medium text-foreground">$2,450,000</span>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="solar-panels">Solar Panels</Label>
                <div className="text-sm text-muted-foreground">Add roof-mounted solar panels</div>
              </div>
              <Switch
                id="solar-panels"
                checked={features.solarPanels}
                onCheckedChange={(checked) => setFeatures({ ...features, solarPanels: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="green-roof">Green Roof</Label>
                <div className="text-sm text-muted-foreground">Add vegetation to rooftop</div>
              </div>
              <Switch
                id="green-roof"
                checked={features.greenRoof}
                onCheckedChange={(checked) => setFeatures({ ...features, greenRoof: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="smart-lighting">Smart Lighting</Label>
                <div className="text-sm text-muted-foreground">Add automated lighting system</div>
              </div>
              <Switch
                id="smart-lighting"
                checked={features.smartLighting}
                onCheckedChange={(checked) => setFeatures({ ...features, smartLighting: checked })}
              />
            </div>

            <div className="pt-2">
              <div className="rounded-md bg-primary/10 p-3">
                <div className="text-sm font-medium">Energy Efficiency</div>
                <div className="text-xl font-bold">
                  {features.solarPanels && features.greenRoof && features.smartLighting
                    ? "A+ Rating"
                    : features.solarPanels || features.greenRoof
                      ? "B Rating"
                      : "C Rating"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Estimated yearly savings: $
                  {features.solarPanels ? 15000 : 0 + features.greenRoof ? 5000 : 0 + features.smartLighting ? 8000 : 0}
                </div>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}

