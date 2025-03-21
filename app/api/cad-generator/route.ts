import { NextResponse } from "next/server";
import { generateCadModel } from "@/services/llm-service";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        const result = await generateCadModel(prompt);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in CAD generator API:", error);
        return NextResponse.json(
            { error: "Failed to generate CAD model" },
            { status: 500 }
        );
    }
}
