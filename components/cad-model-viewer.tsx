"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ModelData {
    rooms: {
        name: string;
        width: number;
        length: number;
        height: number;
        x: number;
        y: number;
        z: number;
        connected_to: string[];
    }[];
    windows: {
        room: string;
        wall: string;
        width: number;
        height: number;
        position: number;
    }[];
    doors: {
        from: string;
        to: string;
        width: number;
        height: number;
    }[];
}

interface ViewerSettings {
    showGrid: boolean;
    showAxes: boolean;
    backgroundColor: string;
    lighting: string;
    wireframe: boolean;
    zoom: number;
}

export function CadModelViewer({
    modelData,
    settings,
}: {
    modelData: ModelData;
    settings: ViewerSettings;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [roomCount, setRoomCount] = useState(0);
    const [validRoomCount, setValidRoomCount] = useState(0);

    // Initialize the scene
    useEffect(() => {
        if (!containerRef.current || !modelData) {
            console.log("Container or model data not available");
            return;
        }

        setIsLoading(true);
        setError(null);

        console.log("Initializing 3D viewer with model data:", modelData);

        // Count total rooms and valid rooms
        setRoomCount(modelData.rooms.length);
        const validRooms = modelData.rooms.filter(
            (room) => room.width > 0 && room.length > 0 && room.height > 0
        );
        setValidRoomCount(validRooms.length);

        console.log(
            `Room count: ${modelData.rooms.length}, Valid rooms: ${validRooms.length}`
        );

        try {
            // Clear any existing content
            while (containerRef.current.firstChild) {
                containerRef.current.removeChild(
                    containerRef.current.firstChild
                );
            }

            // Basic Three.js setup
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(settings.backgroundColor);

            const camera = new THREE.PerspectiveCamera(
                75,
                containerRef.current.clientWidth /
                    containerRef.current.clientHeight,
                0.1,
                1000
            );

            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(
                containerRef.current.clientWidth,
                containerRef.current.clientHeight
            );
            containerRef.current.appendChild(renderer.domElement);

            // Add controls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;

            // Add grid and axes if enabled
            if (settings.showGrid) {
                const gridHelper = new THREE.GridHelper(20, 20);
                scene.add(gridHelper);
            }

            if (settings.showAxes) {
                const axesHelper = new THREE.AxesHelper(5);
                scene.add(axesHelper);
            }

            // Configure lighting based on settings
            let ambientIntensity = 1.5;
            let directionalIntensity = 0.5;
            let directionalPosition = new THREE.Vector3(10, 10, 10);

            switch (settings.lighting) {
                case "morning":
                    ambientIntensity = 1.2;
                    directionalIntensity = 0.4;
                    directionalPosition = new THREE.Vector3(10, 6, -10); // East
                    break;
                case "day":
                    ambientIntensity = 1.8;
                    directionalIntensity = 0.7;
                    directionalPosition = new THREE.Vector3(0, 15, 0); // Top
                    break;
                case "evening":
                    ambientIntensity = 1.0;
                    directionalIntensity = 0.3;
                    directionalPosition = new THREE.Vector3(-10, 6, -10); // West
                    scene.background = new THREE.Color(
                        settings.backgroundColor !== "#000000"
                            ? "#f8e8d8"
                            : "#000000"
                    );
                    break;
                case "night":
                    ambientIntensity = 0.6;
                    directionalIntensity = 0.1;
                    directionalPosition = new THREE.Vector3(0, 10, 0);
                    scene.background = new THREE.Color(
                        settings.backgroundColor !== "#000000"
                            ? "#1a1a2e"
                            : "#000000"
                    );
                    break;
            }

            // Add lighting
            const ambientLight = new THREE.AmbientLight(
                0x404040,
                ambientIntensity
            );
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(
                0xffffff,
                directionalIntensity
            );
            directionalLight.position.copy(directionalPosition);
            scene.add(directionalLight);

            // Create rooms
            const roomObjects: { [key: string]: THREE.Mesh } = {};
            const validatedRooms: string[] = [];

            modelData.rooms.forEach((room) => {
                // Skip invalid rooms (prevents rendering errors)
                if (room.width <= 0 || room.length <= 0 || room.height <= 0) {
                    console.warn(
                        `Skipping invalid room: ${room.name} with dimensions: ${room.width}x${room.height}x${room.length}`
                    );
                    return;
                }

                validatedRooms.push(room.name);

                console.log(
                    `Creating room: ${room.name} with dimensions: ${room.width}x${room.height}x${room.length} at position (${room.x}, ${room.y}, ${room.z})`
                );

                // Create room with transparent walls
                const roomGeometry = new THREE.BoxGeometry(
                    room.width,
                    room.height,
                    room.length
                );

                // Use different colors for different rooms to make them more distinguishable
                const roomIndex = validatedRooms.length;
                const hue = (roomIndex * 0.1) % 1; // Distribute colors
                const roomColor = new THREE.Color().setHSL(hue, 0.3, 0.8);

                const roomMaterial = new THREE.MeshStandardMaterial({
                    color: roomColor,
                    transparent: true,
                    opacity: 0.3,
                    wireframe: settings.wireframe,
                    side: THREE.DoubleSide,
                });

                const roomMesh = new THREE.Mesh(roomGeometry, roomMaterial);
                roomMesh.position.set(
                    room.x + room.width / 2,
                    room.y + room.height / 2,
                    room.z + room.length / 2
                );

                scene.add(roomMesh);
                roomObjects[room.name] = roomMesh;

                // Add room edges for better visibility
                const edges = new THREE.EdgesGeometry(roomGeometry);
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: 0x000000,
                });
                const wireframe = new THREE.LineSegments(edges, lineMaterial);
                wireframe.position.copy(roomMesh.position);
                scene.add(wireframe);

                // Add floor
                const floorGeometry = new THREE.PlaneGeometry(
                    room.width,
                    room.length
                );

                // Change floor colors based on room types
                let floorColor = 0xeeeeee;
                if (room.name.toLowerCase().includes("kitchen")) {
                    floorColor = 0xe0e0e0;
                } else if (room.name.toLowerCase().includes("bathroom")) {
                    floorColor = 0xd0f0f0;
                } else if (room.name.toLowerCase().includes("bedroom")) {
                    floorColor = 0xf5e8dc;
                } else if (room.name.toLowerCase().includes("living")) {
                    floorColor = 0xf0f0e0;
                } else {
                    // For rooms with no specific type, use a slight variation of the base color
                    floorColor = 0xe8e8e8 + roomIndex * 0x050505;
                }

                const floorMaterial = new THREE.MeshStandardMaterial({
                    color: floorColor,
                    side: THREE.DoubleSide,
                });

                const floor = new THREE.Mesh(floorGeometry, floorMaterial);
                floor.rotation.x = Math.PI / 2;
                floor.position.set(
                    room.x + room.width / 2,
                    room.y + 0.01,
                    room.z + room.length / 2
                );

                scene.add(floor);

                // Add room label
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = 256;
                canvas.height = 64;

                if (context) {
                    context.fillStyle = "#ffffff";
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.font = "24px Arial";
                    context.fillStyle = "#000000";
                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    context.fillText(
                        room.name,
                        canvas.width / 2,
                        canvas.height / 2
                    );

                    const texture = new THREE.CanvasTexture(canvas);
                    const labelMaterial = new THREE.SpriteMaterial({
                        map: texture,
                        transparent: true,
                    });

                    const label = new THREE.Sprite(labelMaterial);
                    label.position.set(
                        room.x + room.width / 2,
                        room.y + 0.5,
                        room.z + room.length / 2
                    );
                    label.scale.set(2, 0.5, 1);
                    scene.add(label);
                }
            });

            // Add windows
            modelData.windows.forEach((window) => {
                const roomMesh = roomObjects[window.room];

                if (!roomMesh) {
                    console.warn(`Room ${window.room} not found for window`);
                    return;
                }

                console.log(
                    `Creating window in ${window.room} on ${window.wall} wall`
                );

                const windowGeometry = new THREE.PlaneGeometry(
                    window.width,
                    window.height
                );
                const windowMaterial = new THREE.MeshBasicMaterial({
                    color: 0x87ceeb,
                    transparent: true,
                    opacity: 0.6,
                    side: THREE.DoubleSide,
                });

                const windowMesh = new THREE.Mesh(
                    windowGeometry,
                    windowMaterial
                );

                // Find the corresponding room
                const room = modelData.rooms.find(
                    (r) => r.name === window.room
                );

                if (!room) {
                    console.warn(`Room data for ${window.room} not found`);
                    return;
                }

                // Position window based on wall
                switch (window.wall.toLowerCase()) {
                    case "north":
                        windowMesh.position.set(
                            room.x + room.width * window.position,
                            room.y + room.height / 2,
                            room.z + 0.01
                        );
                        break;

                    case "south":
                        windowMesh.position.set(
                            room.x + room.width * window.position,
                            room.y + room.height / 2,
                            room.z + room.length - 0.01
                        );
                        windowMesh.rotation.y = Math.PI;
                        break;

                    case "east":
                        windowMesh.position.set(
                            room.x + room.width - 0.01,
                            room.y + room.height / 2,
                            room.z + room.length * window.position
                        );
                        windowMesh.rotation.y = Math.PI / 2;
                        break;

                    case "west":
                        windowMesh.position.set(
                            room.x + 0.01,
                            room.y + room.height / 2,
                            room.z + room.length * window.position
                        );
                        windowMesh.rotation.y = -Math.PI / 2;
                        break;

                    default:
                        console.warn(`Unknown wall: ${window.wall}`);
                }

                scene.add(windowMesh);

                // Add window frame
                const frameGeometry = new THREE.EdgesGeometry(windowGeometry);
                const frameMaterial = new THREE.LineBasicMaterial({
                    color: 0x000000,
                    linewidth: 2,
                });
                const windowFrame = new THREE.LineSegments(
                    frameGeometry,
                    frameMaterial
                );
                windowFrame.position.copy(windowMesh.position);
                windowFrame.rotation.copy(windowMesh.rotation);
                scene.add(windowFrame);
            });

            // Add doors
            modelData.doors.forEach((door) => {
                if (!door.from || !door.to) {
                    console.warn("Door missing from/to properties");
                    return;
                }

                const fromRoom = modelData.rooms.find(
                    (r) => r.name === door.from
                );
                const toRoom = modelData.rooms.find((r) => r.name === door.to);

                if (!fromRoom || !toRoom) {
                    console.warn(
                        `Rooms not found for door: ${door.from} -> ${door.to}`
                    );
                    return;
                }

                // Skip doors for invalid rooms
                if (
                    !validatedRooms.includes(door.from) ||
                    !validatedRooms.includes(door.to)
                ) {
                    console.warn(
                        `Skipping door between invalid rooms: ${door.from} -> ${door.to}`
                    );
                    return;
                }

                console.log(
                    `Creating door between ${door.from} and ${door.to}`
                );

                // Simple door representation
                const doorGeometry = new THREE.BoxGeometry(
                    door.width,
                    door.height,
                    0.1
                );
                const doorMaterial = new THREE.MeshBasicMaterial({
                    color: 0x8b4513,
                });
                const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);

                // Position door between rooms - try to find shared wall
                let doorPositioned = false;

                // Check if rooms are adjacent on X axis
                if (
                    (fromRoom.x + fromRoom.width === toRoom.x ||
                        toRoom.x + toRoom.width === fromRoom.x) &&
                    fromRoom.z < toRoom.z + toRoom.length &&
                    toRoom.z < fromRoom.z + fromRoom.length
                ) {
                    // Rooms are adjacent on X axis
                    const sharedX =
                        fromRoom.x + fromRoom.width === toRoom.x
                            ? fromRoom.x + fromRoom.width
                            : toRoom.x + toRoom.width;

                    // Find overlap on Z axis
                    const minZ = Math.max(fromRoom.z, toRoom.z);
                    const maxZ = Math.min(
                        fromRoom.z + fromRoom.length,
                        toRoom.z + toRoom.length
                    );
                    const midZ = (minZ + maxZ) / 2;

                    doorMesh.position.set(
                        sharedX - 0.05,
                        door.height / 2,
                        midZ
                    );
                    doorMesh.rotation.y = Math.PI / 2;
                    doorPositioned = true;
                }

                // Check if rooms are adjacent on Z axis
                if (
                    !doorPositioned &&
                    (fromRoom.z + fromRoom.length === toRoom.z ||
                        toRoom.z + toRoom.length === fromRoom.z) &&
                    fromRoom.x < toRoom.x + toRoom.width &&
                    toRoom.x < fromRoom.x + fromRoom.width
                ) {
                    // Rooms are adjacent on Z axis
                    const sharedZ =
                        fromRoom.z + fromRoom.length === toRoom.z
                            ? fromRoom.z + fromRoom.length
                            : toRoom.z + toRoom.length;

                    // Find overlap on X axis
                    const minX = Math.max(fromRoom.x, toRoom.x);
                    const maxX = Math.min(
                        fromRoom.x + fromRoom.width,
                        toRoom.x + toRoom.width
                    );
                    const midX = (minX + maxX) / 2;

                    doorMesh.position.set(
                        midX,
                        door.height / 2,
                        sharedZ - 0.05
                    );
                    doorPositioned = true;
                }

                // If no shared wall found, use simple positioning
                if (!doorPositioned) {
                    // Create a connecting "hallway" between non-adjacent rooms
                    const fromCenter = new THREE.Vector3(
                        fromRoom.x + fromRoom.width / 2,
                        0,
                        fromRoom.z + fromRoom.length / 2
                    );

                    const toCenter = new THREE.Vector3(
                        toRoom.x + toRoom.width / 2,
                        0,
                        toRoom.z + toRoom.length / 2
                    );

                    // Place door at the midpoint
                    const midPoint = new THREE.Vector3()
                        .addVectors(fromCenter, toCenter)
                        .multiplyScalar(0.5);

                    // Orient the door toward the longer dimension
                    const dx = Math.abs(toCenter.x - fromCenter.x);
                    const dz = Math.abs(toCenter.z - fromCenter.z);

                    doorMesh.position.set(
                        midPoint.x,
                        door.height / 2,
                        midPoint.z
                    );

                    if (dx > dz) {
                        doorMesh.rotation.y = 0; // Orient along Z axis
                    } else {
                        doorMesh.rotation.y = Math.PI / 2; // Orient along X axis
                    }
                }

                scene.add(doorMesh);
            });

            // Position camera to view the entire scene
            const bbox = new THREE.Box3();
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    bbox.expandByObject(object);
                }
            });

            const center = new THREE.Vector3();
            bbox.getCenter(center);

            const size = new THREE.Vector3();
            bbox.getSize(size);

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraDistance = Math.abs(maxDim / Math.sin(fov / 2));

            // Apply zoom settings
            cameraDistance = cameraDistance / settings.zoom;

            // Position camera
            camera.position.set(
                center.x + cameraDistance * 0.7,
                center.y + cameraDistance * 0.7,
                center.z + cameraDistance * 0.7
            );

            camera.lookAt(center);
            controls.target.copy(center);
            controls.update();

            // Animation loop
            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            }

            animate();

            // Handle window resize
            function handleResize() {
                if (!containerRef.current) return;

                const width = containerRef.current.clientWidth;
                const height = containerRef.current.clientHeight;

                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }

            window.addEventListener("resize", handleResize);

            console.log("3D scene initialized successfully");
            setIsLoading(false);

            // Cleanup
            return () => {
                console.log("Cleaning up 3D scene");
                window.removeEventListener("resize", handleResize);
                scene.clear();
                renderer.dispose();
            };
        } catch (err) {
            console.error("Error initializing 3D viewer:", err);
            setError(
                `Error initializing 3D viewer: ${
                    err instanceof Error ? err.message : String(err)
                }`
            );
            setIsLoading(false);
        }
    }, [
        modelData,
        settings.backgroundColor,
        settings.showGrid,
        settings.showAxes,
        settings.wireframe,
        settings.lighting,
        settings.zoom,
    ]);

    return (
        <div className="relative w-full h-full">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Loading 3D model...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md">
                        <h3 className="font-bold mb-2">Error Loading Model</h3>
                        <p>{error}</p>
                        <p className="text-sm mt-2">
                            Check the browser console for more details.
                        </p>
                    </div>
                </div>
            )}

            <div
                ref={containerRef}
                className="w-full h-full"
                style={{ minHeight: "500px" }}
            />

            {/* Enhanced debug info overlay */}
            <div className="absolute bottom-2 left-2 text-xs bg-background/80 p-2 rounded">
                <p>
                    Model: {validRoomCount}/{roomCount} rooms,{" "}
                    {modelData.windows.length} windows, {modelData.doors.length}{" "}
                    doors
                </p>
                {modelData.rooms.length > 0 && (
                    <p>
                        First room: {modelData.rooms[0]?.name} (
                        {modelData.rooms[0]?.width}×{modelData.rooms[0]?.length}
                        ×{modelData.rooms[0]?.height})
                    </p>
                )}
                {modelData.rooms.length > 1 && (
                    <p>
                        Second room: {modelData.rooms[1]?.name} (
                        {modelData.rooms[1]?.width}×{modelData.rooms[1]?.length}
                        ×{modelData.rooms[1]?.height})
                    </p>
                )}
            </div>
        </div>
    );
}
