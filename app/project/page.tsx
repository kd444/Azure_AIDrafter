"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CadModelViewer } from "@/components/cad-model-viewer";
import { ProjectHeader } from "@/components/project-header";
import { DesignHistory } from "@/components/design-history";
import { DesignControls } from "@/components/design-controls";
import { DesignCanvas } from "@/components/design-canvas";
import { SplitPane } from "@/components/ui/split-pane";
import { Separator } from "@/components/ui/separator";
import { Edit, Layers, MessageSquare, Plus, Upload, Wand2 } from "lucide-react";

export default function ProjectPage({ params }: { params: { id: string } }) {
    const projectId = params.id;
    const canvasRef = useRef<any>(null);
    const [activeTab, setActiveTab] = useState("3d-view");
    const [viewerSettings, setViewerSettings] = useState({
        viewMode: "3d",
        showGrid: true,
        showAxes: true,
        backgroundColor: "#f0f0f0",
        lighting: "day",
        wireframe: false,
        zoom: 1,
        showDimensions: true,
        showRoomLabels: true,
        showRoomAreas: false,
    });

    // Mock model data - in a real app this would come from an API
    const [modelData, setModelData] = useState({
        rooms: [
            {
                name: "Kitchen",
                width: 4,
                length: 5,
                height: 3,
                x: 0,
                y: 0,
                z: 0,
                connected_to: ["Dining"],
            },
            {
                name: "Dining",
                width: 4,
                length: 4,
                height: 3,
                x: 4,
                y: 0,
                z: 0,
                connected_to: ["Kitchen", "Living"],
            },
            {
                name: "Living",
                width: 6,
                length: 5,
                height: 3,
                x: 4,
                y: 0,
                z: 4,
                connected_to: ["Dining", "Hallway"],
            },
            {
                name: "Hallway",
                width: 2,
                length: 5,
                height: 3,
                x: 10,
                y: 0,
                z: 4,
                connected_to: ["Living", "Bedroom 1", "Bedroom 2", "Bathroom"],
            },
            {
                name: "Bedroom 1",
                width: 4,
                length: 4,
                height: 3,
                x: 12,
                y: 0,
                z: 0,
                connected_to: ["Hallway"],
            },
            {
                name: "Bedroom 2",
                width: 4,
                length: 4,
                height: 3,
                x: 12,
                y: 0,
                z: 5,
                connected_to: ["Hallway"],
            },
            {
                name: "Bathroom",
                width: 3,
                length: 2,
                height: 3,
                x: 8,
                y: 0,
                z: 9,
                connected_to: ["Hallway"],
            },
        ],
        windows: [
            {
                room: "Kitchen",
                wall: "south",
                width: 1.5,
                height: 1.2,
                position: 0.5,
            },
            {
                room: "Living",
                wall: "south",
                width: 2,
                height: 1.5,
                position: 0.5,
            },
            {
                room: "Bedroom 1",
                wall: "east",
                width: 1.5,
                height: 1.2,
                position: 0.5,
            },
            {
                room: "Bedroom 2",
                wall: "east",
                width: 1.5,
                height: 1.2,
                position: 0.5,
            },
        ],
        doors: [
            { from: "Kitchen", to: "Dining", width: 1.2, height: 2.1 },
            { from: "Dining", to: "Living", width: 1.2, height: 2.1 },
            { from: "Living", to: "Hallway", width: 1.2, height: 2.1 },
            { from: "Hallway", to: "Bedroom 1", width: 0.9, height: 2.1 },
            { from: "Hallway", to: "Bedroom 2", width: 0.9, height: 2.1 },
            { from: "Hallway", to: "Bathroom", width: 0.8, height: 2.1 },
        ],
    });

    // Mock comments data
    const [comments, setComments] = useState([
        {
            id: 1,
            user: "User",
            text: "The kitchen layout seems too narrow for efficient workflow. Consider increasing width by 0.5m.",
            timestamp: "2023-04-15T14:30:00",
            position: { x: 120, y: 80 },
        },
        {
            id: 2,
            user: "Mark Johnson",
            text: "Natural light in the living room is fantastic with the current window placement!",
            timestamp: "2023-04-16T10:15:00",
            position: { x: 350, y: 200 },
        },
        {
            id: 3,
            user: "Sarah Wilson",
            text: "Can we add a second bathroom? One bathroom for 2 bedrooms might be insufficient.",
            timestamp: "2023-04-16T16:45:00",
            position: { x: 450, y: 300 },
        },
    ]);

    const handleSettingsChange = (newSettings: any) => {
        setViewerSettings({ ...viewerSettings, ...newSettings });
    };

    const takeScreenshot = () => {
        // In a real app, this would capture and save the current view
        console.log("Taking screenshot");
    };

    const exportModel = () => {
        // In a real app, this would handle model export
        console.log("Exporting model");
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <ProjectHeader projectId={projectId} />

            <div className="flex-1 overflow-hidden">
                <SplitPane
                    direction="horizontal"
                    defaultSizes={[70, 30]}
                    minSize={250}
                    gutterClassName="w-1 bg-border hover:bg-primary/50 cursor-col-resize"
                >
                    <div className="flex flex-col h-full overflow-hidden p-4">
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="flex-1 flex flex-col overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <TabsList>
                                    <TabsTrigger
                                        value="3d-view"
                                        className="gap-2"
                                    >
                                        <Layers className="h-4 w-4" />
                                        3D View
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="sketch"
                                        className="gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Sketch
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="comments"
                                        className="gap-2"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Comments
                                    </TabsTrigger>
                                </TabsList>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Import
                                    </Button>
                                    <Button size="sm" className="gap-1">
                                        <Wand2 className="h-4 w-4" />
                                        Generate
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <TabsContent
                                    value="3d-view"
                                    className="h-full m-0 p-0"
                                >
                                    <Card className="h-full overflow-hidden border">
                                        <CardContent className="p-0 h-full">
                                            {/* CadModelViewer renders your 3D model */}
                                            <CadModelViewer
                                                modelData={modelData}
                                                settings={{
                                                    showGrid:
                                                        viewerSettings.showGrid,
                                                    showAxes:
                                                        viewerSettings.showAxes,
                                                    backgroundColor:
                                                        viewerSettings.backgroundColor,
                                                    lighting:
                                                        viewerSettings.lighting,
                                                    wireframe:
                                                        viewerSettings.wireframe,
                                                    zoom: viewerSettings.zoom,
                                                    showMeasurements:
                                                        viewerSettings.showDimensions,
                                                    roomLabels:
                                                        viewerSettings.showRoomLabels,
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent
                                    value="sketch"
                                    className="h-full m-0 p-0"
                                >
                                    <Card className="h-full overflow-hidden border">
                                        <CardContent className="p-4 h-full">
                                            <DesignCanvas
                                                ref={canvasRef}
                                                projectId={projectId}
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent
                                    value="comments"
                                    className="h-full m-0 p-0"
                                >
                                    <Card className="h-full overflow-hidden border">
                                        <CardContent className="p-4 h-full">
                                            <div className="flex flex-col h-full">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-medium">
                                                        Feedback & Comments
                                                    </h3>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Add Comment
                                                    </Button>
                                                </div>

                                                <div className="flex-1 overflow-y-auto">
                                                    {comments.map((comment) => (
                                                        <Card
                                                            key={comment.id}
                                                            className="mb-3"
                                                        >
                                                            <CardContent className="p-3">
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="font-medium">
                                                                        {
                                                                            comment.user
                                                                        }
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {new Date(
                                                                            comment.timestamp
                                                                        ).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <p>
                                                                    {
                                                                        comment.text
                                                                    }
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                    <div className="h-full overflow-y-auto p-4 space-y-4">
                        {/* Design Control Panel */}
                        <DesignControls
                            settings={viewerSettings}
                            onSettingsChange={handleSettingsChange}
                            onScreenshot={takeScreenshot}
                            onExport={exportModel}
                        />

                        <Separator className="my-4" />

                        {/* Design History */}
                        <DesignHistory projectId={projectId} />

                        {/* Project Information */}
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm font-medium">
                                    Project Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 px-4">
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs text-muted-foreground">
                                            Project Type
                                        </span>
                                        <p className="text-sm">
                                            Commercial Office Building
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">
                                            Total Area
                                        </span>
                                        <p className="text-sm">3,450 sq. ft.</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">
                                            Location
                                        </span>
                                        <p className="text-sm">
                                            San Francisco, CA
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">
                                            Building Code
                                        </span>
                                        <p className="text-sm">IBC 2021</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">
                                            Created
                                        </span>
                                        <p className="text-sm">
                                            April 15, 2023
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </SplitPane>
            </div>
        </div>
    );
}
4;
