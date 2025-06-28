"use client"

import { useState } from "react"
import type { ImageUploadResult } from "@/lib/types"
import { api } from "@/lib/api"
import { ImageUpload } from "@/components/admin/ImageUpload"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function UploadPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImageUploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await api.admin.uploadImage(formData)
      setResult(data)
    } catch (err: any) {
      console.error("Error uploading image:", err)
      setError(err.message || "Error al subir la imagen")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Upload Image</h1>
        <p className="text-gray-600 mt-2">Sube imágenes al sistema del museo</p>
      </div>

      {/* Upload Form */}
      <div className="max-w-2xl">
        <ImageUpload onUpload={handleUpload} loading={loading} />
      </div>

      {/* Results */}
      {result && (
        <div className="max-w-2xl bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 mb-2">¡Imagen subida correctamente!</h3>
              <div className="space-y-2 text-sm text-green-700">
                <p>
                  <strong>ID:</strong> {result.id}
                </p>
                <p>
                  <strong>Filename:</strong> {result.filename}
                </p>
                {result.zona && (
                  <p>
                    <strong>Zona:</strong> {result.zona}
                  </p>
                )}
                {result.artista && (
                  <p>
                    <strong>Artista:</strong> {result.artista}
                  </p>
                )}
                {result.url && (
                  <p>
                    <strong>URL:</strong>{" "}
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      Ver imagen
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-2xl bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">Error al subir imagen</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="max-w-2xl bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-black mb-3">Instrucciones</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Formatos soportados: PNG, JPG, JPEG</li>
          <li>• Tamaño máximo: 10MB</li>
          <li>• La zona y artista son opcionales pero recomendados para mejor organización</li>
          <li>• Las imágenes se procesan automáticamente para búsqueda visual</li>
        </ul>
      </div>
    </div>
  )
}
