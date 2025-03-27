import { BaseAgent, AgentInput, AgentOutput } from "./base-agent";
import { AGENT_CONFIG, AZURE_SERVICES_CONFIG } from "./agent-config";
import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { ApiKeyCredentials } from "@azure/ms-rest-js";

export class InterpreterAgent extends BaseAgent {
    private visionClient: ComputerVisionClient;

    constructor() {
        super("Interpreter", AGENT_CONFIG.interpreterSystemPrompt);

        // Initialize Computer Vision client
        const credentials = new ApiKeyCredentials({
            inHeader: {
                "Ocp-Apim-Subscription-Key": AZURE_SERVICES_CONFIG.vision.key,
            },
        });
        this.visionClient = new ComputerVisionClient(
            credentials,
            AZURE_SERVICES_CONFIG.vision.endpoint
        );
    }

    async execute(input: AgentInput): Promise<AgentOutput> {
        console.log(
            `Interpreter Agent processing input with ${
                input.prompt ? "text prompt" : "no prompt"
            } and ${input.sketchData ? "sketch data" : "no sketch data"}`
        );

        try {
            // Step 1: Pre-process the sketch if available
            let sketchAnalysis = null;
            if (input.sketchData) {
                sketchAnalysis = await this.analyzeSketch(input.sketchData);
            }

            // Step 2: Prepare the prompt for the LLM
            const prompt = this.preparePrompt(input.prompt, sketchAnalysis);

            // Step 3: Call the LLM to interpret requirements
            const llmResponse = await this.callLLM(prompt);

            // Step 4: Parse and validate the response
            const requirements = this.safeParseJSON(llmResponse);

            return {
                originalPrompt: input.prompt,
                sketchAnalysisAvailable: !!sketchAnalysis,
                requirements,
            };
        } catch (error) {
            console.error("Interpreter Agent error:", error);
            return {
                error: `Interpreter Agent failed: ${
                    error instanceof Error ? error.message : String(error)
                }`,
                originalPrompt: input.prompt,
                requirementsExtracted: false,
            };
        }
    }

    private async analyzeSketch(sketchDataUrl: string): Promise<any> {
        try {
            // Remove the data URL prefix to get the base64 content
            const base64Image = sketchDataUrl.replace(
                /^data:image\/\w+;base64,/,
                ""
            );

            // Analyze the image with Computer Vision
            const result = await this.visionClient.analyzeImageInStream(
                Buffer.from(base64Image, "base64"),
                {
                    visualFeatures: ["Objects", "Categories", "Tags", "Lines"],
                }
            );

            // Enhanced analysis for architectural elements
            const enhancedAnalysis = {
                objects: result.objects || [],
                tags: result.tags || [],
                lines: result.lines || [],
                potentialRooms: this.detectPotentialRooms(result),
                dimensions: this.estimateDimensions(result),
            };

            return enhancedAnalysis;
        } catch (error) {
            console.error("Error in sketch analysis:", error);
            throw new Error(
                `Sketch analysis failed: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }

    private detectPotentialRooms(visionResult: any): any[] {
        // Logic to detect potential rooms from vision analysis
        // This is simplified - a real implementation would be more sophisticated
        const potentialRooms = [];

        // Check for rectangular objects that might be rooms
        const rectangles = (visionResult.objects || []).filter(
            (obj: any) => obj.object === "rectangle" || obj.object === "square"
        );

        // Convert rectangles to potential rooms
        rectangles.forEach((rect: any, index: number) => {
            if (rect.rectangle) {
                potentialRooms.push({
                    name: `room${index + 1}`,
                    bounds: {
                        x: rect.rectangle.x,
                        y: rect.rectangle.y,
                        width: rect.rectangle.w,
                        height: rect.rectangle.h,
                    },
                    confidence: rect.confidence,
                });
            }
        });

        return potentialRooms;
    }

    private estimateDimensions(visionResult: any): any {
        // Logic to estimate dimensions from the sketch
        // This would use scale inference in a real implementation
        return {
            estimatedScale: "unknown",
            estimatedUnitSize: "unknown",
        };
    }

    private preparePrompt(textPrompt: string, sketchAnalysis: any): string {
        let prompt =
            "Extract architectural requirements from the following information:\n\n";

        if (textPrompt) {
            prompt += `TEXT DESCRIPTION:\n${textPrompt}\n\n`;
        }

        if (sketchAnalysis) {
            prompt += `SKETCH ANALYSIS:\n${JSON.stringify(
                sketchAnalysis,
                null,
                2
            )}\n\n`;
        }

        prompt += `Based on the above, extract the following in JSON format:
1. Rooms: types, dimensions, and relationships
2. Design preferences: style, materials, etc.
3. Special features: windows, doors, etc.
4. Constraints: budget, accessibility, etc.

Format your response as a valid JSON object with these elements.`;

        return prompt;
    }
}
