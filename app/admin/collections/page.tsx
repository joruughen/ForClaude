"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { CollectionCard } from "@/components/admin/CollectionCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Search } from "lucide-react"
import { toast } from "sonner"
import { API_BASE } from "@/lib/api"

interface Collection {
  name: string
  count: number
  description: string
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [analytics, setAnalytics] = useState<any>(null)

  const loadCollections = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load collections list
      const collectionsResponse = await fetch(`${API_BASE}/admin/collections`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      })
      const collectionsData = await collectionsResponse.json()

      // Load analytics for counts
      const analyticsResponse = await fetch(`${API_BASE}/admin/analytics`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      })
      const analyticsData = await analyticsResponse.json()
      setAnalytics(analyticsData)

      // Combine data
      const collectionsWithCounts = Array.isArray(collectionsData)
        ? collectionsData.map((name: string) => ({
            name,
            count: analyticsData.collections_detail?.[name]?.total_items || 0,
            description: getCollectionDescription(name),
          }))
        : []

      setCollections(collectionsWithCounts)
      setFilteredCollections(collectionsWithCounts)
    } catch (err: any) {
      console.error("Error loading collections:", err)
      setError(err.message || "Error al cargar las colecciones")
    } finally {
      setLoading(false)
    }
  }

  const getCollectionDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      mac_info: "Información principal de obras y zonas del museo",
      mac_images: "Imágenes y recursos visuales de las obras",
      mac_backup: "Respaldo de datos del museo",
    }
    return descriptions[name] || "Colección del museo"
  }

  const handleDuplicateCollection = async (sourceName: string, newName: string) => {
    try {
      await fetch(`${API_BASE}/admin/collections/${sourceName}/duplicate?new_collection_name=${newName}`, {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "true" },
      })

      toast.success(`Colección "${sourceName}" duplicada como "${newName}"`)
      await loadCollections()
    } catch (err: any) {
      console.error("Error duplicating collection:", err)
      toast.error(`Error al duplicar colección: ${err.message}`)
    }
  }

  const handleDeleteCollection = async (collectionName: string) => {
    if (!confirm(`¿Eliminar colección "${collectionName}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      await fetch(`${API_BASE}/admin/collections/${collectionName}?confirm=true`, {
        method: "DELETE",
        headers: { "ngrok-skip-browser-warning": "true" },
      })

      toast.success(`Colección "${collectionName}" eliminada`)
      await loadCollections()
    } catch (err: any) {
      console.error("Error deleting collection:", err)
      toast.error(`Error al eliminar colección: ${err.message}`)
    }
  }

  const handleExportCollection = async (collectionName: string) => {
    try {
      const response = await fetch(`${API_BASE}/admin/export/${collectionName}`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      })
      const data = await response.json()

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${collectionName}_export.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Colección "${collectionName}" exportada`)
    } catch (err: any) {
      console.error("Error exporting collection:", err)
      toast.error(`Error al exportar colección: ${err.message}`)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  useEffect(() => {
    if (search) {
      setFilteredCollections(
        collections.filter((collection) => collection.name.toLowerCase().includes(search.toLowerCase())),
      )
    } else {
      setFilteredCollections(collections)
    }
  }, [collections, search])

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
            <p className="text-gray-600 mt-2">Gestiona las colecciones de ChromaDB del museo</p>
          </div>
          <Button onClick={loadCollections} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar colecciones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.name}
              collection={collection}
              onDuplicate={handleDuplicateCollection}
              onDelete={handleDeleteCollection}
              onExport={handleExportCollection}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredCollections.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? "No se encontraron colecciones" : "No hay colecciones disponibles"}
            </h3>
            <p className="text-gray-500">
              {search
                ? "Intenta ajustar el término de búsqueda"
                : "Las colecciones aparecerán aquí cuando estén disponibles"}
            </p>
          </div>
        )}

        {/* Summary */}
        {analytics && (
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.total_collections}</div>
                  <div className="text-sm text-gray-600">Colecciones Totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(analytics.collections_detail || {}).reduce(
                      (sum: number, col: any) => sum + (col.total_items || 0),
                      0,
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Items Totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.collections_detail?.mac_images?.total_items || 0}
                  </div>
                  <div className="text-sm text-gray-600">Imágenes Totales</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
