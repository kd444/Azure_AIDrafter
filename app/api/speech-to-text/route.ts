import { NextResponse } from "next/server";
import { multimodalProcessor } from "@/services/multimodal-processor";

export async function POST(req: Request) {
    try {
        // Get audio data from request
        const audioBlob = await req.blob();

        if (!audioBlob || audioBlob.size === 0) {
            return NextResponse.json(
                { error: "No audio data provided" },
                { status: 400 }
            );
        }

        console.log(
            `Processing speech-to-text request with ${audioBlob.size} bytes of audio data`
        );

        // Process speech using Azure Speech Services
        const text = await multimodalProcessor.recognizeSpeech(audioBlob);

        // Return the transcript
        return NextResponse.json({ text });
    } catch (error) {
        console.error("Error in speech-to-text API:", error);

        // Provide detailed error message
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        return NextResponse.json(
            { error: "Failed to process speech", details: errorMessage },
            { status: 500 }
        );
    }
}
