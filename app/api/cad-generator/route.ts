import { NextResponse } from "next/server";
import { generateCadModel } from "@/services/llm-service";

export async function POST(req: Request) {
    try {
        // Parse the request body
        const body = await req.json();
        const { prompt, sketchData } = body;

        // Validate the input
        if (!sketchData && !prompt) {
            return NextResponse.json(
                { error: "Either prompt or sketchData is required" },
                { status: 400 }
            );
        }

        // Create a default prompt if only sketch data is provided
        // This ensures we always have a prompt for the generateCadModel function
        const textPrompt =
            prompt || "Generate a CAD model based on this sketch";

        console.log(
            `Processing request with ${prompt ? "prompt" : "no prompt"} and ${
                sketchData ? "sketch data" : "no sketch data"
            }`
        );

        // Generate the CAD model using both inputs
        const result = await generateCadModel(textPrompt, sketchData);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in CAD generator API:", error);

        // Provide more detailed error message
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        return NextResponse.json(
            { error: "Failed to generate CAD model", details: errorMessage },
            { status: 500 }
        );
    }
}
