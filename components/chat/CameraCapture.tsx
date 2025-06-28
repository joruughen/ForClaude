"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Camera, RotateCcw, Send, ArrowLeft } from "lucide-react"

interface CameraCaptureProps {
  onCapture: (file: File, message: string) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<{ file: File; preview: string } | null>(null)
  const [message, setMessage] = useState("")

  const startCamera = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error)
      setError("Error al acceder a la cámara. Verifica los permisos.")
    } finally {
      setIsLoading(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (!context) return

      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight

      context.drawImage(videoRef.current, 0, 0)

      canvasRef.current.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" })
            const preview = URL.createObjectURL(blob)
            setCapturedImage({ file, preview })
            stopCamera()
          }
        },
        "image/jpeg",
        0.8,
      )
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  const handleSend = () => {
    if (capturedImage && message.trim()) {
      onCapture(capturedImage.file, message.trim())
      onClose()
    }
  }

  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.preview)
      setCapturedImage(null)
      setMessage("")
      startCamera()
    }
  }

  useEffect(() => {
    if (!capturedImage) {
      startCamera()
    }
    return () => stopCamera()
  }, [facingMode, capturedImage])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-black">{capturedImage ? "Enviar Foto" : "Tomar Foto"}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Camera View or Captured Image */}
        <div className="relative">
          {capturedImage ? (
            // Show captured image with message input
            <div className="space-y-4 p-4">
              <div className="aspect-video relative rounded overflow-hidden">
                <img
                  src={capturedImage.preview || "/placeholder.svg"}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Escribe tu mensaje:</label>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="¿Qué quieres preguntar sobre esta imagen?"
                  className="w-full"
                  autoFocus
                />
                <p className="text-xs text-gray-500">
                  Ejemplo: "¿Qué obras son similares a esta?", "¿Qué técnica se usó aquí?", etc.
                </p>
              </div>
            </div>
          ) : (
            // Show camera view
            <>
              {isLoading && (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-gray-500">Iniciando cámara...</div>
                </div>
              )}

              {error && (
                <div className="aspect-video bg-red-50 flex items-center justify-center p-4">
                  <div className="text-red-600 text-center text-sm">{error}</div>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full aspect-video object-cover ${isLoading || error ? "hidden" : ""}`}
                onLoadedMetadata={() => setIsLoading(false)}
              />

              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Controls Overlay */}
              {!isLoading && !error && (
                <div className="absolute top-2 right-2">
                  <Button variant="outline" size="icon" onClick={switchCamera} className="bg-white/80 hover:bg-white">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3">
          {capturedImage ? (
            // Controls for captured image
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRetake} className="flex-1 bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tomar otra
              </Button>
              <Button
                onClick={handleSend}
                disabled={!message.trim()}
                className="flex-1 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          ) : (
            // Controls for camera
            <>
              <Button
                onClick={capturePhoto}
                disabled={isLoading || !!error}
                className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capturar Foto
              </Button>

              <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
                Cancelar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
