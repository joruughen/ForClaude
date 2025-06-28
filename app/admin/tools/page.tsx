"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, BarChart3, RefreshCw } from "lucide-react"

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState("search")
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchCollection, setSearchCollection] = useState("mac_info")
  const [searchTipo, setSearchTipo] = useState("all") // Updated default value to "all"
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.admin.getAnalytics()
      setAnalytics(data)
    } catch (err: any) {
      console.error("Error loading analytics:", err)
      setError(err.message || "Error al cargar analytics")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setSearching(true)
      const results = await api.admin.search(searchQuery, searchCollection, searchTipo || undefined, 10)
      setSearchResults(results.results || [])
    } catch (err: any) {
      alert(`Error en búsqueda: ${err.message}`)
    } finally {
      setSearching(false)
    }
  }

  const handleExport = async (collectionName: string) => {
    try {
      const data = await api.admin.exportCollection(collectionName)

      // Crear y descargar archivo JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${collectionName}_export.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(`Error al exportar: ${err.message}`)
    }
  }

  useEffect(() => {
    if (activeTab === "analytics") {
      loadAnalytics()
    }
  }, [activeTab])

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tools</h1>
          <p className="text-gray-600 mt-2">Herramientas de búsqueda, analytics y exportación</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Búsqueda
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Búsqueda Semántica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Input
                        placeholder="Buscar en el museo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Select value={searchCollection} onValueChange={setSearchCollection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar colección" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mac_info">MAC Info</SelectItem>
                          <SelectItem value="mac_images">MAC Images</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select value={searchTipo} onValueChange={setSearchTipo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los tipos</SelectItem>
                          <SelectItem value="obra">Obra</SelectItem>
                          <SelectItem value="zona">Zona</SelectItem>
                          <SelectItem value="artista">Artista</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" disabled={searching} className="w-full">
                    {searching ? "Buscando..." : "Buscar"}
                  </Button>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Resultados ({searchResults.length})</h3>
                    <div className="space-y-3">
                      {searchResults.map((result, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">
                                {result.metadata?.titulo || result.metadata?.nombre || `Resultado ${index + 1}`}
                              </h4>
                              <Badge variant="outline">Score: {(result.distance || 0).toFixed(3)}</Badge>
                            </div>
                            {result.metadata?.artista && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Artista:</span> {result.metadata.artista}
                              </p>
                            )}
                            {result.metadata?.zona && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Zona:</span> {result.metadata.zona}
                              </p>
                            )}
                            {result.document && <p className="text-sm text-gray-700 line-clamp-3">{result.document}</p>}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Analytics del Sistema</h2>
                <Button onClick={loadAnalytics} variant="outline" disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-gray-900">{analytics.total_collections}</div>
                      <p className="text-sm text-gray-600">Total Collections</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-gray-900">{analytics.total_items}</div>
                      <p className="text-sm text-gray-600">Total Items</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-gray-900">{analytics.total_images}</div>
                      <p className="text-sm text-gray-600">Total Images</p>
                    </CardContent>
                  </Card>

                  {/* Collections Detail */}
                  {Object.entries(analytics.collections_detail || {}).map(([name, details]: [string, any]) => (
                    <Card key={name}>
                      <CardHeader>
                        <CardTitle className="text-lg">{name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Items:</span>
                            <Badge variant="secondary">{details.total_items || 0}</Badge>
                          </div>
                          {details.description && <p className="text-xs text-gray-500">{details.description}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay datos de analytics disponibles</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Collections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Exporta collections completas en formato JSON para backup o análisis.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">MAC Info</h3>
                    <p className="text-sm text-gray-600 mb-4">Información de obras, zonas y artistas del museo</p>
                    <Button onClick={() => handleExport("mac_info")} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar MAC Info
                    </Button>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">MAC Images</h3>
                    <p className="text-sm text-gray-600 mb-4">Metadata de todas las imágenes del museo</p>
                    <Button onClick={() => handleExport("mac_images")} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar MAC Images
                    </Button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
