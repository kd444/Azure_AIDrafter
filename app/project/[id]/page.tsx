"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AgentFeedback } from "@/components/agent-feedback";
import { DesignCanvas } from "@/components/design-canvas";
import { DesignControls } from "@/components/design-controls";
import { DesignHistory } from "@/components/design-history";
import { ProjectHeader } from "@/components/project-header";
import { Visualization3D } from "@/components/visualization-3d";
import { VoiceInput } from "@/components/voice-input";
import { EnhancedRoomOverview } from "@/components/enhanced-room-overview";
import { useState } from "react";

// Dummy model data for demonstration purposes
const DUMMY_MODEL_DATA = {
    rooms: [
        {
            name: "Living Room",
            type: "living",
            width: 5.2,
            length: 4.8,
            height: 2.7,
            x: 0,
            y: 0,
            z: 0,
            connected_to: ["Kitchen", "Hallway"],
        },
        {
            name: "Kitchen",
            type: "kitchen",
            width: 3.8,
            length: 3.2,
            height: 2.7,
            x: 5.2,
            y: 0,
            z: 0,
            connected_to: ["Living Room", "Dining Room"],
        },
        {
            name: "Dining Room",
            type: "dining",
            width: 3.8,
            length: 3.6,
            height: 2.7,
            x: 5.2,
            y: 0,
            z: 3.2,
            connected_to: ["Kitchen"],
        },
        {
            name: "Master Bedroom",
            type: "bedroom",
            width: 4.5,
            length: 3.8,
            height: 2.7,
            x: 0,
            y: 0,
            z: 4.8,
            connected_to: ["Hallway", "Master Bathroom"],
        },
        {
            name: "Master Bathroom",
            type: "bathroom",
            width: 2.4,
            length: 2.6,
            height: 2.7,
            x: 4.5,
            y: 0,
            z: 6.0,
            connected_to: ["Master Bedroom"],
        },
        {
            name: "Hallway",
            type: "hallway",
            width: 1.2,
            length: 3.6,
            height: 2.7,
            x: 0,
            y: 0,
            z: 8.6,
            connected_to: [
                "Living Room",
                "Master Bedroom",
                "Bedroom 2",
                "Bathroom 2",
            ],
        },
        {
            name: "Bedroom 2",
            type: "bedroom",
            width: 3.6,
            length: 3.2,
            height: 2.7,
            x: 0,
            y: 0,
            z: 12.2,
            connected_to: ["Hallway"],
        },
        {
            name: "Bathroom 2",
            type: "bathroom",
            width: 2.2,
            length: 1.8,
            height: 2.7,
            x: 3.6,
            y: 0,
            z: 12.2,
            connected_to: ["Hallway"],
        },
    ],
    windows: [
        {
            room: "Living Room",
            wall: "south",
            width: 1.8,
            height: 1.5,
            position: 0.5,
        },
        {
            room: "Kitchen",
            wall: "east",
            width: 1.2,
            height: 1.2,
            position: 0.5,
        },
        {
            room: "Dining Room",
            wall: "east",
            width: 1.5,
            height: 1.5,
            position: 0.5,
        },
        {
            room: "Master Bedroom",
            wall: "south",
            width: 1.8,
            height: 1.5,
            position: 0.5,
        },
        {
            room: "Bedroom 2",
            wall: "west",
            width: 1.5,
            height: 1.5,
            position: 0.5,
        },
    ],
    doors: [
        { from: "Living Room", to: "Kitchen", width: 0.9, height: 2.1 },
        { from: "Kitchen", to: "Dining Room", width: 0.9, height: 2.1 },
        { from: "Living Room", to: "Hallway", width: 0.9, height: 2.1 },
        { from: "Hallway", to: "Master Bedroom", width: 0.9, height: 2.1 },
        {
            from: "Master Bedroom",
            to: "Master Bathroom",
            width: 0.8,
            height: 2.1,
        },
        { from: "Hallway", to: "Bedroom 2", width: 0.9, height: 2.1 },
        { from: "Hallway", to: "Bathroom 2", width: 0.8, height: 2.1 },
    ],
};

export default function ProjectPage({ params }: { params: { id: string } }) {
    const [inputMode, setInputMode] = useState<"sketch" | "voice">("sketch");
    const [displayUnit, setDisplayUnit] = useState<"metric" | "imperial">(
        "metric"
    );

    return (
        <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
            <ProjectHeader projectId={params.id} />

            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
                <div className="lg:col-span-2 flex flex-col space-y-4 overflow-hidden">
                    <Card className="flex-1 overflow-hidden flex flex-col">
                        <Tabs
                            defaultValue="input"
                            className="flex flex-col h-full"
                        >
                            <div className="px-4 pt-4">
                                <TabsList>
                                    <TabsTrigger value="input">
                                        Design Input
                                    </TabsTrigger>
                                    <TabsTrigger value="visualization">
                                        3D Visualization
                                    </TabsTrigger>
                                    <TabsTrigger value="overview">
                                        Room Overview
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent
                                value="input"
                                className="flex-1 p-4 flex flex-col"
                            >
                                <div className="mb-4 flex justify-between items-center">
                                    <h2 className="text-xl font-semibold">
                                        Design Input
                                    </h2>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                setInputMode("sketch")
                                            }
                                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                inputMode === "sketch"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary text-secondary-foreground"
                                            }`}
                                        >
                                            Sketch
                                        </button>
                                        <button
                                            onClick={() =>
                                                setInputMode("voice")
                                            }
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

                            <TabsContent
                                value="visualization"
                                className="flex-1 flex flex-col"
                            >
                                <Visualization3D projectId={params.id} />
                            </TabsContent>

                            {/* New tab for the architectural room overview */}
                            <TabsContent
                                value="overview"
                                className="flex-1 p-4 flex flex-col"
                            >
                                <div className="mb-4 flex justify-between items-center">
                                    <h2 className="text-xl font-semibold">
                                        Architectural Overview
                                    </h2>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                setDisplayUnit("metric")
                                            }
                                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                displayUnit === "metric"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary text-secondary-foreground"
                                            }`}
                                        >
                                            Metric
                                        </button>
                                        <button
                                            onClick={() =>
                                                setDisplayUnit("imperial")
                                            }
                                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                displayUnit === "imperial"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary text-secondary-foreground"
                                            }`}
                                        >
                                            Imperial
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <EnhancedRoomOverview
                                        modelData={DUMMY_MODEL_DATA}
                                        isMetric={displayUnit === "metric"}
                                    />
                                </div>
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
    );
}
