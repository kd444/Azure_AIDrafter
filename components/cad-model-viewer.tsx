"use client"

import { useRef, useEffect } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

interface ModelData {
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

export function CadModelViewer({ modelData }: { modelData: ModelData }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !modelData) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f0f0)

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(10, 10, 10)

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0)
    controls.update()

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(10, 10, 10)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Create grid helper
    const gridHelper = new THREE.GridHelper(50, 50)
    scene.add(gridHelper)

    // Create rooms
    const roomObjects: { [key: string]: { wireframe: THREE.LineSegments; floor: THREE.Mesh } } = {}

    modelData.rooms.forEach((room) => {
      const { name, width, length, height, x, y, z } = room

      // Create room wireframe
      const geometry = new THREE.BoxGeometry(width, height, length)
      const edges = new THREE.EdgesGeometry(geometry)
      const material = new THREE.LineBasicMaterial({ color: 0x000000 })
      const wireframe = new THREE.LineSegments(edges, material)
      wireframe.position.set(x + width / 2, y + height / 2, z + length / 2)
      scene.add(wireframe)

      // Add floor
      const floorGeometry = new THREE.PlaneGeometry(width, length)
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      })
      const floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.rotation.x = Math.PI / 2
      floor.position.set(x + width / 2, 0.01, z + length / 2)
      floor.receiveShadow = true
      scene.add(floor)

      // Add room label
      const canvas = document.createElement("canvas")
      canvas.width = 256
      canvas.height = 128
      const context = canvas.getContext("2d")
      if (context) {
        context.fillStyle = "#ffffff"
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.font = "bold 48px Arial"
        context.fillStyle = "#000000"
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillText(name, canvas.width / 2, canvas.height / 2)

        const texture = new THREE.CanvasTexture(canvas)
        const labelMaterial = new THREE.SpriteMaterial({ map: texture })
        const label = new THREE.Sprite(labelMaterial)
        label.position.set(x + width / 2, 0.5, z + length / 2)
        label.scale.set(2, 1, 1)
        scene.add(label)
      }

      roomObjects[name] = { wireframe, floor }
    })

    // Add doors
    modelData.doors.forEach((door) => {
      const { from, to, width: doorWidth, height: doorHeight } = door

      // Find connecting rooms
      const fromRoom = modelData.rooms.find((r) => r.name === from)
      const toRoom = modelData.rooms.find((r) => r.name === to)

      if (fromRoom && toRoom) {
        // Calculate door position (simplified)
        const midX = (fromRoom.x + fromRoom.width / 2 + toRoom.x + toRoom.width / 2) / 2
        const midZ = (fromRoom.z + fromRoom.length / 2 + toRoom.z + toRoom.length / 2) / 2

        // Create door marker
        const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.1)
        const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 })
        const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial)
        doorMesh.position.set(midX, doorHeight / 2, midZ)
        scene.add(doorMesh)
      }
    })

    // Add windows
    modelData.windows.forEach((window) => {
      const { room, wall, width: windowWidth, height: windowHeight, position } = window

      // Find room
      const roomData = modelData.rooms.find((r) => r.name === room)

      if (roomData) {
        let x = 0,
          y = 0,
          z = 0
        let rotationY = 0

        // Position window based on wall
        switch (wall) {
          case "north":
            x = roomData.x + roomData.width * position
            y = windowHeight / 2 + 1 // 1m from floor
            z = roomData.z
            rotationY = Math.PI / 2
            break
          case "south":
            x = roomData.x + roomData.width * position
            y = windowHeight / 2 + 1
            z = roomData.z + roomData.length
            rotationY = Math.PI / 2
            break
          case "east":
            x = roomData.x + roomData.width
            y = windowHeight / 2 + 1
            z = roomData.z + roomData.length * position
            break
          case "west":
            x = roomData.x
            y = windowHeight / 2 + 1
            z = roomData.z + roomData.length * position
            break
        }

        // Create window
        const windowGeometry = new THREE.BoxGeometry(windowWidth, windowHeight, 0.1)
        const windowMaterial = new THREE.MeshBasicMaterial({
          color: 0x87ceeb,
          transparent: true,
          opacity: 0.6,
        })
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial)
        windowMesh.position.set(x, y, z)
        windowMesh.rotation.y = rotationY
        scene.add(windowMesh)
      }
    })

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [modelData])

  return <div ref={containerRef} className="w-full h-full" />
}

