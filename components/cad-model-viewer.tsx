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

    // Initialize the scene
    useEffect(() => {
        if (!containerRef.current || !modelData) {
            console.log("Container or model data not available");
            return;
        }

        setIsLoading(true);
        setError(null);

        console.log("Initializing 3D viewer with model data:", modelData);

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

            // Add lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(10, 10, 10);
            scene.add(directionalLight);

            // Create rooms
            const roomObjects: { [key: string]: THREE.Mesh } = {};

            modelData.rooms.forEach((room) => {
                console.log(
                    `Creating room: ${room.name} with dimensions: ${room.width}x${room.height}x${room.length}`
                );

                // Create room with transparent walls
                const roomGeometry = new THREE.BoxGeometry(
                    room.width,
                    room.height,
                    room.length
                );
                const roomMaterial = new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
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
                const floorMaterial = new THREE.MeshStandardMaterial({
                    color: 0xeeeeee,
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

                // Position door between rooms (simplified)
                const midX =
                    (fromRoom.x +
                        fromRoom.width / 2 +
                        toRoom.x +
                        toRoom.width / 2) /
                    2;
                const midZ =
                    (fromRoom.z +
                        fromRoom.length / 2 +
                        toRoom.z +
                        toRoom.length / 2) /
                    2;

                doorMesh.position.set(midX, door.height / 2, midZ);
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

            // Add some padding
            cameraDistance *= 1.5;

            camera.position.set(
                center.x + cameraDistance,
                center.y + cameraDistance,
                center.z + cameraDistance
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

            // Add a debug cube to ensure rendering is working
            const debugCube = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial({ color: 0xff0000 })
            );
            debugCube.position.set(0, 0, 0);
            scene.add(debugCube);

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

            {/* Debug info overlay */}
            <div className="absolute bottom-2 left-2 text-xs bg-background/80 p-2 rounded">
                <p>
                    Model: {modelData.rooms.length} rooms,{" "}
                    {modelData.windows.length} windows, {modelData.doors.length}{" "}
                    doors
                </p>
                <p>
                    First room: {modelData.rooms[0]?.name} (
                    {modelData.rooms[0]?.width}x{modelData.rooms[0]?.length}x
                    {modelData.rooms[0]?.height})
                </p>
            </div>
        </div>
    );
}
