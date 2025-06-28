"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onUpload: (formData: FormData) => void
  loading?: boolean
}

export function ImageUpload({ onUpload, loading }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [zona, setZona] = useState("")
  const [artista, setArtista] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find((file) => file.type.startsWith("image/"))
    if (imageFile) {
      handleFileSelect(imageFile)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    const formData = new FormData()
    formData.append("file", selectedFile)
    if (zona) formData.append("zona", zona)
    if (artista) formData.append("artista", artista)

    onUpload(formData)
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Preview"
                width={200}
                height={150}
                className="rounded object-cover"
              />
              <button
                type="button"
                onClick={clearSelection}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <p className="text-sm text-gray-600">{selectedFile?.name}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">Arrastra una imagen aquí</p>
              <p className="text-sm text-gray-600">
                o{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-black underline hover:no-underline"
                >
                  selecciona un archivo
                </button>
              </p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, JPEG hasta 10MB</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }}
        className="hidden"
      />

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Zona (opcional)</label>
          <Input value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Ej: Sala Principal" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Artista (opcional)</label>
          <Input value={artista} onChange={(e) => setArtista(e.target.value)} placeholder="Ej: Fernando Bryce" />
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={!selectedFile || loading}
        className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
      >
        {loading ? (
          "Subiendo..."
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Subir Imagen
          </>
        )}
      </Button>
    </form>
  )
}
