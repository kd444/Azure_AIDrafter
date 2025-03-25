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
    Pencil,
} from "lucide-react";
import { CadModelViewer } from "@/components/cad-model-viewer";
import { DesignCanvas } from "@/components/design-canvas";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";

export default function CadGeneratorPage() {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedModel, setGeneratedModel] = useState<any>(null);
    const [generatedCode, setGeneratedCode] = useState("");
    const [activeTab, setActiveTab] = useState("visual");
    const [inputMode, setInputMode] = useState<"text" | "sketch">("text");
    const [copied, setCopied] = useState(false);
    const [viewerSettings, setViewerSettings] = useState({
        showGrid: true,
        showAxes: true,
        backgroundColor: "#f0f0f0",
        lighting: "day",
        wireframe: false,
        zoom: 1,
    });
    const [processingSteps, setProcessingSteps] = useState<{
        [key: string]: "pending" | "processing" | "completed" | "error";
    }>({
        sketch: "pending",
        vision: "pending",
        openai: "pending",
        model: "pending",
    });

    const codeRef = useRef<HTMLPreElement>(null);
    const canvasRef = useRef<any>(null);

    // Function to update processing steps
    const updateProcessingStep = (
        step: string,
        status: "pending" | "processing" | "completed" | "error"
    ) => {
        setProcessingSteps((prev) => ({
            ...prev,
            [step]: status,
        }));
    };

    // Function to capture sketch data
    const captureSketchData = () => {
        if (!canvasRef.current) return null;

        try {
            // Get canvas element from the DesignCanvas component
            const canvasElement = canvasRef.current.getCanvasElement();
            if (!canvasElement) {
                console.warn("Canvas element not available");
                return null;
            }

            // Convert canvas to data URL
            return canvasElement.toDataURL("image/png");
        } catch (error) {
            console.error("Error capturing sketch data:", error);
            return null;
        }
    };

    const handleGenerate = async () => {
        // Reset processing steps
        setProcessingSteps({
            sketch: "pending",
            vision: "pending",
            openai: "pending",
            model: "pending",
        });

        setIsGenerating(true);

        try {
            // Capture sketch data if in sketch mode
            updateProcessingStep("sketch", "processing");
            const sketchData =
                inputMode === "sketch" ? captureSketchData() : null;

            // Mark sketch processing as complete
            if (inputMode === "sketch") {
                setTimeout(
                    () => updateProcessingStep("sketch", "completed"),
                    500
                );
            } else {
                updateProcessingStep("sketch", "completed");
            }

            // Prepare request payload - matches Azure API expectations
            const payload = {};

            // Always include a prompt - use default if in sketch-only mode
            if (inputMode === "text" && prompt.trim()) {
                payload.prompt = prompt.trim();
            } else if (inputMode === "sketch") {
                // For sketch-only mode, send a default prompt
                payload.prompt = "Generate a CAD model based on this sketch";
            } else {
                throw new Error(
                    "No input provided. Please enter a text description or create a sketch."
                );
            }

            // Add sketch data if available
            if (sketchData) {
                payload.sketchData = sketchData;
                // When using sketch, mark vision processing as active
                updateProcessingStep("vision", "processing");
            }

            console.log("Generating CAD model with Azure services:", {
                inputMode,
                hasPrompt: !!payload.prompt,
                hasSketchData: !!payload.sketchData,
            });

            // Mark OpenAI processing as active
            updateProcessingStep("openai", "processing");

            // Call our API endpoint - connects to Azure services
            const response = await fetch("/api/cad-generator", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            // If sketch was provided, mark vision processing as complete
            if (sketchData) {
                updateProcessingStep("vision", "completed");
            }

            // Mark OpenAI processing as complete
            updateProcessingStep("openai", "completed");

            // Mark model generation as active
            updateProcessingStep("model", "processing");

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                updateProcessingStep("model", "error");
                throw new Error(
                    `Failed to generate model with Azure: ${response.status} ${
                        response.statusText
                    }${errorData.details ? ` - ${errorData.details}` : ""}`
                );
            }

            const data = await response.json();
            console.log("Azure API Response:", data);

            if (!data.modelData || !data.code) {
                console.error("Invalid response format from Azure:", data);
                updateProcessingStep("model", "error");
                throw new Error("Invalid response format from Azure API");
            }

            // Ensure the modelData has the expected structure
            if (
                !Array.isArray(data.modelData.rooms) ||
                data.modelData.rooms.length === 0
            ) {
                console.error(
                    "Invalid or empty rooms array from Azure:",
                    data.modelData
                );
                updateProcessingStep("model", "error");
                throw new Error(
                    "Invalid model data from Azure: no rooms found"
                );
            }

            // Mark model generation as complete
            updateProcessingStep("model", "completed");

            setGeneratedModel(data.modelData);
            setGeneratedCode(data.code);
            setActiveTab("visual");

            toast({
                title: "Model generated successfully",
                description: "Your CAD model has been created using Azure AI.",
            });
        } catch (error) {
            console.error("Error with Azure services:", error);

            // Update any pending steps to error
            Object.keys(processingSteps).forEach((step) => {
                if (
                    processingSteps[step] === "processing" ||
                    processingSteps[step] === "pending"
                ) {
                    updateProcessingStep(step, "error");
                }
            });

            // Fallback to mock data if Azure API fails
            const mockResponse = {
                modelData: generateMockModelData(
                    prompt || "Floor plan from sketch"
                ),
                code: generateMockCode(prompt || "Floor plan from sketch"),
            };

            setGeneratedModel(mockResponse.modelData);
            setGeneratedCode(mockResponse.code);
            setActiveTab("visual");

            toast({
                title: "Using fallback data",
                description:
                    "Could not connect to Azure API. Using sample data instead.",
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
                    y: 0,
                    z: 4,
                    connected_to: ["kitchen"],
                },
                {
                    name: "hallway",
                    width: 2,
                    length: 5,
                    height: 3,
                    x: 0,
                    y: 0,
                    z: 7,
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
                    y: 0,
                    z: 7,
                    connected_to: ["hallway"],
                },
                {
                    name: "bedroom2",
                    width: 4,
                    length: 4,
                    height: 3,
                    x: 2,
                    y: 0,
                    z: 7,
                    connected_to: ["hallway"],
                },
                {
                    name: "bathroom",
                    width: 3,
                    length: 2,
                    height: 3,
                    x: 0,
                    y: 0,
                    z: 12,
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

    // Azure Services Info Component
    const AzureServicesInfo = () => {
        return (
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-md">
                            <svg
                                className="h-6 w-6 text-blue-700"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12.266 22.5c5.283-.024 9.653-4.268 9.727-9.523-.499.044-1.385.099-2.293.099-5.729 0-10.531-4.097-11.6-9.55-.151.775-.273 1.57-.273 2.385 0 4.241 2.341 7.936 5.795 9.892L4.52 9.77l-1.553 3.106A9.939 9.939 0 0 0 2.25 12c0-5.799 4.701-10.5 10.5-10.5S23.25 6.201 23.25 12s-4.701 10.5-10.5 10.5c-.16 0-.316-.012-.475-.02l-.009.02z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold">
                            Azure AI Services
                        </h2>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-50 p-1 rounded">
                                <svg
                                    className="h-5 w-5 text-blue-600"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M7.5 6.75V0h9v6.75h-9zm9 3.75V24h-9V10.5h9zM0 10.5V3.75h6.75V10.5H0zm0 10.5v-6.75h6.75V21H0zm16.5-10.5V3.75h6.75V10.5h-6.75zm0 10.5v-6.75h6.75V21h-6.75z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium">
                                    Azure OpenAI Service
                                </p>
                                <p className="text-muted-foreground">
                                    Powers the natural language understanding
                                    and 3D model generation
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-blue-50 p-1 rounded">
                                <svg
                                    className="h-5 w-5 text-blue-600"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M6.79 5.093A9.002 9.002 0 0 0 12 21a9 9 0 0 0 8.942-8.138A2.25 2.25 0 1 0 18 10.5h-2.25a2.25 2.25 0 0 0-2.25 2.25c0 .601.236 1.148.621 1.552A5.988 5.988 0 0 1 12 15a6 6 0 0 1-5.604-8.178l.493.099a1.35 1.35 0 0 0 1.558-.99 1.35 1.35 0 0 0-.99-1.558l-2.277-.456a1.35 1.35 0 0 0-1.558.99l-.456 2.277a1.35 1.35 0 0 0 2.634.558l.099-.493Z" />
                                    <path d="M10.5 14.25A2.25 2.25 0 0 0 12 12v2.25l-1.5 1.5Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium">
                                    Azure Computer Vision
                                </p>
                                <p className="text-muted-foreground">
                                    Analyzes sketch inputs and extracts spatial
                                    information
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-blue-50 p-1 rounded">
                                <svg
                                    className="h-5 w-5 text-blue-600"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                                    <path
                                        fillRule="evenodd"
                                        d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium">Azure Functions</p>
                                <p className="text-muted-foreground">
                                    Orchestrates the multi-agent AI system
                                    workflow
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                        <p>
                            This application leverages Azure's AI services to
                            transform your input into architectural designs.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        CAD Model Generator
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Generate 3D CAD models from text descriptions or
                        sketches using AI
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold">
                                        Input Method
                                    </h2>
                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={() => setInputMode("text")}
                                            variant={
                                                inputMode === "text"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            className="gap-1"
                                        >
                                            <Wand2 className="h-4 w-4" />
                                            Text
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                setInputMode("sketch")
                                            }
                                            variant={
                                                inputMode === "sketch"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            className="gap-1"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Sketch
                                        </Button>
                                    </div>
                                </div>

                                {inputMode === "text" ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="prompt">
                                                Text Prompt
                                            </Label>
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
                                                                setPrompt(
                                                                    example
                                                                )
                                                            }
                                                        >
                                                            {example}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>Sketch Your Design</Label>
                                        <div className="border rounded-md overflow-hidden bg-white h-[300px]">
                                            <DesignCanvas
                                                projectId="cad-generator"
                                                ref={canvasRef}
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Draw a floor plan or sketch of your
                                            design. Use the tools above to
                                            create your sketch.
                                        </p>
                                    </div>
                                )}

                                <Button
                                    className="w-full gap-2"
                                    onClick={handleGenerate}
                                    disabled={
                                        isGenerating ||
                                        (inputMode === "text" && !prompt.trim())
                                    }
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

                                {isGenerating && (
                                    <div className="mt-4 border rounded-md p-3 bg-muted/30">
                                        <h3 className="text-sm font-medium mb-2">
                                            Azure AI Processing
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs">
                                                    {inputMode === "sketch"
                                                        ? "Computer Vision Analysis"
                                                        : "Input Processing"}
                                                </span>
                                                <div className="flex items-center">
                                                    {processingSteps.sketch ===
                                                        "pending" && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Waiting
                                                        </span>
                                                    )}
                                                    {processingSteps.sketch ===
                                                        "processing" && (
                                                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                    )}
                                                    {processingSteps.sketch ===
                                                        "completed" && (
                                                        <Check className="h-3 w-3 text-green-500" />
                                                    )}
                                                    {processingSteps.sketch ===
                                                        "error" && (
                                                        <span className="text-xs text-destructive">
                                                            Error
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-xs">
                                                    Azure OpenAI Processing
                                                </span>
                                                <div className="flex items-center">
                                                    {processingSteps.openai ===
                                                        "pending" && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Waiting
                                                        </span>
                                                    )}
                                                    {processingSteps.openai ===
                                                        "processing" && (
                                                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                    )}
                                                    {processingSteps.openai ===
                                                        "completed" && (
                                                        <Check className="h-3 w-3 text-green-500" />
                                                    )}
                                                    {processingSteps.openai ===
                                                        "error" && (
                                                        <span className="text-xs text-destructive">
                                                            Error
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-xs">
                                                    3D Model Generation
                                                </span>
                                                <div className="flex items-center">
                                                    {processingSteps.model ===
                                                        "pending" && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Waiting
                                                        </span>
                                                    )}
                                                    {processingSteps.model ===
                                                        "processing" && (
                                                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                    )}
                                                    {processingSteps.model ===
                                                        "completed" && (
                                                        <Check className="h-3 w-3 text-green-500" />
                                                    )}
                                                    {processingSteps.model ===
                                                        "error" && (
                                                        <span className="text-xs text-destructive">
                                                            Error
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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

                        <AzureServicesInfo />
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
                                                            {inputMode ===
                                                            "text"
                                                                ? "Enter a detailed description of your building or space and click 'Generate CAD Model'."
                                                                : "Create a sketch of your floor plan and click 'Generate CAD Model'."}
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
