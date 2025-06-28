"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Search, Filter, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const API_URL = "https://257c45-236-45-57.ngrok-free.app"

interface CollectionItem {
  id: string
  metadata: Record<string, any>
  document: string
}

interface Collection {
  name: string
  items: CollectionItem[]
}

export default function ItemsPage() {
  const [collections, setCollections] = useState<string[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [allItems, setAllItems] = useState<CollectionItem[]>([])
  const [filteredItems, setFilteredItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const loadCollections = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/collections`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      })
      const data = await response.json()
      const collectionNames = Array.isArray(data) ? data : []
      setCollections(collectionNames)
    } catch (err: any) {
      console.error("Error loading collections:", err)
      setError(err.message)
    }
  }

  const loadAllItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const items: CollectionItem[] = []

      if (selectedCollection === "all") {
        // Load items from all collections
        for (const collectionName of collections) {
          try {
            const response = await fetch(`${API_URL}/admin/collections/${collectionName}`, {
              headers: { "ngrok-skip-browser-warning": "true" },
            })
            const data = await response.json()
            if (data.items) {
              data.items.forEach((item: CollectionItem) => {
                items.push({ ...item, collection: collectionName })
              })
            }
          } catch (err) {
            console.warn(`Failed to load collection ${collectionName}:`, err)
          }
        }
      } else {
        // Load items from specific collection
        const response = await fetch(`${API_URL}/admin/collections/${selectedCollection}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        })
        const data = await response.json()
        if (data.items) {
          data.items.forEach((item: CollectionItem) => {
            items.push({ ...item, collection: selectedCollection })
          })
        }
      }

      setAllItems(items)
      setFilteredItems(items)
    } catch (err: any) {
      console.error("Error loading items:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  useEffect(() => {
    if (collections.length > 0) {
      loadAllItems()
    }
  }, [collections, selectedCollection])

  useEffect(() => {
    let items = allItems

    // Apply search filter
    if (search) {
      items = items.filter(
        (item) =>
          item.id.toLowerCase().includes(search.toLowerCase()) ||
          Object.values(item.metadata).some((value) => String(value).toLowerCase().includes(search.toLowerCase())) ||
          item.document.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Apply type filter
    if (typeFilter !== "all") {
      items = items.filter((item) => {
        const itemType = item.metadata.tipo || item.metadata.type || "sin_tipo"
        return itemType === typeFilter
      })
    }

    setFilteredItems(items)
  }, [allItems, search, typeFilter])

  const handleDeleteItem = async (item: CollectionItem & { collection: string }) => {
    if (!confirm(`¿Eliminar item ${item.id}? Esta acción no se puede deshacer.`)) return

    try {
      await fetch(`${API_URL}/admin/collections/${item.collection}/items/${item.id}`, {
        method: "DELETE",
        headers: { "ngrok-skip-browser-warning": "true" },
      })

      toast.success("Item eliminado correctamente")
      await loadAllItems()
    } catch (err: any) {
      console.error("Error deleting item:", err)
      toast.error(`Error al eliminar: ${err.message}`)
    }
  }

  const getAvailableTypes = () => {
    const types = new Set<string>()
    allItems.forEach((item) => {
      const type = item.metadata.tipo || item.metadata.type || "sin_tipo"
      types.add(type)
    })
    return Array.from(types).sort()
  }

  const getItemTitle = (item: CollectionItem) => {
    return item.metadata.titulo || item.metadata.nombre || item.metadata.name || item.id
  }

  const getItemSubtitle = (item: CollectionItem) => {
    return item.metadata.artista || item.metadata.artist || item.metadata.descripcion || "Sin descripción"
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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
            <h1 className="text-3xl font-bold text-gray-900">Items Management</h1>
            <p className="text-gray-600 mt-2">
              {filteredItems.length} de {allItems.length} items mostrados
            </p>
          </div>
          <Button onClick={loadAllItems} variant="outline">
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

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar colección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las colecciones</SelectItem>
                  {collections.map((collection) => (
                    <SelectItem key={collection} value={collection}>
                      {collection}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {getAvailableTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearch("")
                  setSelectedCollection("all")
                  setTypeFilter("all")
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={`${item.collection}-${item.id}`} className="overflow-hidden">
              <CardContent className="p-6">
                {/* Header del Item */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-blue-600">{item.id}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{item.metadata.tipo || item.metadata.type || "Sin tipo"}</Badge>
                      <Badge variant="secondary">{(item as any).collection}</Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/collections/${(item as any).collection}/items/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteItem(item as CollectionItem & { collection: string })}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>

                {/* Metadata Completa */}
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">📋 Metadata:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(item.metadata).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded p-3">
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{key}</div>
                        <div className="text-sm text-gray-900 mt-1 break-words">
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documento */}
                <div className="bg-blue-50 rounded p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">📄 Documento:</h4>
                  <p className="text-sm text-blue-900 leading-relaxed line-clamp-3">{item.document}</p>
                  <div className="mt-2 text-xs text-gray-500">Longitud: {item.document?.length || 0} caracteres</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search || typeFilter !== "all" ? "No se encontraron items" : "No hay items disponibles"}
            </h3>
            <p className="text-gray-500">
              {search || typeFilter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay items en las colecciones seleccionadas"}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
