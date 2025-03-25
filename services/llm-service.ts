import {
    analyzeSketch,
    generateModelFromSketch,
    generateThreeJsCode,
} from "./azure-service";

// Default room height if not specified
const DEFAULT_ROOM_HEIGHT = 3;

/**
 * Main function to generate a CAD model from text prompt and/or sketch data
 */
export async function generateCadModel(
    prompt: string,
    sketchData?: string | null
) {
    try {
        console.log(
            `Generating CAD model with: 
      - Prompt: "${
          prompt
              ? prompt.substring(0, 100) + (prompt.length > 100 ? "..." : "")
              : "None"
      }"
      - Sketch data provided: ${!!sketchData}`
        );

        // Step 1: Analyze sketch data if provided
        let sketchAnalysis = null;
        if (sketchData) {
            console.log("Analyzing sketch with Azure Computer Vision...");
            try {
                sketchAnalysis = await analyzeSketch(sketchData);
                console.log("Sketch analysis complete:", sketchAnalysis);

                // Enhance sketch analysis with additional processing
                sketchAnalysis = enhanceSketchAnalysis(sketchAnalysis);
            } catch (error) {
                console.error(
                    "Error during sketch analysis, continuing with prompt only:",
                    error
                );
                // Continue with just the prompt if sketch analysis fails
            }
        }

        // Step 2: Generate model data from sketch analysis and/or text prompt
        console.log("Generating model data with Azure OpenAI...");
        let modelData = await generateModelFromSketch(sketchAnalysis, prompt);

        // Step 3: Validate and enhance the model data
        // Only perform basic validation but preserve most of the structure from the sketch
        modelData = validateAndPreserveModelData(
            modelData,
            sketchAnalysis !== null
        );
        console.log("Model data generated and preserved:", modelData);

        // Step 4: Generate Three.js code for the model
        console.log("Generating Three.js code...");
        const code = await generateThreeJsCode(modelData, prompt);
        console.log("Code generation complete");

        return {
            modelData,
            code,
        };
    } catch (error) {
        console.error("Error in generateCadModel:", error);

        // Use fallback method if Azure call fails (useful for testing or when API limits are reached)
        console.log("Using fallback model generation...");
        return generateFallbackCadModel(prompt, sketchData);
    }
}

/**
 * Enhances sketch analysis with additional processing
 */
function enhanceSketchAnalysis(sketchAnalysis) {
    if (!sketchAnalysis) return null;

    // Extract more information from the sketch analysis
    // Detect possible rooms based on enclosed areas
    const possibleRooms = detectEnclosedAreas(sketchAnalysis.derivedLines);

    // Add the detected rooms to the analysis
    sketchAnalysis.possibleRooms = possibleRooms;

    return sketchAnalysis;
}

/**
 * Detect enclosed areas in the sketch that could represent rooms
 */
function detectEnclosedAreas(lines) {
    // This is a placeholder for the actual algorithm
    // In a real implementation, this would use computer vision or geometry algorithms
    // to detect enclosed spaces formed by intersecting lines

    const possibleRooms = [];

    // Group lines that might form rooms based on proximity and orientation
    // This is a simplified approach - actual implementation would be more complex
    const horizontalLines = lines.filter((line) => line.type === "horizontal");
    const verticalLines = lines.filter((line) => line.type === "vertical");

    // Process pairs of horizontal and vertical lines to find potential corners
    // and eventually closed shapes

    // For now, return a placeholder structure
    // In reality, analyze the lines to detect enclosed areas
    return [
        {
            bounds: {
                x1: 0,
                y1: 0,
                x2: 200,
                y2: 150,
            },
            confidence: 0.8,
            possibleType: "room",
        },
        // More rooms would be detected here
    ];
}

/**
 * Validates model data while preserving the structure derived from sketches
 */
function validateAndPreserveModelData(modelData: any, hasSketchData: boolean) {
    if (!modelData) {
        throw new Error("Model data is null or undefined");
    }

    // If we're working with sketch data, be more lenient with validation
    // to preserve the structure derived from the sketch
    const preserveStructure = hasSketchData;

    // Validate and default rooms, but preserve structure if from sketch
    if (!Array.isArray(modelData.rooms) || modelData.rooms.length === 0) {
        modelData.rooms = [
            {
                name: "defaultRoom",
                width: 5,
                length: 5,
                height: DEFAULT_ROOM_HEIGHT,
                x: 0,
                y: 0,
                z: 0,
                connected_to: [],
            },
        ];
    }

    // Ensure required properties for each room
    modelData.rooms.forEach((room: any, index: number) => {
        room.name = room.name || `room${index + 1}`;
        room.width = ensurePositiveNumber(room.width, 4);
        room.length = ensurePositiveNumber(room.length, 4);
        room.height = ensurePositiveNumber(room.height, DEFAULT_ROOM_HEIGHT);
        room.x = room.x !== undefined ? room.x : 0;
        room.y = room.y !== undefined ? room.y : 0;
        room.z = room.z !== undefined ? room.z : 0;
        room.connected_to = Array.isArray(room.connected_to)
            ? room.connected_to
            : [];
    });

    // Validate and default windows
    if (!Array.isArray(modelData.windows)) {
        modelData.windows = [];
    }

    // Ensure required properties for each window
    modelData.windows.forEach((window: any, index: number) => {
        // Skip invalid windows that don't reference a room or have an invalid room
        if (
            !window.room ||
            !modelData.rooms.some((r: any) => r.name === window.room)
        ) {
            window.valid = false;
            return;
        }

        window.wall = window.wall || "south";
        window.width = ensurePositiveNumber(window.width, 1.5);
        window.height = ensurePositiveNumber(window.height, 1.2);
        window.position = window.position !== undefined ? window.position : 0.5;
        window.valid = true;
    });

    // Filter out invalid windows
    modelData.windows = modelData.windows.filter((w: any) => w.valid);

    // Validate and default doors
    if (!Array.isArray(modelData.doors)) {
        modelData.doors = [];
    }

    // If we have sketch-derived data, don't completely recreate the doors
    // Just ensure they have the necessary properties
    if (!preserveStructure) {
        // Ensure room connections have corresponding doors
        modelData.rooms.forEach((room: any) => {
            room.connected_to.forEach((connectedRoomName: string) => {
                // Check if a door already exists between these rooms
                const doorExists = modelData.doors.some(
                    (door: any) =>
                        (door.from === room.name &&
                            door.to === connectedRoomName) ||
                        (door.from === connectedRoomName &&
                            door.to === room.name)
                );

                // Add a door if it doesn't exist and the connected room is valid
                if (
                    !doorExists &&
                    modelData.rooms.some(
                        (r: any) => r.name === connectedRoomName
                    )
                ) {
                    modelData.doors.push({
                        from: room.name,
                        to: connectedRoomName,
                        width: 1.0,
                        height: 2.1,
                    });
                }
            });
        });
    }

    // Ensure required properties for each door
    modelData.doors.forEach((door: any) => {
        door.width = ensurePositiveNumber(door.width, 1.0);
        door.height = ensurePositiveNumber(door.height, 2.1);
    });

    return modelData;
}

/**
 * Ensures a value is a positive number, or returns a default
 */
function ensurePositiveNumber(value: any, defaultValue: number): number {
    const num = Number(value);
    return !isNaN(num) && num > 0 ? num : defaultValue;
}

/**
 * Generates a fallback CAD model when API calls fail - now with sketch support
 */
function generateFallbackCadModel(prompt: string, sketchData?: string | null) {
    console.log("Using fallback CAD model generation for prompt:", prompt);

    // If we have sketch data, try to extract basic information
    if (sketchData) {
        // Simple mock extraction from sketch
        // In a real implementation, this would use actual computer vision

        // Create a more complex default layout based on sketch
        const modelData = generateSketchBasedLayout();
        const code = generateMockThreeJsCode(modelData, prompt);

        return {
            modelData,
            code,
        };
    }

    // Create a simple model based on the text prompt
    // This is a very simplified version that could be enhanced
    const words = prompt ? prompt.toLowerCase().split(/\s+/) : [];

    // Determine number of rooms based on the prompt
    let numRooms = 1;

    // Check for specific numbers
    for (let i = 0; i < words.length; i++) {
        if (/^\d+$/.test(words[i]) && i > 0 && words[i - 1].includes("room")) {
            numRooms = parseInt(words[i]);
            break;
        }
    }

    // Check for specific room types
    const roomTypes = [
        "bedroom",
        "bathroom",
        "kitchen",
        "living",
        "dining",
        "office",
        "study",
        "hallway",
        "entrance",
    ];

    const detectedRooms = roomTypes.filter(
        (type) =>
            words.includes(type) ||
            words.includes(type + "s") ||
            words.includes(type + "room")
    );

    if (detectedRooms.length > 0) {
        numRooms = Math.max(numRooms, detectedRooms.length);
    }

    // Generate a simple layout based on the number of rooms
    const modelData = generateSimpleLayout(numRooms, detectedRooms);

    // Generate mock code
    const code = generateMockThreeJsCode(modelData, prompt);

    return {
        modelData,
        code,
    };
}

/**
 * Generates a layout based on sketch analysis for fallback
 */
function generateSketchBasedLayout() {
    // This would normally use actual data from the sketch
    // For now, generate a more complex mock layout with multiple rooms

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
                width: 3.5,
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
                length: 4,
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
                connected_to: ["living", "bedroom1", "bedroom2", "bathroom"],
            },
            {
                name: "bedroom1",
                width: 4.5,
                length: 4,
                height: 3,
                x: -4.5,
                y: 0,
                z: 7,
                connected_to: ["hallway"],
            },
            {
                name: "bedroom2",
                width: 4,
                length: 4.5,
                height: 3,
                x: 2,
                y: 0,
                z: 7,
                connected_to: ["hallway"],
            },
            {
                name: "bathroom",
                width: 2.5,
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
}

/**
 * Generates a simple room layout based on number of rooms and types
 */
function generateSimpleLayout(numRooms: number, roomTypes: string[]) {
    const rooms = [];
    const windows = [];
    const doors = [];

    // Ensure at least one room
    numRooms = Math.max(1, Math.min(numRooms, 8));

    // Start with a living room
    rooms.push({
        name: roomTypes.includes("living") ? "living" : "mainRoom",
        width: 5,
        length: 7,
        height: DEFAULT_ROOM_HEIGHT,
        x: 0,
        y: 0,
        z: 0,
        connected_to: [],
    });

    // Add windows to the main room
    windows.push({
        room: rooms[0].name,
        wall: "south",
        width: 2,
        height: 1.5,
        position: 0.5,
    });

    // Add other rooms based on detected types or generic rooms
    let currentIndex = 1;
    const maxRooms = Math.min(
        numRooms,
        roomTypes.length > 0 ? roomTypes.length : numRooms
    );

    for (let i = 0; i < maxRooms - 1; i++) {
        const roomName = roomTypes[i] || `room${i + 2}`;

        // Skip if this room type is already added
        if (rooms.some((r) => r.name === roomName)) {
            continue;
        }

        // Decide where to place the room relative to existing rooms
        const baseRoom = rooms[Math.floor(Math.random() * rooms.length)];

        // Determine position (4 possibilities: right, left, top, bottom)
        let x = baseRoom.x;
        let z = baseRoom.z;
        const placement = i % 4;

        if (placement === 0) {
            // Right
            x = baseRoom.x + baseRoom.width;
        } else if (placement === 1) {
            // Bottom
            z = baseRoom.z + baseRoom.length;
        } else if (placement === 2) {
            // Left
            x = baseRoom.x - getRoomDimension(roomName, "width");
        } else {
            // Top
            z = baseRoom.z - getRoomDimension(roomName, "length");
        }

        // Add the room
        rooms.push({
            name: roomName,
            width: getRoomDimension(roomName, "width"),
            length: getRoomDimension(roomName, "length"),
            height: DEFAULT_ROOM_HEIGHT,
            x,
            y: 0,
            z,
            connected_to: [baseRoom.name],
        });

        // Connect rooms
        baseRoom.connected_to.push(roomName);

        // Add doors between connected rooms
        doors.push({
            from: baseRoom.name,
            to: roomName,
            width: 1.0,
            height: 2.1,
        });

        // Add windows to each room
        if (roomName !== "hallway" && roomName !== "entrance") {
            const wallOptions = ["north", "south", "east", "west"];
            const wall =
                wallOptions[Math.floor(Math.random() * wallOptions.length)];

            windows.push({
                room: roomName,
                wall,
                width: 1.5,
                height: 1.2,
                position: 0.5,
            });
        }

        currentIndex++;
    }

    return {
        rooms,
        windows,
        doors,
    };
}

/**
 * Returns appropriate dimension for a room based on its type
 */
function getRoomDimension(
    roomType: string,
    dimension: "width" | "length"
): number {
    const dimensions: Record<string, { width: number; length: number }> = {
        bedroom: { width: 4, length: 4 },
        bathroom: { width: 3, length: 2 },
        kitchen: { width: 4, length: 4 },
        living: { width: 5, length: 7 },
        dining: { width: 4, length: 5 },
        office: { width: 4, length: 4 },
        study: { width: 3, length: 3 },
        hallway: { width: 2, length: 5 },
        entrance: { width: 3, length: 3 },
    };

    return dimensions[roomType]?.[dimension] || (dimension === "width" ? 4 : 4);
}

/**
 * Generates mock Three.js code for the model when API is unavailable
 */
function generateMockThreeJsCode(modelData: any, prompt: string) {
    // Same implementation as before
    return `// Generated Three.js code for: "${
        prompt || "Sketch-based floor plan"
    }"
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
${modelData.rooms
    .map((room) => {
        return `const ${room.name.replace(/\s+/g, "_")} = createRoom("${
            room.name
        }", ${room.width}, ${room.length}, ${room.height}, ${room.x}, ${
            room.y
        }, ${room.z});`;
    })
    .join("\n")}

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
}
