import { AgentOrchestrator } from "./agent-orchestrator";
// Keep existing imports

// Initialize the agent orchestrator
const agentOrchestrator = new AgentOrchestrator();

/**
 * Main function to generate a CAD model from text prompt and/or sketch datapoints
 * Now using the agent architecture
 */
export async function generateCadModel(
    prompt: string,
    sketchData?: string | null
) {
    try {
        console.log(`Generating CAD model with agent architecture:
      - Prompt: "${
          prompt
              ? prompt.substring(0, 100) + (prompt.length > 100 ? "..." : "")
              : "None"
      }"
      - Sketch data provided: ${!!sketchData}`);

        // Process the design request through the agent orchestrator
        const result = await agentOrchestrator.processDesignRequest(
            prompt,
            sketchData
        );

        // Return the processed result
        return {
            modelData: result.modelData,
            code: result.code,
        };
    } catch (error) {
        console.error("Error in agent-based generateCadModel:", error);

        // Use fallback method if agent processing fails
        console.log("Using fallback model generation...");
        return generateFallbackCadModel(prompt, sketchData);
    }
}

// Keep the existing fallback methods
