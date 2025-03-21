"use client"

import { useState } from "react"
import { Tab } from "@headlessui/react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Canvas } from "@react-three/fiber"
import { useGLTF, OrbitControls } from "@react-three/drei"
import { Suspense } from "react"

function Model({ modelData }: { modelData: any }) {
  if (!modelData) return null

  const { nodes, materials } = useGLTF(modelData) as any

  return (
    <group dispose={null}>
      <mesh geometry={nodes.Cube.geometry} material={materials.Material} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

function ModelViewer({ modelData }: { modelData: any }) {
  return (
    <Canvas camera={{ position: [5, 5, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 5, 5]} />
      <Suspense fallback={null}>
        <Model modelData={modelData} />
      </Suspense>
      <OrbitControls />
    </Canvas>
  )
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ")
}

export default function CADGenerator() {
  const [prompt, setPrompt] = useState("")
  const [generatedModel, setGeneratedModel] = useState<any>(null)
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("prompt")

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    try {
      // Call our API endpoint
      const response = await fetch("/api/cad-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate model")
      }

      const data = await response.json()

      setGeneratedModel(data.modelData)
      setGeneratedCode(data.code)
      setActiveTab("visual")
    } catch (error) {
      console.error("Error generating model:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold">CAD Model Generator</h1>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="relative">
                  <input
                    type="text"
                    className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:borer-rose-600"
                    placeholder="Enter a prompt to generate a CAD model"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <label className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">
                    Prompt
                  </label>
                </div>
                <div className="relative">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>
              <div className="pt-6 text-base leading-6 font-bold sm:text-lg sm:leading-7">
                <Tab.Group
                  selectedIndex={activeTab === "prompt" ? 0 : activeTab === "visual" ? 1 : 2}
                  onChange={(index) => {
                    if (index === 0) setActiveTab("prompt")
                    else if (index === 1) setActiveTab("visual")
                    else setActiveTab("code")
                  }}
                >
                  <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 p-1">
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                          "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                          selected ? "bg-white shadow" : "text-blue-100 hover:bg-white/[0.12] hover:text-white",
                        )
                      }
                    >
                      Prompt
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                          "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                          selected ? "bg-white shadow" : "text-blue-100 hover:bg-white/[0.12] hover:text-white",
                        )
                      }
                    >
                      Visual
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                          "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                          selected ? "bg-white shadow" : "text-blue-100 hover:bg-white/[0.12] hover:text-white",
                        )
                      }
                    >
                      Code
                    </Tab>
                  </Tab.List>
                  <Tab.Panels className="mt-2">
                    <Tab.Panel>{/* <p>This is where the prompt input will be.</p> */}</Tab.Panel>
                    <Tab.Panel>{generatedModel && <ModelViewer modelData={generatedModel} />}</Tab.Panel>
                    <Tab.Panel>
                      {generatedCode && (
                        <SyntaxHighlighter language="javascript" style={dracula}>
                          {generatedCode}
                        </SyntaxHighlighter>
                      )}
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

