"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
    Sun,
    Moon,
    Box,
    Tag,
    Maximize,
    Camera,
    Download,
    Sunrise,
    Sunset,
    Lightbulb,
    Grid3X3,
    Ruler,
} from "lucide-react";

interface ArchitecturalControlsProps {
    settings: {
        viewMode: string;
        showGrid: boolean;
        showAxes: boolean;
        backgroundColor: string;
        lighting: string;
        wireframe: boolean;
        zoom: number;
        showDimensions: boolean;
        showRoomLabels: boolean;
        showRoomAreas: boolean;
    };
    onSettingsChange: (settings: any) => void;
    onScreenshot?: () => void;
    onExport?: () => void;
}

export function DesignControls({
    settings,
    onSettingsChange,
    onScreenshot,
    onExport,
}: ArchitecturalControlsProps) {
    const [colorMode, setColorMode] = useState(
        settings.backgroundColor === "#ffffff" ? "light" : "dark"
    );

    // Update background color based on color mode
    const handleColorModeChange = (mode: string) => {
        setColorMode(mode);
        const backgroundColor = mode === "light" ? "#ffffff" : "#000000";
        onSettingsChange({ ...settings, backgroundColor });
    };

    // Handler for all settings changes
    const handleSettingChange = (key: string, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <Card className="w-full h-full overflow-hidden flex flex-col">
            <CardHeader className="py-2 px-4 border-b">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-medium">
                        Architectural Controls
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent className="flex-grow p-0 overflow-auto">
                <Tabs defaultValue="display" className="w-full h-full">
                    <TabsList className="w-full grid grid-cols-3">
                        <TabsTrigger value="display">Display</TabsTrigger>
                        <TabsTrigger value="lighting">Lighting</TabsTrigger>
                        <TabsTrigger value="measurements">
                            Measurements
                        </TabsTrigger>
                    </TabsList>

                    {/* Display Settings */}
                    <TabsContent value="display" className="p-4 space-y-4">
                        {/* Background Color */}
                        <div className="flex justify-between items-center">
                            <Label>Background</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant={
                                        colorMode === "light"
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        handleColorModeChange("light")
                                    }
                                >
                                    <Sun className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={
                                        colorMode === "dark"
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        handleColorModeChange("dark")
                                    }
                                >
                                    <Moon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Wireframe Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Box className="h-4 w-4 text-muted-foreground" />
                                <Label>Wireframe Mode</Label>
                            </div>
                            <Switch
                                checked={settings.wireframe}
                                onCheckedChange={(checked) =>
                                    handleSettingChange("wireframe", checked)
                                }
                            />
                        </div>

                        {/* Zoom Control */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Zoom Level</Label>
                                <span>{settings.zoom.toFixed(1)}x</span>
                            </div>
                            <Slider
                                value={[settings.zoom]}
                                min={0.5}
                                max={2.0}
                                step={0.1}
                                onValueChange={(value) =>
                                    handleSettingChange("zoom", value[0])
                                }
                            />
                        </div>

                        {/* Screenshot and Export */}
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={onScreenshot}>
                                <Camera className="h-4 w-4 mr-2" />
                                Screenshot
                            </Button>
                            <Button variant="secondary" onClick={onExport}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Lighting Settings */}
                    <TabsContent value="lighting" className="p-4 space-y-4">
                        <Label>Time of Day</Label>
                        <div className="grid grid-cols-4 gap-2">
                            <Button
                                variant={
                                    settings.lighting === "morning"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    handleSettingChange("lighting", "morning")
                                }
                            >
                                <Sunrise className="h-4 w-4" />
                                Morning
                            </Button>
                            <Button
                                variant={
                                    settings.lighting === "day"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    handleSettingChange("lighting", "day")
                                }
                            >
                                <Sun className="h-4 w-4" />
                                Day
                            </Button>
                            <Button
                                variant={
                                    settings.lighting === "evening"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    handleSettingChange("lighting", "evening")
                                }
                            >
                                <Sunset className="h-4 w-4" />
                                Evening
                            </Button>
                            <Button
                                variant={
                                    settings.lighting === "night"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    handleSettingChange("lighting", "night")
                                }
                            >
                                <Moon className="h-4 w-4" />
                                Night
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Measurements Settings */}
                    <TabsContent value="measurements" className="p-4 space-y-4">
                        {/* Grid Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                                <Label>Show Grid</Label>
                            </div>
                            <Switch
                                checked={settings.showGrid}
                                onCheckedChange={(checked) =>
                                    handleSettingChange("showGrid", checked)
                                }
                            />
                        </div>

                        {/* Axes Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Ruler className="h-4 w-4 text-muted-foreground" />
                                <Label>Show Axes</Label>
                            </div>
                            <Switch
                                checked={settings.showAxes}
                                onCheckedChange={(checked) =>
                                    handleSettingChange("showAxes", checked)
                                }
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
