"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    Wand2,
    Mic,
    Camera,
    Pencil,
    Loader2,
    Square,
    Trash,
    Check,
    X,
    Maximize2,
    Info,
    HelpCircle,
    Upload,
} from "lucide-react";
import { DesignCanvas } from "@/components/design-canvas";
import { toast } from "@/components/ui/use-toast";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface InputPanelProps {
    onGenerateModel: (inputs: {
        prompt: string;
        sketchData: string | null;
        speechData: string | null;
        photoData: string | null;
    }) => void;
    isGenerating: boolean;
}

export function InputPanel({ onGenerateModel, isGenerating }: InputPanelProps) {
    // Input state
    const [textPrompt, setTextPrompt] = useState("");
    const [speechTranscript, setSpeechTranscript] = useState("");
    const [photoData, setPhotoData] = useState<string | null>(null);

    // Active tab state
    const [activeTab, setActiveTab] = useState<
        "text" | "sketch" | "speech" | "photo"
    >("text");

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Camera state
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Sketch state
    const canvasRef = useRef<any>(null);

    // Cleanup recording timer on unmount
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Text prompt handlers
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextPrompt(e.target.value);
    };

    // Speech recording handlers
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/wav",
                });
                await processAudioRecording(audioBlob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

            toast({
                title: "Recording started",
                description:
                    "Speak clearly to describe your architectural design requirements.",
            });
        } catch (error) {
            console.error("Error starting recording:", error);
            toast({
                title: "Recording failed",
                description:
                    "Could not access microphone. Please check permissions.",
                variant: "destructive",
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Clear timer
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
    };

    const processAudioRecording = async (audioBlob: Blob) => {
        try {
            // Prepare form data
            const formData = new FormData();
            formData.append("audio", audioBlob);

            // Call speech-to-text API
            const response = await fetch("/api/speech-to-text", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to process speech");
            }

            const data = await response.json();
            setSpeechTranscript(data.text);

            toast({
                title: "Speech processed",
                description: "Your speech has been converted to text.",
            });
        } catch (error) {
            console.error("Error processing speech:", error);
            toast({
                title: "Speech processing failed",
                description:
                    "Could not convert audio to text. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Camera handlers
    const activateCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setIsCameraActive(true);
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            toast({
                title: "Camera activation failed",
                description:
                    "Could not access camera. Please check permissions.",
                variant: "destructive",
            });
        }
    };

    const deactivateCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !isCameraActive) return;

        try {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(
                    videoRef.current,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
                const dataUrl = canvas.toDataURL("image/png");
                setPhotoData(dataUrl);
                deactivateCamera();

                toast({
                    title: "Photo captured",
                    description:
                        "Your space photo has been captured for analysis.",
                });
            }
        } catch (error) {
            console.error("Error capturing photo:", error);
            toast({
                title: "Photo capture failed",
                description: "Could not capture photo. Please try again.",
                variant: "destructive",
            });
        }
    };

    const clearPhoto = () => {
        setPhotoData(null);
    };

    // File upload handlers
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImageFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith("image/")) {
                processImageFile(file);
            } else {
                toast({
                    title: "Invalid file type",
                    description: "Please upload an image file (JPG, PNG, etc.)",
                    variant: "destructive",
                });
            }
        }
    };

    const processImageFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setPhotoData(e.target.result as string);
                toast({
                    title: "Image loaded",
                    description:
                        "Your floor plan image has been loaded for analysis.",
                });
            }
        };
        reader.readAsDataURL(file);
    };

    // Sketch capture
    const captureSketchData = (): string | null => {
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

    const clearSketch = () => {
        if (canvasRef.current) {
            canvasRef.current.clearCanvas();
        }
    };

    // Form submission
    const handleSubmit = () => {
        const sketchData = activeTab === "sketch" ? captureSketchData() : null;

        // Ensure at least one input is provided
        if (!textPrompt && !sketchData && !speechTranscript && !photoData) {
            toast({
                title: "No input provided",
                description:
                    "Please provide at least one input (text, sketch, speech, or photo).",
                variant: "destructive",
            });
            return;
        }

        // Call the parent function with all inputs
        onGenerateModel({
            prompt: textPrompt || speechTranscript || "", // Use speech transcript as fallback if no text
            sketchData,
            speechData: speechTranscript || null,
            photoData,
        });
    };

    // Format time for recording display
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${
            remainingSeconds < 10 ? "0" : ""
        }${remainingSeconds}`;
    };

    // Example prompts
    const examplePrompts = [
        "Design a modern single-story house with an open floor plan, 3 bedrooms, 2 bathrooms, and a large kitchen island.",
        "Create an office space with 5 private offices, a conference room, open workspace, and a kitchen area.",
        "Generate a small retail store layout with display areas, fitting rooms, checkout counter, and storage room.",
        "Design a restaurant with seating for 60 people, a bar area, kitchen, and restrooms.",
    ];

    const handleExampleClick = (example: string) => {
        setTextPrompt(example);
        setActiveTab("text");
    };

    // Input method help content
    const inputMethodHelp = {
        text: "Describe your building or space in detail. Include room types, dimensions, layout preferences, and any special features.",
        sketch: "Draw a floor plan or sketch of your design. Use the drawing tools to create walls, doors, windows, and other elements.",
        speech: "Speak clearly and describe your building requirements in detail. Include room types, dimensions, layout preferences, and any special features.",
        photo: "Take a photo of an existing space for reference or inspiration. Our AI will analyze the architectural elements and incorporate them into the design.",
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="py-3 px-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-medium">
                        Design Input
                    </CardTitle>
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as any)}
                        className="h-8"
                    >
                        <TabsList className="h-8">
                            <TabsTrigger
                                value="text"
                                className="h-8 px-2 text-xs"
                            >
                                <Wand2 className="h-3.5 w-3.5 mr-1" />
                                <span>Text</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="sketch"
                                className="h-8 px-2 text-xs"
                            >
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                <span>Sketch</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="speech"
                                className="h-8 px-2 text-xs"
                            >
                                <Mic className="h-3.5 w-3.5 mr-1" />
                                <span>Voice</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="photo"
                                className="h-8 px-2 text-xs"
                            >
                                <Camera className="h-3.5 w-3.5 mr-1" />
                                <span>Photo</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-auto">
                <div className="p-4 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                            <h3 className="text-sm font-medium">
                                {activeTab === "text" && "Text Description"}
                                {activeTab === "sketch" && "Floor Plan Sketch"}
                                {activeTab === "speech" && "Voice Description"}
                                {activeTab === "photo" && "Space Photo"}
                            </h3>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                    >
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs text-xs">
                                        {inputMethodHelp[activeTab]}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Text Input */}
                    {activeTab === "text" && (
                        <div className="space-y-4 flex-grow flex flex-col">
                            <Textarea
                                placeholder="Describe your building or space in detail..."
                                className="flex-grow resize-none min-h-[200px]"
                                value={textPrompt}
                                onChange={handleTextChange}
                            />

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">
                                        Example Prompts
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                            >
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-sm">
                                                    Tips for Good Prompts
                                                </h4>
                                                <ul className="text-xs space-y-1 list-disc pl-4">
                                                    <li>
                                                        Be specific about room
                                                        types and dimensions
                                                    </li>
                                                    <li>
                                                        Describe the layout and
                                                        connections between
                                                        spaces
                                                    </li>
                                                    <li>
                                                        Mention architectural
                                                        style preferences
                                                    </li>
                                                    <li>
                                                        Include special features
                                                        like windows, doors, or
                                                        furniture
                                                    </li>
                                                </ul>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {examplePrompts.map((example, index) => (
                                        <div
                                            key={index}
                                            className="text-sm p-2 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                                            onClick={() =>
                                                handleExampleClick(example)
                                            }
                                        >
                                            {example}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sketch Input */}
                    {activeTab === "sketch" && (
                        <div className="space-y-4 flex-grow flex flex-col">
                            <div className="flex justify-end items-center gap-2 mb-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (canvasRef.current) {
                                            const canvasElement =
                                                canvasRef.current.getCanvasElement();
                                            if (
                                                canvasElement &&
                                                canvasElement.parentElement
                                            ) {
                                                canvasElement.parentElement.requestFullscreen();
                                            }
                                        }
                                    }}
                                    className="h-7 text-xs"
                                >
                                    <Maximize2 className="h-3.5 w-3.5 mr-1" />
                                    Fullscreen
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearSketch}
                                    className="h-7 text-xs"
                                >
                                    <Trash className="h-3.5 w-3.5 mr-1" />
                                    Clear
                                </Button>
                            </div>
                            <div className="border rounded-md overflow-hidden bg-white flex-grow min-h-[300px]">
                                <DesignCanvas
                                    projectId="multimodal-input"
                                    ref={canvasRef}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Draw a floor plan or sketch of your design. Use
                                the tools above to create walls, doors, windows,
                                and other elements.
                            </p>
                        </div>
                    )}

                    {/* Speech Input */}
                    {activeTab === "speech" && (
                        <div className="space-y-4 flex-grow flex flex-col">
                            <div className="flex justify-end items-center">
                                {!isRecording ? (
                                    <Button
                                        onClick={startRecording}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        disabled={isRecording}
                                    >
                                        <Mic className="h-3.5 w-3.5 mr-1" />
                                        Start Recording
                                    </Button>
                                ) : (
                                    <div className="flex gap-2 items-center">
                                        <div className="text-sm text-red-500 animate-pulse flex items-center">
                                            <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                                            Recording:{" "}
                                            {formatTime(recordingTime)}
                                        </div>
                                        <Button
                                            onClick={stopRecording}
                                            variant="destructive"
                                            size="sm"
                                            className="h-7 text-xs"
                                        >
                                            <Square className="h-3.5 w-3.5 mr-1" />
                                            Stop
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {speechTranscript ? (
                                <div className="relative border rounded-md p-3 bg-muted/30 flex-grow">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-5 w-5"
                                        onClick={() => setSpeechTranscript("")}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                    <Label className="text-xs font-medium">
                                        Transcribed Speech:
                                    </Label>
                                    <p className="mt-1 text-sm overflow-auto max-h-[200px]">
                                        {speechTranscript}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-[200px] border rounded-md flex-grow">
                                    <p className="text-sm text-muted-foreground">
                                        {isRecording
                                            ? "Listening..."
                                            : "Click 'Start Recording' and describe your architectural requirements"}
                                    </p>
                                </div>
                            )}

                            <p className="text-xs text-muted-foreground">
                                Speak clearly and describe your building
                                requirements in detail. Include room types,
                                dimensions, layout preferences, and any special
                                features.
                            </p>
                        </div>
                    )}

                    {/* Photo Input */}
                    {activeTab === "photo" && (
                        <div className="space-y-4 flex-grow flex flex-col">
                            <div className="flex justify-end items-center gap-2">
                                {!isCameraActive && !photoData && (
                                    <>
                                        <Button
                                            onClick={activateCamera}
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                        >
                                            <Camera className="h-3.5 w-3.5 mr-1" />
                                            Use Camera
                                        </Button>
                                        <label
                                            htmlFor="floor-plan-upload"
                                            className="cursor-pointer"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs"
                                                type="button"
                                            >
                                                <Upload className="h-3.5 w-3.5 mr-1" />
                                                Upload Image
                                            </Button>
                                            <input
                                                id="floor-plan-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                            />
                                        </label>
                                    </>
                                )}
                                {isCameraActive && (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={capturePhoto}
                                            variant="default"
                                            size="sm"
                                            className="h-7 text-xs"
                                        >
                                            <Camera className="h-3.5 w-3.5 mr-1" />
                                            Capture
                                        </Button>
                                        <Button
                                            onClick={deactivateCamera}
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                                {photoData && (
                                    <Button
                                        onClick={clearPhoto}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                    >
                                        <Trash className="h-3.5 w-3.5 mr-1" />
                                        Clear Image
                                    </Button>
                                )}
                            </div>

                            <div
                                className={`relative border rounded-md overflow-hidden bg-black flex-grow min-h-[300px] flex items-center justify-center ${
                                    !photoData && !isCameraActive
                                        ? "border-dashed"
                                        : ""
                                }`}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                {isCameraActive && (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="max-h-full max-w-full object-contain"
                                    />
                                )}
                                {photoData && (
                                    <img
                                        src={photoData || "/placeholder.svg"}
                                        alt="Floor plan"
                                        className="max-h-full max-w-full object-contain"
                                    />
                                )}
                                {!isCameraActive && !photoData && (
                                    <div className="text-center p-6 text-white/70">
                                        <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm mb-1">
                                            Drag and drop a floor plan image
                                            here
                                        </p>
                                        <p className="text-xs opacity-70">
                                            or use the upload/camera buttons
                                            above
                                        </p>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Upload an existing floor plan image or take a
                                photo. The AI will analyze the layout and
                                generate a 3D model.
                            </p>
                        </div>
                    )}

                    <Separator className="my-4" />

                    {/* Input summary and submit button */}
                    <div className="mt-auto">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {textPrompt && (
                                <div className="bg-primary/10 text-xs py-1 px-2 rounded-full flex items-center">
                                    <Wand2 className="h-3 w-3 mr-1" />
                                    <span>Text Input</span>
                                    <Check className="h-3 w-3 ml-1 text-green-600" />
                                </div>
                            )}
                            {activeTab === "sketch" && (
                                <div className="bg-primary/10 text-xs py-1 px-2 rounded-full flex items-center">
                                    <Pencil className="h-3 w-3 mr-1" />
                                    <span>Sketch Input</span>
                                    <Check className="h-3 w-3 ml-1 text-green-600" />
                                </div>
                            )}
                            {speechTranscript && (
                                <div className="bg-primary/10 text-xs py-1 px-2 rounded-full flex items-center">
                                    <Mic className="h-3 w-3 mr-1" />
                                    <span>Voice Input</span>
                                    <Check className="h-3 w-3 ml-1 text-green-600" />
                                </div>
                            )}
                            {photoData && (
                                <div className="bg-primary/10 text-xs py-1 px-2 rounded-full flex items-center">
                                    <Camera className="h-3 w-3 mr-1" />
                                    <span>Photo Input</span>
                                    <Check className="h-3 w-3 ml-1 text-green-600" />
                                </div>
                            )}
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={
                                isGenerating ||
                                (!textPrompt &&
                                    !speechTranscript &&
                                    activeTab !== "sketch" &&
                                    !photoData)
                            }
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating Model...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="h-4 w-4 mr-2" />
                                    Generate CAD Model
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
