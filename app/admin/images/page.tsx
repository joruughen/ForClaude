"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { api, type ImageItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Upload, Search, Filter, RefreshCw, Trash2, ExternalLink, ImageIcon, Eye } from "lucide-react"

export default function ImagesPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [zonaFilter, setZonaFilter] = useState("")
  const [artistaFilter, setArtistaFilter] = useState("")
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    obra_id: "",
    titulo: "",
    artista: "",
    zona: "",
    descripcion_visual: "",
  })

  const loadImages = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await api.admin.listImages(zonaFilter || undefined, artistaFilter || undefined)
      console.log("Images loaded:", data)

      setImages(data.images || [])
      setFilteredImages(data.images || [])
    } catch (err: any) {
      console.error("Error loading images:", err)
      setError(err.message || "Error al cargar las imágenes")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta imagen?")) return

    try {
      await api.admin.deleteImage(imageId)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
      setFilteredImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uploadForm.file || !uploadForm.obra_id || !uploadForm.titulo || !uploadForm.artista || !uploadForm.zona) {
      alert("Todos los campos son requeridos excepto la descripción visual")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", uploadForm.file)
      formData.append("obra_id", uploadForm.obra_id)
      formData.append("titulo", uploadForm.titulo)
      formData.append("artista", uploadForm.artista)
      formData.append("zona", uploadForm.zona)
      if (uploadForm.descripcion_visual) {
        formData.append("descripcion_visual", uploadForm.descripcion_visual)
      }

      await api.admin.uploadImage(formData)

      // Reset form
      setUploadForm({
        file: null,
        obra_id: "",
        titulo: "",
        artista: "",
        zona: "",
        descripcion_visual: "",
      })

      // Reload images
      await loadImages()
    } catch (err: any) {
      alert(`Error al subir imagen: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    loadImages()
  }, [zonaFilter, artistaFilter])

  useEffect(() => {
    const filtered = images.filter(
      (image) =>
        image.filename?.toLowerCase().includes(search.toLowerCase()) ||
        image.titulo?.toLowerCase().includes(search.toLowerCase()) ||
        image.artista?.toLowerCase().includes(search.toLowerCase()) ||
        image.zona?.toLowerCase().includes(search.toLowerCase()),
    )
    setFilteredImages(filtered)
  }, [search, images])

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Images</h1>
            <p className="text-gray-600 mt-2">Galería de imágenes del museo</p>
          </div>
          <div className="flex gap-2">
            {/* Upload Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Imagen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Subir Nueva Imagen</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="file">Archivo *</Label>
                    <Input
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="obra_id">ID de la Obra *</Label>
                    <Input
                      id="obra_id"
                      value={uploadForm.obra_id}
                      onChange={(e) => setUploadForm({ ...uploadForm, obra_id: e.target.value })}
                      placeholder="ID único de la obra"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={uploadForm.titulo}
                      onChange={(e) => setUploadForm({ ...uploadForm, titulo: e.target.value })}
                      placeholder="Título de la obra"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="artista">Artista *</Label>
                    <Input
                      id="artista"
                      value={uploadForm.artista}
                      onChange={(e) => setUploadForm({ ...uploadForm, artista: e.target.value })}
                      placeholder="Nombre del artista"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zona">Zona *</Label>
                    <Input
                      id="zona"
                      value={uploadForm.zona}
                      onChange={(e) => setUploadForm({ ...uploadForm, zona: e.target.value })}
                      placeholder="Zona del museo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="descripcion_visual">Descripción Visual</Label>
                    <Input
                      id="descripcion_visual"
                      value={uploadForm.descripcion_visual}
                      onChange={(e) => setUploadForm({ ...uploadForm, descripcion_visual: e.target.value })}
                      placeholder="Descripción visual (opcional)"
                    />
                  </div>
                  <Button type="submit" disabled={uploading} className="w-full">
                    {uploading ? "Subiendo..." : "Subir Imagen"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button onClick={loadImages} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">Debug Info</summary>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify({ API_BASE: api, images: images.slice(0, 2) }, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar imágenes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Input placeholder="Filtrar por zona..." value={zonaFilter} onChange={(e) => setZonaFilter(e.target.value)} />
          <Input
            placeholder="Filtrar por artista..."
            value={artistaFilter}
            onChange={(e) => setArtistaFilter(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => {
              setZonaFilter("")
              setArtistaFilter("")
              setSearch("")
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </Button>
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {filteredImages.length} de {images.length} imágenes
            </p>
          </div>

          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative bg-gray-100">
                    {/* Debug: Show raw URL */}
                    <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 z-10">
                      URL: {image.url}
                    </div>

                    {/* Try different image loading approaches */}
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.titulo || image.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Image failed to load:", image.url)
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg"
                      }}
                      onLoad={() => console.log("Image loaded successfully:", image.url)}
                    />

                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" onClick={() => setSelectedImage(image)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{selectedImage?.titulo || selectedImage?.filename}</DialogTitle>
                          </DialogHeader>
                          {selectedImage && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="aspect-square relative">
                                <img
                                  src={selectedImage.url || "/placeholder.svg"}
                                  alt={selectedImage.titulo || selectedImage.filename}
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900">Información</h3>
                                  <div className="space-y-2 mt-2">
                                    <p>
                                      <span className="font-medium">Título:</span> {selectedImage.titulo}
                                    </p>
                                    <p>
                                      <span className="font-medium">Artista:</span> {selectedImage.artista}
                                    </p>
                                    <p>
                                      <span className="font-medium">Zona:</span> {selectedImage.zona}
                                    </p>
                                    <p>
                                      <span className="font-medium">Obra ID:</span> {selectedImage.obra_id}
                                    </p>
                                    <p>
                                      <span className="font-medium">URL:</span> {selectedImage.url}
                                    </p>
                                    {selectedImage.tamaño && (
                                      <p>
                                        <span className="font-medium">Tamaño:</span> {selectedImage.tamaño}
                                      </p>
                                    )}
                                    {selectedImage.formato && (
                                      <p>
                                        <span className="font-medium">Formato:</span> {selectedImage.formato}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {selectedImage.descripcion_visual && (
                                  <div>
                                    <h3 className="font-semibold text-gray-900">Descripción Visual</h3>
                                    <p className="text-sm text-gray-600 mt-1">{selectedImage.descripcion_visual}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm text-gray-900 truncate">{image.titulo || image.filename}</h3>

                      <div className="flex flex-wrap gap-1">
                        {image.artista && (
                          <Badge variant="secondary" className="text-xs">
                            {image.artista}
                          </Badge>
                        )}
                        {image.zona && (
                          <Badge variant="outline" className="text-xs">
                            {image.zona}
                          </Badge>
                        )}
                      </div>

                      {image.descripcion_visual && (
                        <p className="text-xs text-gray-600 line-clamp-2">{image.descripcion_visual}</p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-500">{image.tamaño || "N/A"}</span>
                        <div className="flex gap-1">
                          <a
                            href={image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <button
                            onClick={() => handleDelete(image.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {search || zonaFilter || artistaFilter ? "No se encontraron imágenes" : "No hay imágenes disponibles"}
              </p>
              {images.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm">Ver datos crudos</summary>
                  <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(images.slice(0, 3), null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
