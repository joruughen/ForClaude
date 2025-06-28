"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { api, type BulkOperation } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Zap, CheckSquare, Trash2, Edit3, Move, AlertTriangle, RefreshCw, Play } from "lucide-react"

interface CollectionItem {
  id: string
  metadata: Record<string, any>
  document: string
}

interface BulkResult {
  success_count: number
  error_count: number
  errors?: string[]
}

export default function BulkOperationsPage() {
  const [collections, setCollections] = useState<string[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>("")
  const [items, setItems] = useState<CollectionItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BulkResult | null>(null)

  // Operation configuration
  const [operation, setOperation] = useState<"update_metadata" | "delete" | "move_zone">("update_metadata")
  const [operationData, setOperationData] = useState<Record<string, any>>({})
  const [metadataFields, setMetadataFields] = useState<Array<{ key: string; value: string }>>([{ key: "", value: "" }])

  const loadCollections = async () => {
    try {
      const data = await api.admin.getCollections()
      const collectionNames = data.map((col: any) => col.name)
      setCollections(collectionNames)
      if (collectionNames.length > 0 && !selectedCollection) {
        setSelectedCollection(collectionNames[0])
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const loadItems = async () => {
    if (!selectedCollection) return

    try {
      setLoading(true)
      setError(null)
      const data = await api.admin.getCollection(selectedCollection)
      setItems(data.items || [])
      setSelectedItems([])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const executeBulkOperation = async () => {
    if (selectedItems.length === 0) {
      alert("Selecciona al menos un item")
      return
    }

    let finalOperationData = operationData

    if (operation === "update_metadata") {
      finalOperationData = {}
      metadataFields.forEach((field) => {
        if (field.key && field.value) {
          finalOperationData[field.key] = field.value
        }
      })

      if (Object.keys(finalOperationData).length === 0) {
        alert("Agrega al menos un campo de metadata")
        return
      }
    }

    const confirmMessage =
      operation === "delete"
        ? `¿Eliminar ${selectedItems.length} items? Esta acción no se puede deshacer.`
        : `¿Ejecutar operación "${operation}" en ${selectedItems.length} items?`

    if (!confirm(confirmMessage)) return

    try {
      setExecuting(true)
      setResult(null)

      const bulkOp: BulkOperation = {
        item_ids: selectedItems,
        operation,
        operation_data: finalOperationData,
      }

      const result = await api.admin.bulkOperation(selectedCollection, bulkOp)
      setResult(result)

      if (result.success_count > 0) {
        await loadItems() // Reload items to see changes
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setExecuting(false)
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const selectAllItems = () => {
    setSelectedItems(items.map((item) => item.id))
  }

  const deselectAllItems = () => {
    setSelectedItems([])
  }

  const addMetadataField = () => {
    setMetadataFields((prev) => [...prev, { key: "", value: "" }])
  }

  const updateMetadataField = (index: number, key: string, value: string) => {
    setMetadataFields((prev) => prev.map((field, i) => (i === index ? { key, value } : field)))
  }

  const removeMetadataField = (index: number) => {
    setMetadataFields((prev) => prev.filter((_, i) => i !== index))
  }

  const getItemTitle = (item: CollectionItem) => {
    return item.metadata.titulo || item.metadata.nombre || item.id
  }

  const getItemSubtitle = (item: CollectionItem) => {
    return item.metadata.artista || item.metadata.tipo || "Sin descripción"
  }

  useEffect(() => {
    loadCollections()
  }, [])

  useEffect(() => {
    if (selectedCollection) {
      loadItems()
    }
  }, [selectedCollection])

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Operations</h1>
            <p className="text-gray-600 mt-2">Ejecuta operaciones en múltiples items a la vez</p>
          </div>
          <Button onClick={loadItems} variant="outline" disabled={!selectedCollection}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Result State */}
        {result && (
          <Alert variant={result.error_count > 0 ? "destructive" : "default"}>
            <AlertDescription>
              Operación completada: {result.success_count} exitosos, {result.error_count} errores
              {result.errors && result.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer">Ver errores</summary>
                  <ul className="mt-1 text-sm">
                    {result.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Seleccionar Items
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllItems}>
                      Todos
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAllItems}>
                      Ninguno
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Seleccionar colección" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection} value={collection}>
                          {collection}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge variant="outline">
                    {selectedItems.length} de {items.length} seleccionados
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center gap-3">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : items.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleItemSelection(item.id)}
                      >
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{getItemTitle(item)}</p>
                          <p className="text-sm text-gray-600 truncate">{getItemSubtitle(item)}</p>
                        </div>
                        {item.metadata.tipo && (
                          <Badge variant="secondary" className="text-xs">
                            {item.metadata.tipo}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    {selectedCollection ? "No hay items en esta colección" : "Selecciona una colección"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Operation Configuration */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Configurar Operación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Operation Type */}
                <div>
                  <Label>Tipo de Operación</Label>
                  <Select value={operation} onValueChange={(value: any) => setOperation(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="update_metadata">
                        <div className="flex items-center gap-2">
                          <Edit3 className="h-4 w-4" />
                          Actualizar Metadata
                        </div>
                      </SelectItem>
                      <SelectItem value="move_zone">
                        <div className="flex items-center gap-2">
                          <Move className="h-4 w-4" />
                          Cambiar Zona
                        </div>
                      </SelectItem>
                      <SelectItem value="delete">
                        <div className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Eliminar Items
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Operation-specific configuration */}
                {operation === "update_metadata" && (
                  <div className="space-y-3">
                    <Label>Campos a Actualizar</Label>
                    {metadataFields.map((field, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Campo"
                          value={field.key}
                          onChange={(e) => updateMetadataField(index, e.target.value, field.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Valor"
                          value={field.value}
                          onChange={(e) => updateMetadataField(index, field.key, e.target.value)}
                          className="flex-1"
                        />
                        {metadataFields.length > 1 && (
                          <Button variant="outline" size="sm" onClick={() => removeMetadataField(index)}>
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addMetadataField}>
                      + Agregar Campo
                    </Button>

                    {/* Common field suggestions */}
                    <div className="text-sm">
                      <p className="text-gray-600 mb-2">Campos comunes:</p>
                      <div className="flex flex-wrap gap-1">
                        {["estado_conservacion", "precio_estimado", "exposicion_actual", "fecha_adquisicion"].map(
                          (field) => (
                            <Button
                              key={field}
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6"
                              onClick={() => {
                                const emptyIndex = metadataFields.findIndex((f) => !f.key)
                                if (emptyIndex >= 0) {
                                  updateMetadataField(emptyIndex, field, "")
                                } else {
                                  setMetadataFields((prev) => [...prev, { key: field, value: "" }])
                                }
                              }}
                            >
                              {field}
                            </Button>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {operation === "move_zone" && (
                  <div>
                    <Label>Nueva Zona</Label>
                    <Input
                      placeholder="Nombre de la nueva zona"
                      value={operationData.new_zone || ""}
                      onChange={(e) => setOperationData({ new_zone: e.target.value })}
                    />
                  </div>
                )}

                {operation === "delete" && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Esta operación eliminará permanentemente los items seleccionados. No se puede deshacer.
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />

                {/* Execute Button */}
                <Button
                  onClick={executeBulkOperation}
                  disabled={selectedItems.length === 0 || executing}
                  className="w-full"
                  variant={operation === "delete" ? "destructive" : "default"}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {executing ? "Ejecutando..." : `Ejecutar en ${selectedItems.length} items`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
