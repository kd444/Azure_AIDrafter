import { AzureOpenAI } from "openai";
import {
    SpeechConfig,
    AudioConfig,
    SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { ApiKeyCredentials } from "@azure/ms-rest-js";
import { ContentModeratorClient } from "@azure/cognitiveservices-contentmoderator";

// Import existing sketch analysis functionality
import { analyzeSketch } from "./azure-service";

// Import Azure configurations
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY || "";
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || "";
const AZURE_OPENAI_DEPLOYMENT =
    process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-35-turbo";
const AZURE_OPENAI_API_VERSION =
    process.env.AZURE_OPENAI_API_VERSION || "2023-12-01-preview";

const AZURE_VISION_KEY = process.env.AZURE_VISION_KEY || "";
const AZURE_VISION_ENDPOINT = process.env.AZURE_VISION_ENDPOINT || "";

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY || "";
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || "eastus";

const AZURE_CONTENT_MODERATOR_KEY =
    process.env.AZURE_CONTENT_MODERATOR_KEY || "";
const AZURE_CONTENT_MODERATOR_ENDPOINT =
    process.env.AZURE_CONTENT_MODERATOR_ENDPOINT || "";

export class MultimodalProcessor {
    private openAIClient: AzureOpenAI;
    private visionClient: ComputerVisionClient;
    private moderationClient: ContentModerationClient | null = null;
    private speechConfig: SpeechConfig | null = null;

    constructor() {
        // Initialize Azure OpenAI client
        this.openAIClient = new AzureOpenAI({
            apiKey: AZURE_OPENAI_KEY,
            apiVersion: AZURE_OPENAI_API_VERSION,
            endpoint: AZURE_OPENAI_ENDPOINT,
        });

        // Initialize Computer Vision client
        const visionCredentials = new ApiKeyCredentials({
            inHeader: { "Ocp-Apim-Subscription-Key": AZURE_VISION_KEY },
        });
        this.visionClient = new ComputerVisionClient(
            visionCredentials,
            AZURE_VISION_ENDPOINT
        );

        // Initialize Content Moderation client if keys are available
        if (AZURE_CONTENT_MODERATOR_KEY && AZURE_CONTENT_MODERATOR_ENDPOINT) {
            this.moderationClient = new ContentModerationClient(
                AZURE_CONTENT_MODERATOR_ENDPOINT,
                new ApiKeyCredentials({
                    inHeader: {
                        "Ocp-Apim-Subscription-Key":
                            AZURE_CONTENT_MODERATOR_KEY,
                    },
                })
            );
        }

        // Initialize Speech Service if key is available
        if (AZURE_SPEECH_KEY && AZURE_SPEECH_REGION) {
            this.speechConfig = SpeechConfig.fromSubscription(
                AZURE_SPEECH_KEY,
                AZURE_SPEECH_REGION
            );
        }
    }

    async processMultimodalInput(inputs: {
        text?: string;
        sketch?: string;
        speech?: string;
        photo?: string;
    }): Promise<any> {
        console.log("Processing multimodal input with Azure AI services");

        // Use Responsible AI tools to validate inputs if available
        if (this.moderationClient) {
            await this.validateInputsWithResponsibleAI(inputs);
        }

        // Process sketch with Computer Vision (if provided)
        let sketchAnalysis = null;
        if (inputs.sketch) {
            try {
                sketchAnalysis = await analyzeSketch(inputs.sketch);
            } catch (error) {
                console.error("Error in sketch analysis:", error);
                // Continue with other modalities if one fails
            }
        }

        // Process photo of real building/space (if provided)
        let photoAnalysis = null;
        if (inputs.photo) {
            try {
                photoAnalysis = await this.processPhoto(inputs.photo);
            } catch (error) {
                console.error("Error in photo analysis:", error);
                // Continue with other modalities if one fails
            }
        }

        // Create a unified analysis by combining all input modalities
        const unifiedAnalysis = await this.combineInputsWithGPT4V({
            text: inputs.text || "",
            speechText: inputs.speech || "",
            sketchAnalysis,
            photoAnalysis,
        });

        return unifiedAnalysis;
    }

    private async validateInputsWithResponsibleAI(inputs: any): Promise<void> {
        if (!this.moderationClient) return;

        // Apply content moderation to text inputs
        if (inputs.text) {
            try {
                const textScreen =
                    await this.moderationClient.textModeration.screenText(
                        "text/plain",
                        Buffer.from(inputs.text),
                        { classify: true }
                    );

                // Check for inappropriate content
                if (textScreen.classification?.reviewRecommended) {
                    throw new Error(
                        "Input contains potentially inappropriate content."
                    );
                }
            } catch (error) {
                console.error("Error in content moderation:", error);
                // Continue with caution if moderation fails
            }
        }

        // Could add image moderation here for sketch/photo if needed
    }

    private async processPhoto(photoDataUrl: string): Promise<any> {
        try {
            // Process real-world photo using specialized analysis
            const base64Image = photoDataUrl.replace(
                /^data:image\/\w+;base64,/,
                ""
            );

            // Analyze with Computer Vision
            const result = await this.visionClient.analyzeImageInStream(
                Buffer.from(base64Image, "base64"),
                {
                    visualFeatures: [
                        "Objects",
                        "Tags",
                        "Categories",
                        "Description",
                    ],
                    details: ["Landmarks"],
                }
            );

            // Extract architectural features from the photo
            return {
                description:
                    result.description?.captions?.[0]?.text ||
                    "No description available",
                objects: result.objects || [],
                tags: result.tags || [],
                landmarks:
                    result.categories?.filter(
                        (c) => c.detail?.landmarks?.length > 0
                    ) || [],
                architecturalFeatures:
                    this.extractArchitecturalFeatures(result),
            };
        } catch (error) {
            console.error("Error in photo analysis:", error);
            throw new Error(
                `Photo analysis failed: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }

    private extractArchitecturalFeatures(visionResult: any): any {
        // Extract architectural features from photo analysis
        const architecturalFeatures = {
            buildingElements: [],
            estimatedDimensions: null,
            style: "unknown",
        };

        // Extract building elements from tags
        const architecturalTags = [
            "building",
            "wall",
            "ceiling",
            "floor",
            "door",
            "window",
            "column",
            "arch",
            "stairs",
            "balcony",
            "facade",
        ];

        if (visionResult.tags) {
            architecturalFeatures.buildingElements = visionResult.tags
                .filter((tag: any) =>
                    architecturalTags.includes(tag.name.toLowerCase())
                )
                .map((tag: any) => ({
                    element: tag.name,
                    confidence: tag.confidence,
                }));
        }

        // Try to identify architectural style
        const styleKeywords = {
            modern: ["modern", "contemporary", "minimalist"],
            classical: ["classical", "column", "symmetrical", "ornate"],
            victorian: ["victorian", "ornate", "detailed"],
            industrial: ["industrial", "exposed", "brick", "metal", "concrete"],
            traditional: ["traditional", "conventional"],
        };

        if (visionResult.tags) {
            for (const [style, keywords] of Object.entries(styleKeywords)) {
                const hasStyleKeywords = keywords.some((keyword) =>
                    visionResult.tags.some((tag: any) =>
                        tag.name.toLowerCase().includes(keyword)
                    )
                );

                if (hasStyleKeywords) {
                    architecturalFeatures.style = style;
                    break;
                }
            }
        }

        return architecturalFeatures;
    }

    private async combineInputsWithGPT4V(inputs: any): Promise<any> {
        try {
            // Prepare system message
            const systemPrompt =
                "You are an architectural AI assistant that interprets multiple types of input to create " +
                "detailed building specifications. Analyze all provided inputs (text descriptions, speech input, " +
                "sketch analysis, photo analysis) and create a unified architectural model. " +
                "Your output should follow the exact format required for the CAD generation system.";

            // Prepare user message combining all input modalities
            let userMessage =
                "Please analyze these inputs and create a detailed architectural specification:\n\n";

            // Add text input if available
            if (inputs.text) {
                userMessage += `TEXT DESCRIPTION:\n${inputs.text}\n\n`;
            }

            // Add speech-to-text input if available
            if (inputs.speechText) {
                userMessage += `VOICE INPUT:\n${inputs.speechText}\n\n`;
            }

            // Add sketch analysis if available
            if (inputs.sketchAnalysis) {
                userMessage += `SKETCH ANALYSIS:\n${JSON.stringify(
                    inputs.sketchAnalysis,
                    null,
                    2
                )}\n\n`;
            }

            // Add photo analysis if available
            if (inputs.photoAnalysis) {
                userMessage += `PHOTO ANALYSIS:\n${JSON.stringify(
                    inputs.photoAnalysis,
                    null,
                    2
                )}\n\n`;
            }

            userMessage +=
                "Based on all these inputs, create a complete architectural specification that follows this structure:\n" +
                "{\n" +
                '  "rooms": [\n' +
                "    {\n" +
                '      "name": "string",\n' +
                '      "width": number,\n' +
                '      "length": number,\n' +
                '      "height": number,\n' +
                '      "x": number,\n' +
                '      "y": number,\n' +
                '      "z": number,\n' +
                '      "connected_to": ["string"]\n' +
                "    }\n" +
                "  ],\n" +
                '  "windows": [...],\n' +
                '  "doors": [...]\n' +
                "}";

            // Call Azure OpenAI
            const response = await this.openAIClient.chat.completions.create({
                model: AZURE_OPENAI_DEPLOYMENT,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage },
                ],
                temperature: 0.2,
                max_tokens: 4000,
            });

            // Extract the model data from the response
            const content = response.choices[0].message?.content || "";
            const modelData = this.extractModelData(content);

            // Analyze the unified model for metadata and insights
            const metadata = this.extractModelMetadata(modelData, inputs);

            return {
                modelData,
                metadata,
                rawResponse: content,
            };
        } catch (error) {
            console.error("Error combining inputs:", error);
            throw new Error(
                `GPT-4 processing failed: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }

    private extractModelData(content: string): any {
        try {
            // Look for JSON in the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            return jsonMatch
                ? JSON.parse(jsonMatch[0])
                : { error: "No valid JSON found in response" };
        } catch (error) {
            console.error("Error extracting model data:", error);
            return { error: "Failed to parse model data", rawContent: content };
        }
    }

    private extractModelMetadata(modelData: any, inputs: any): any {
        // Extract useful metadata from the generated model
        const metadata = {
            inputModalities: {
                text: !!inputs.text,
                speech: !!inputs.speechText,
                sketch: !!inputs.sketchAnalysis,
                photo: !!inputs.photoAnalysis,
            },
            modelStatistics: {
                roomCount: modelData.rooms?.length || 0,
                windowCount: modelData.windows?.length || 0,
                doorCount: modelData.doors?.length || 0,
                totalArea: this.calculateTotalArea(modelData.rooms || []),
                largestRoom: this.findLargestRoom(modelData.rooms || []),
            },
            suggestedStyle: this.determineSuggestedStyle(inputs),
            sourceContribution: this.analyzeSourceContribution(inputs),
        };

        return metadata;
    }

    private calculateTotalArea(rooms: any[]): number {
        return rooms.reduce((sum, room) => sum + room.width * room.length, 0);
    }

    private findLargestRoom(rooms: any[]): any {
        if (!rooms.length) return null;

        return rooms.reduce(
            (largest, room) => {
                const area = room.width * room.length;
                return area > largest.area
                    ? { name: room.name, area }
                    : largest;
            },
            { name: rooms[0].name, area: rooms[0].width * rooms[0].length }
        );
    }

    private determineSuggestedStyle(inputs: any): string {
        // Determine an architectural style based on inputs
        if (inputs.photoAnalysis?.architecturalFeatures?.style !== "unknown") {
            return inputs.photoAnalysis.architecturalFeatures.style;
        }

        // Default style
        return "modern";
    }

    private analyzeSourceContribution(inputs: any): any {
        // Analyze how much each modality contributed to the final model
        const weights = {
            text: inputs.text ? 0.4 : 0,
            speech: inputs.speechText ? 0.2 : 0,
            sketch: inputs.sketchAnalysis ? 0.3 : 0,
            photo: inputs.photoAnalysis ? 0.1 : 0,
        };

        // Normalize weights
        const totalWeight = Object.values(weights).reduce(
            (sum: number, weight: number) => sum + weight,
            0
        );

        if (totalWeight > 0) {
            for (const key in weights) {
                weights[key] = weights[key] / totalWeight;
            }
        }

        return weights;
    }

    // Speech recognition method
    async recognizeSpeech(audioBlob: Blob): Promise<string> {
        if (!this.speechConfig) {
            throw new Error(
                "Speech service not initialized. Check Azure Speech configuration."
            );
        }

        return new Promise<string>(async (resolve, reject) => {
            try {
                // Convert Blob to ArrayBuffer
                const arrayBuffer = await audioBlob.arrayBuffer();

                // Create an AudioConfig object using the array buffer
                const pushStream =
                    AudioConfig.fromWavFileOutput("audio-output.wav");

                // Create the SpeechRecognizer
                const recognizer = new SpeechRecognizer(
                    this.speechConfig,
                    pushStream
                );

                // Process audio data
                recognizer.recognizeOnceAsync(
                    (result) => {
                        if (result.text) {
                            resolve(result.text);
                        } else {
                            reject(
                                new Error(
                                    "No text was recognized from the audio"
                                )
                            );
                        }
                        recognizer.close();
                    },
                    (error) => {
                        recognizer.close();
                        reject(error);
                    }
                );

                // Push audio data to the stream
                pushStream.write(new Uint8Array(arrayBuffer));
                pushStream.close();
            } catch (error) {
                reject(error);
            }
        });
    }
}

// Export a singleton instance for easier importing
export const multimodalProcessor = new MultimodalProcessor();
