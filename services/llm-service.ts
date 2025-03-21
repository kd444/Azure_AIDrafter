import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface CadModelData {
  rooms: {
    name: string
    width: number
    length: number
    height: number
    x: number
    y: number
    z: number
    connected_to: string[]
  }[]
  windows: {
    room: string
    wall: string
    width: number
    height: number
    position: number
  }[]
  doors: {
    from: string
    to: string
    width: number
    height: number
  }[]
}

export async function generateCadModel(prompt: string): Promise<{
  modelData: CadModelData
  code: string
}> {
  try {
    // Define the system prompt for structured output
    const systemPrompt = `
      You are an AI assistant specialized in architectural design and CAD modeling.
      Your task is to generate a structured JSON representation of a building or space based on the user's description.
      
      The output should follow this exact structure:
      {
        "rooms": [
          {
            "name": "room_name",
            "width": number_in_meters,
            "length": number_in_meters,
            "height": number_in_meters,
            "x": position_x,
            "y": position_y,
            "z": position_z,
            "connected_to": ["adjacent_room1", "adjacent_room2"]
          }
        ],
        "windows": [
          {
            "room": "room_name",
            "wall": "north|south|east|west",
            "width": number_in_meters,
            "height": number_in_meters,
            "position": relative_position_0_to_1
          }
        ],
        "doors": [
          {
            "from": "room_name1",
            "to": "room_name2",
            "width": number_in_meters,
            "height": number_in_meters
          }
        ]
      }
      
      Ensure that:
      1. Room positions are coherent and don't overlap
      2. Connected rooms are actually adjacent
      3. Dimensions are realistic for the type of space
      4. All values are numbers (not strings)
      5. The JSON is valid and properly formatted
      
      Return ONLY the JSON object with no additional text.
    `

    // Generate the model data using the AI SDK
    const { text: modelDataText } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: prompt,
    })

    // Parse the JSON response
    const modelData = JSON.parse(modelDataText) as CadModelData

    // Generate the Three.js code
    const codeSystemPrompt = `
      You are an AI assistant specialized in 3D visualization with Three.js.
      
      Your task is to generate Three.js code that visualizes the building or space described in the provided JSON structure.
      
      The code should:
      1. Initialize a Three.js scene, camera, renderer, and controls
      2. Create 3D representations of all rooms with proper dimensions and positions
      3. Add doors and windows at the correct locations
      4. Include appropriate lighting and materials
      5. Implement an animation loop for rendering
      6. Handle window resizing
      
      Return ONLY the complete, executable JavaScript code with no additional text.
    `

    // Generate the Three.js code using the AI SDK
    const { text: codeText } = await generateText({
      model: openai("gpt-4o"),
      system: codeSystemPrompt,
      prompt: `Generate Three.js code to visualize this building: ${JSON.stringify(modelData)}`,
    })

    return {
      modelData,
      code: codeText,
    }
  } catch (error) {
    console.error("Error generating CAD model:", error)
    throw new Error("Failed to generate CAD model")
  }
}

