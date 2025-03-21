"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    ZoomIn,
    ZoomOut,
    Loader2,
    Copy,
    Check,
    Save,
    Code,
    Wand2,
    Sun,
    Moon,
    Sunrise,
    Sunset,
} from "lucide-react";
import { CadModelViewer } from "@/components/cad-model-viewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";

export default function CadGeneratorPage() {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedModel, setGeneratedModel] = useState<any>(null);
    const [generatedCode, setGeneratedCode] = useState("");
    const [activeTab, setActiveTab] = useState("visual");
    const [copied, setCopied] = useState(false);
    const [viewerSettings, setViewerSettings] = useState({
        showGrid: true,
        showAxes: true,
        backgroundColor: "#f0f0f0",
        lighting: "day",
        wireframe: false,
        zoom: 1,
    });

    const codeRef = useRef<HTMLPreElement>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);

        try {
            // Call our API endpoint
            const response = await fetch("/api/cad-generator", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to generate model: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();

            console.log("API Response:", data);

            if (!data.modelData || !data.code) {
                console.error("Invalid response format:", data);
                throw new Error("Invalid response format from API");
            }

            // Ensure the modelData has the expected structure
            if (
                !Array.isArray(data.modelData.rooms) ||
                data.modelData.rooms.length === 0
            ) {
                console.error("Invalid or empty rooms array:", data.modelData);
                throw new Error("Invalid model data: no rooms found");
            }

            setGeneratedModel(data.modelData);
            setGeneratedCode(data.code);
            setActiveTab("visual");

            toast({
                title: "Model generated successfully",
                description:
                    "Your CAD model has been created based on your description.",
            });
        } catch (error) {
            console.error("Error generating model:", error);

            // Fallback to mock data if API fails
            const mockResponse = {
                modelData: generateMockModelData(prompt),
                code: generateMockCode(prompt),
            };

            setGeneratedModel(mockResponse.modelData);
            setGeneratedCode(mockResponse.code);
            setActiveTab("visual");

            toast({
                title: "Using fallback data",
                description:
                    "Could not connect to API. Using sample data instead.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
            title: "Code copied",
            description:
                "The generated code has been copied to your clipboard.",
        });
    };

    const handleSaveModel = (format: string) => {
        // In a real app, this would trigger a download of the model in the specified format
        toast({
            title: `Model saved as ${format.toUpperCase()}`,
            description: `Your model has been exported in ${format.toUpperCase()} format.`,
        });
    };

    const handleZoom = (direction: "in" | "out") => {
        setViewerSettings((prev) => ({
            ...prev,
            zoom:
                direction === "in"
                    ? Math.min(prev.zoom + 0.2, 3)
                    : Math.max(prev.zoom - 0.2, 0.5),
        }));
    };

    // Mock function to generate model data based on prompt
    const generateMockModelData = (prompt: string) => {
        // This would be replaced with actual LLM-generated data
        return {
            rooms: [
                {
                    name: "living",
                    width: 5,
                    length: 7,
                    height: 3,
                    x: 0,
                    y: 0,
                    z: 0,
                    connected_to: ["kitchen", "hallway"],
                },
                {
                    name: "kitchen",
                    width: 4,
                    length: 4,
                    height: 3,
                    x: 5,
                    y: 0,
                    z: 0,
                    connected_to: ["living", "dining"],
                },
                {
                    name: "dining",
                    width: 4,
                    length: 5,
                    height: 3,
                    x: 5,
                    y: 4,
                    z: 0,
                    connected_to: ["kitchen"],
                },
                {
                    name: "hallway",
                    width: 2,
                    length: 5,
                    height: 3,
                    x: 0,
                    y: 7,
                    z: 0,
                    connected_to: [
                        "living",
                        "bedroom1",
                        "bedroom2",
                        "bathroom",
                    ],
                },
                {
                    name: "bedroom1",
                    width: 4,
                    length: 4,
                    height: 3,
                    x: -4,
                    y: 7,
                    z: 0,
                    connected_to: ["hallway"],
                },
                {
                    name: "bedroom2",
                    width: 4,
                    length: 4,
                    height: 3,
                    x: 2,
                    y: 7,
                    z: 0,
                    connected_to: ["hallway"],
                },
                {
                    name: "bathroom",
                    width: 3,
                    length: 2,
                    height: 3,
                    x: 0,
                    y: 12,
                    z: 0,
                    connected_to: ["hallway"],
                },
            ],
            windows: [
                {
                    room: "living",
                    wall: "south",
                    width: 2,
                    height: 1.5,
                    position: 0.5,
                },
                {
                    room: "kitchen",
                    wall: "east",
                    width: 1.5,
                    height: 1.2,
                    position: 0.7,
                },
                {
                    room: "bedroom1",
                    wall: "west",
                    width: 1.5,
                    height: 1.2,
                    position: 0.5,
                },
                {
                    room: "bedroom2",
                    wall: "east",
                    width: 1.5,
                    height: 1.2,
                    position: 0.5,
                },
            ],
            doors: [
                { from: "living", to: "kitchen", width: 1.2, height: 2.1 },
                { from: "living", to: "hallway", width: 1.2, height: 2.1 },
                { from: "kitchen", to: "dining", width: 1.2, height: 2.1 },
                { from: "hallway", to: "bedroom1", width: 0.9, height: 2.1 },
                { from: "hallway", to: "bedroom2", width: 0.9, height: 2.1 },
                { from: "hallway", to: "bathroom", width: 0.8, height: 2.1 },
            ],
        };
    };

    // Mock function to generate code based on prompt
    const generateMockCode = (prompt: string) => {
        return `// Generated Three.js code for: "${prompt}"
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Initialize scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Initialize camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

// Initialize renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Add controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Create rooms
function createRoom(name, width, length, height, x, y, z) {
  const geometry = new THREE.BoxGeometry(width, height, length);
  const edges = new THREE.EdgesGeometry(geometry);
  const material = new THREE.LineBasicMaterial({ color: 0x000000 });
  const wireframe = new THREE.LineSegments(edges, material);
  wireframe.position.set(x + width/2, y + height/2, z + length/2);
  scene.add(wireframe);
  
  // Add floor
  const floorGeometry = new THREE.PlaneGeometry(width, length);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc, 
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2;
  floor.position.set(x + width/2, 0.01, z + length/2);
  floor.receiveShadow = true;
  scene.add(floor);
  
  return { wireframe, floor };
}

// Create rooms
const livingRoom = createRoom("living", 5, 7, 3, 0, 0, 0);
const kitchen = createRoom("kitchen", 4, 4, 3, 5, 0, 0);
const dining = createRoom("dining", 4, 5, 3, 5, 0, 4);
const hallway = createRoom("hallway", 2, 5, 3, 0, 0, 7);
const bedroom1 = createRoom("bedroom1", 4, 4, 3, -4, 0, 7);
const bedroom2 = createRoom("bedroom2", 4, 4, 3, 2, 0, 7);
const bathroom = createRoom("bathroom", 3, 2, 3, 0, 0, 12);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});`;
    };

    const examplePrompts = [
        "Design a modern single-story house with an open floor plan, 3 bedrooms, 2 bathrooms, and a large kitchen island.",
        "Create an office space with 5 private offices, a conference room, open workspace, and a kitchen area.",
        "Generate a small retail store layout with display areas, fitting rooms, checkout counter, and storage room.",
        "Design a restaurant with seating for 60 people, a bar area, kitchen, and restrooms.",
    ];

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        CAD Model Generator
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Generate 3D CAD models from text descriptions using AI
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="prompt">Text Prompt</Label>
                                    <Textarea
                                        id="prompt"
                                        placeholder="Describe your building or space in detail..."
                                        className="min-h-[200px] resize-none"
                                        value={prompt}
                                        onChange={(e) =>
                                            setPrompt(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Example Prompts</Label>
                                    <div className="space-y-2">
                                        {examplePrompts.map(
                                            (example, index) => (
                                                <div
                                                    key={index}
                                                    className="text-sm p-2 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                                                    onClick={() =>
                                                        setPrompt(example)
                                                    }
                                                >
                                                    {example}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                <Button
                                    className="w-full gap-2"
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !prompt.trim()}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="h-4 w-4" />
                                            Generate CAD Model
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {generatedModel && (
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label>Visualization Settings</Label>

                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="show-grid"
                                                className="cursor-pointer"
                                            >
                                                Show Grid
                                            </Label>
                                            <Switch
                                                id="show-grid"
                                                checked={
                                                    viewerSettings.showGrid
                                                }
                                                onCheckedChange={(checked) =>
                                                    setViewerSettings(
                                                        (prev) => ({
                                                            ...prev,
                                                            showGrid: checked,
                                                        })
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="show-axes"
                                                className="cursor-pointer"
                                            >
                                                Show Axes
                                            </Label>
                                            <Switch
                                                id="show-axes"
                                                checked={
                                                    viewerSettings.showAxes
                                                }
                                                onCheckedChange={(checked) =>
                                                    setViewerSettings(
                                                        (prev) => ({
                                                            ...prev,
                                                            showAxes: checked,
                                                        })
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="wireframe"
                                                className="cursor-pointer"
                                            >
                                                Wireframe Mode
                                            </Label>
                                            <Switch
                                                id="wireframe"
                                                checked={
                                                    viewerSettings.wireframe
                                                }
                                                onCheckedChange={(checked) =>
                                                    setViewerSettings(
                                                        (prev) => ({
                                                            ...prev,
                                                            wireframe: checked,
                                                        })
                                                    )
                                                }
                                            />
                                        </div>

                                        <Separator className="my-2" />

                                        <div className="space-y-2">
                                            <Label>Background Color</Label>
                                            <Select
                                                value={
                                                    viewerSettings.backgroundColor
                                                }
                                                onValueChange={(value) =>
                                                    setViewerSettings(
                                                        (prev) => ({
                                                            ...prev,
                                                            backgroundColor:
                                                                value,
                                                        })
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select background color" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="#f0f0f0">
                                                        Light Gray
                                                    </SelectItem>
                                                    <SelectItem value="#ffffff">
                                                        White
                                                    </SelectItem>
                                                    <SelectItem value="#000000">
                                                        Black
                                                    </SelectItem>
                                                    <SelectItem value="#e6f7ff">
                                                        Sky Blue
                                                    </SelectItem>
                                                    <SelectItem value="#f0f9e8">
                                                        Mint Green
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Lighting</Label>
                                            <div className="grid grid-cols-4 gap-2">
                                                <Button
                                                    variant={
                                                        viewerSettings.lighting ===
                                                        "morning"
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    size="icon"
                                                    onClick={() =>
                                                        setViewerSettings(
                                                            (prev) => ({
                                                                ...prev,
                                                                lighting:
                                                                    "morning",
                                                            })
                                                        )
                                                    }
                                                    title="Morning Light"
                                                >
                                                    <Sunrise className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant={
                                                        viewerSettings.lighting ===
                                                        "day"
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    size="icon"
                                                    onClick={() =>
                                                        setViewerSettings(
                                                            (prev) => ({
                                                                ...prev,
                                                                lighting: "day",
                                                            })
                                                        )
                                                    }
                                                    title="Day Light"
                                                >
                                                    <Sun className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant={
                                                        viewerSettings.lighting ===
                                                        "evening"
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    size="icon"
                                                    onClick={() =>
                                                        setViewerSettings(
                                                            (prev) => ({
                                                                ...prev,
                                                                lighting:
                                                                    "evening",
                                                            })
                                                        )
                                                    }
                                                    title="Evening Light"
                                                >
                                                    <Sunset className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant={
                                                        viewerSettings.lighting ===
                                                        "night"
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    size="icon"
                                                    onClick={() =>
                                                        setViewerSettings(
                                                            (prev) => ({
                                                                ...prev,
                                                                lighting:
                                                                    "night",
                                                            })
                                                        )
                                                    }
                                                    title="Night Light"
                                                >
                                                    <Moon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <Separator className="my-2" />

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label>Zoom Level</Label>
                                                <span className="text-sm">
                                                    {viewerSettings.zoom.toFixed(
                                                        1
                                                    )}
                                                    x
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleZoom("out")
                                                    }
                                                    disabled={
                                                        viewerSettings.zoom <=
                                                        0.5
                                                    }
                                                >
                                                    <ZoomOut className="h-4 w-4" />
                                                </Button>
                                                <Slider
                                                    value={[
                                                        viewerSettings.zoom,
                                                    ]}
                                                    min={0.5}
                                                    max={3}
                                                    step={0.1}
                                                    onValueChange={(value) =>
                                                        setViewerSettings(
                                                            (prev) => ({
                                                                ...prev,
                                                                zoom: value[0],
                                                            })
                                                        )
                                                    }
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleZoom("in")
                                                    }
                                                    disabled={
                                                        viewerSettings.zoom >= 3
                                                    }
                                                >
                                                    <ZoomIn className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="h-full flex flex-col">
                            <CardContent className="p-0 flex-1">
                                <Tabs
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                    className="w-full h-full flex flex-col"
                                >
                                    <div className="flex justify-between items-center p-4 border-b">
                                        <h2 className="text-lg font-semibold">
                                            Generated Model
                                        </h2>
                                        <TabsList>
                                            <TabsTrigger value="visual">
                                                Visual
                                            </TabsTrigger>
                                            <TabsTrigger value="code">
                                                Code
                                            </TabsTrigger>
                                            <TabsTrigger value="json">
                                                JSON
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="flex-1 overflow-hidden">
                                        <TabsContent
                                            value="visual"
                                            className="h-full m-0 p-0"
                                        >
                                            {generatedModel ? (
                                                <div className="relative h-[700px]">
                                                    <CadModelViewer
                                                        modelData={
                                                            generatedModel
                                                        }
                                                        settings={
                                                            viewerSettings
                                                        }
                                                    />

                                                    <div className="absolute bottom-4 right-4 flex space-x-2">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                                                            onClick={() =>
                                                                handleSaveModel(
                                                                    "gltf"
                                                                )
                                                            }
                                                        >
                                                            <Save className="h-4 w-4" />
                                                            Save as GLTF
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                                                            onClick={() =>
                                                                handleSaveModel(
                                                                    "obj"
                                                                )
                                                            }
                                                        >
                                                            <Save className="h-4 w-4" />
                                                            Save as OBJ
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-[700px] flex items-center justify-center bg-muted/30">
                                                    <div className="text-center p-6">
                                                        <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                        <h3 className="text-lg font-medium mb-2">
                                                            No Model Generated
                                                            Yet
                                                        </h3>
                                                        <p className="text-muted-foreground max-w-md">
                                                            Enter a detailed
                                                            description of your
                                                            building or space
                                                            and click "Generate
                                                            CAD Model" to create
                                                            a 3D visualization.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent
                                            value="code"
                                            className="h-full m-0 p-0"
                                        >
                                            {generatedCode ? (
                                                <div className="relative h-[700px]">
                                                    <ScrollArea className="h-full">
                                                        <pre
                                                            ref={codeRef}
                                                            className="p-4 text-sm font-mono"
                                                        >
                                                            <code>
                                                                {generatedCode}
                                                            </code>
                                                        </pre>
                                                    </ScrollArea>

                                                    <div className="absolute top-4 right-4">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="gap-2"
                                                            onClick={
                                                                handleCopyCode
                                                            }
                                                        >
                                                            {copied ? (
                                                                <>
                                                                    <Check className="h-4 w-4" />
                                                                    Copied!
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="h-4 w-4" />
                                                                    Copy Code
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-[700px] flex items-center justify-center bg-muted/30">
                                                    <div className="text-center p-6">
                                                        <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                        <h3 className="text-lg font-medium mb-2">
                                                            No Code Generated
                                                            Yet
                                                        </h3>
                                                        <p className="text-muted-foreground max-w-md">
                                                            Generate a model
                                                            first to see the
                                                            corresponding
                                                            Three.js code.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent
                                            value="json"
                                            className="h-full m-0 p-0"
                                        >
                                            {generatedModel ? (
                                                <div className="relative h-[700px]">
                                                    <ScrollArea className="h-full">
                                                        <pre className="p-4 text-sm font-mono">
                                                            <code>
                                                                {JSON.stringify(
                                                                    generatedModel,
                                                                    null,
                                                                    2
                                                                )}
                                                            </code>
                                                        </pre>
                                                    </ScrollArea>

                                                    <div className="absolute top-4 right-4">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="gap-2"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(
                                                                    JSON.stringify(
                                                                        generatedModel,
                                                                        null,
                                                                        2
                                                                    )
                                                                );
                                                                toast({
                                                                    title: "JSON copied",
                                                                    description:
                                                                        "The model data has been copied to your clipboard.",
                                                                });
                                                            }}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                            Copy JSON
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-[700px] flex items-center justify-center bg-muted/30">
                                                    <div className="text-center p-6">
                                                        <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                        <h3 className="text-lg font-medium mb-2">
                                                            No JSON Generated
                                                            Yet
                                                        </h3>
                                                        <p className="text-muted-foreground max-w-md">
                                                            Generate a model
                                                            first to see the
                                                            structured JSON
                                                            data.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
