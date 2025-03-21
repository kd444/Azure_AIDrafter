"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Send, Trash } from "lucide-react"

export function VoiceInput({ projectId }: { projectId: string }) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    // Check if SpeechRecognition is available
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()

      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = "en-US"

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)
      }

      recognitionInstance.onend = () => {
        if (listening) {
          recognitionInstance.start()
        }
      }

      setRecognition(recognitionInstance)
    }

    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [listening])

  const toggleListening = () => {
    if (!recognition) return

    if (listening) {
      recognition.stop()
      setListening(false)
    } else {
      setListening(true)
      recognition.start()
    }
  }

  const clearTranscript = () => {
    setTranscript("")
  }

  const sendVoiceDescription = () => {
    if (!transcript.trim()) return

    // Here you would send the transcript to your AI system
    console.log("Sending voice description:", transcript)

    // Clear the transcript after sending
    clearTranscript()
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Voice Description</h3>
            <div className="flex space-x-2">
              <Button
                variant={listening ? "destructive" : "outline"}
                size="sm"
                className="gap-1"
                onClick={toggleListening}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {listening ? "Stop Recording" : "Start Recording"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={clearTranscript}
                disabled={!transcript}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative flex-1">
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Speak or type your design description here..."
              className="h-full min-h-[200px] resize-none"
            />
            {listening && (
              <div className="absolute bottom-4 right-4 flex items-center text-sm text-red-500 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Recording...
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button className="gap-1" onClick={sendVoiceDescription} disabled={!transcript.trim()}>
              <Send className="h-4 w-4" />
              Send Description
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

