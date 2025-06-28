"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Trash2, Plus, X, Edit, Check } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const API_URL = "https://257c45-236-45-57.ngrok-free.app"

const CORE_FIELDS = [
  "titulo",
  "artista",
  "año",
  "tecnica",
  "descripcion",
  "ubicacion",
  "zona",
  "tipo",
  "name",
  "artist",
  "year",
  "technique",
  "description",
  "location",
  "zone",
  "type",
]

const SUGGESTED_FIELDS = [
  "precio_estimado",
  "estado_conservacion",
  "exposicion_actual",
  "fecha_adquisicion",
  "ubicacion_fisica",
  "prestado_a",
  "valor_asegurado",
  "fecha_restauracion",
  "procedencia",
]

interface CollectionItem {
  id: string
  metadata: Record<string, any>
  document: string
}

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const collectionName = params.name as string
  const itemId = params.id as string

  const [item, setItem] = useState<CollectionItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Editing states
  const [isEditingField, setIsEditingField] = useState<Record<string, boolean>>({})
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [documentText, setDocumentText] = useState("")

  // New field state
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldValue, setNewFieldValue] = useState("")
  const [isAddingField, setIsAddingField] = useState(false)

  const loadItem = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/admin/collections/${collectionName}/items/${itemId}`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setItem(data)
      setDocumentText(data.document || "")

      // Initialize field values for editing
      const initialValues: Record<string, string> = {}
      Object.entries(data.metadata || {}).forEach(([key, value]) => {
        initialValues[key] = String(value)
      })
      setFieldValues(initialValues)
    } catch (err: any) {
      console.error("Error loading item:", err)
      setError(err.message || "Error al cargar el item")
    } finally {
      setLoading(false)
    }
  }, [collectionName, itemId])

  useEffect(() => {
    if (collectionName && itemId) {
      loadItem()
    }
  }, [collectionName, itemId, loadItem])

  const updateSingleField = async (fieldName: string, newValue: string) => {
    try {
      setSaving(true)
      const metadataUpdate = {
        metadata_updates: { [fieldName]: newValue },
        replace_all: false,
      }

      const response = await fetch(`${API_URL}/admin/collections/${collectionName}/items/${itemId}/metadata`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(metadataUpdate),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }

      await loadItem()
      setIsEditingField((prev) => ({ ...prev, [fieldName]: false }))
      toast.success(`Campo "${fieldName}" actualizado`)
    } catch (error: any) {
      console.error("Error updating field:", error)
      toast.error(`Error al actualizar campo: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const addCustomField = async () => {
    if (!newFieldName.trim() || !newFieldValue.trim()) {
      toast.error("Por favor ingresa nombre y valor del campo")
      return
    }

    if (item?.metadata[newFieldName.trim()]) {
      toast.error("Este campo ya existe")
      return
    }

    try {
      setSaving(true)
      const formData = new FormData()
      formData.append("field_name", newFieldName.trim())
      formData.append("field_value", newFieldValue.trim())

      const response = await fetch(`${API_URL}/admin/collections/${collectionName}/items/${itemId}/add-field`, {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "true" },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }

      setNewFieldName("")
      setNewFieldValue("")
      setIsAddingField(false)
      await loadItem()
      toast.success("Campo agregado correctamente")
    } catch (error: any) {
      console.error("Error adding field:", error)
      toast.error(`Error al agregar campo: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const removeField = async (fieldName: string) => {
    if (CORE_FIELDS.includes(fieldName)) {
      toast.error("No se pueden eliminar campos esenciales")
      return
    }

    if (!confirm(`¿Eliminar el campo "${fieldName}"?`)) return

    try {
      setSaving(true)
      const response = await fetch(
        `${API_URL}/admin/collections/${collectionName}/items/${itemId}/field/${fieldName}`,
        {
          method: "DELETE",
          headers: { "ngrok-skip-browser-warning": "true" },
        },
      )

      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }

      await loadItem()
      toast.success(`Campo "${fieldName}" eliminado`)
    } catch (error: any) {
      console.error("Error removing field:", error)
      toast.error(`Error al eliminar campo: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const updateDocument = async () => {
    try {
      setSaving(true)
      const documentUpdate = {
        new_document: documentText,
        regenerate_embedding: true,
      }

      const response = await fetch(`${API_URL}/admin/collections/${collectionName}/items/${itemId}/document`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(documentUpdate),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }

      await loadItem()
      toast.success("Documento actualizado y embedding regenerado")
    } catch (error: any) {
      console.error("Error updating document:", error)
      toast.error(`Error al actualizar documento: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async () => {
    if (!confirm(`¿ELIMINAR COMPLETAMENTE el item "${item?.id}"? Esta acción NO se puede deshacer.`)) return

    try {
      const response = await fetch(`${API_URL}/admin/collections/${collectionName}/items/${itemId}`, {
        method: "DELETE",
        headers: { "ngrok-skip-browser-warning": "true" },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }

      toast.success("Item eliminado")
      router.push(`/admin/collections/${collectionName}`)
    } catch (error: any) {
      console.error("Error deleting item:", error)
      toast.error(`Error al eliminar: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">{error || "Item no encontrado"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link
              href={`/admin/collections/${collectionName}`}
              className="flex items-center gap-2 text-gray-600 hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              {collectionName}
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{item.id}</h1>
          <Badge variant="outline" className="mt-2">
            {item.metadata.tipo || item.metadata.type || "Sin tipo"}
          </Badge>
        </div>
      </div>

      {/* Metadata Editable */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">📋 Metadata (Editable)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(item.metadata).map(([fieldName, fieldValue]) => (
            <div key={fieldName} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              {!isEditingField[fieldName] ? (
                <>
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{fieldName}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900 break-words">
                        {typeof fieldValue === "object" ? JSON.stringify(fieldValue) : String(fieldValue)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingField((prev) => ({ ...prev, [fieldName]: true }))
                        setFieldValues((prev) => ({ ...prev, [fieldName]: String(fieldValue) }))
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>

                    {!CORE_FIELDS.includes(fieldName) && (
                      <Button size="sm" variant="destructive" onClick={() => removeField(fieldName)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{fieldName}</Label>
                    <Input
                      value={fieldValues[fieldName] || ""}
                      onChange={(e) => setFieldValues((prev) => ({ ...prev, [fieldName]: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          updateSingleField(fieldName, fieldValues[fieldName])
                        }
                      }}
                      className="mt-1"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateSingleField(fieldName, fieldValues[fieldName])}
                      disabled={saving}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingField((prev) => ({ ...prev, [fieldName]: false }))}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Agregar Campo Personalizado */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-lg">➕ Agregar Campo Personalizado</CardTitle>
        </CardHeader>
        <CardContent>
          {!isAddingField ? (
            <Button onClick={() => setIsAddingField(true)} className="bg-green-500 hover:bg-green-600">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Campo
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del Campo</Label>
                  <Input
                    placeholder="ej: precio_estimado"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Valor</Label>
                  <Input
                    placeholder="ej: $50,000"
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") addCustomField()
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addCustomField} disabled={!newFieldName.trim() || !newFieldValue.trim() || saving}>
                  ➕ Agregar Campo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingField(false)
                    setNewFieldName("")
                    setNewFieldValue("")
                  }}
                >
                  Cancelar
                </Button>
              </div>

              {/* Sugerencias */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Campos comunes:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_FIELDS.map((field) => (
                    <Button
                      key={field}
                      variant="outline"
                      size="sm"
                      onClick={() => setNewFieldName(field)}
                      className="text-xs"
                    >
                      {field}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor de Documento */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">📄 Documento (Texto para Búsqueda)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            className="min-h-32 font-mono text-sm"
            placeholder="Texto del documento que se usa para búsquedas semánticas..."
          />

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {documentText.length} caracteres | Embedding se regenerará automáticamente
            </p>
            <Button onClick={updateDocument} disabled={saving} className="bg-blue-500 hover:bg-blue-600">
              💾 Actualizar Documento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zona Peligrosa */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-lg text-red-800">⚠️ Zona Peligrosa</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={deleteItem} variant="destructive" className="bg-red-600 hover:bg-red-700">
            🗑️ ELIMINAR ITEM COMPLETO
          </Button>
          <p className="text-sm text-red-600 mt-2">
            Esta acción eliminará permanentemente el item y no se puede deshacer.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
