"use client";

import { useState } from "react";
import { CadModelViewer } from "@/components/cad-model-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CadTestPage() {
    const [viewerSettings] = useState({
        showGrid: true,
        showAxes: true,
        backgroundColor: "#f0f0f0",
        lighting: "day",
        wireframe: false,
        zoom: 1,
    });

    const sampleModelData = {
        rooms: [
            {
                name: "Living Room",
                width: 5,
                length: 4,
                height: 2.8,
                x: 0,
                y: 0,
                z: 0,
                connected_to: [],
            },
        ],
        windows: [
            {
                room: "Living Room",
                wall: "south",
                width: 2,
                height: 1.5,
                position: 0.5,
            },
        ],
        doors: [],
    };

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader>
                    <CardTitle>CAD Viewer Test</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[600px] border rounded-md overflow-hidden">
                        <CadModelViewer
                            modelData={sampleModelData}
                            settings={viewerSettings}
                        />
                    </div>
                    <div className="mt-4">
                        <Button
                            onClick={() =>
                                (window.location.href = "/cad-generator")
                            }
                        >
                            Back to CAD Generator
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
