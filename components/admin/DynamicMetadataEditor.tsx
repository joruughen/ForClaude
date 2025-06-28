"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api, type MetadataUpdate } from "@/lib/api"
import { Plus, Trash2, Save, AlertCircle } from "lucide-react"

interface DynamicMetadataEditorProps {
  collection: string
  itemId: string
  metadata: Record<string, any>
  onUpdate: () => void
}

const CORE_FIELDS = ["tipo", "titulo", "nombre", "artista", "zona", "descripcion"]
const SUGGESTED_FIELDS = [
  "precio_estimado",
  "estado_conservacion",
  "exposicion_actual",
  "fecha_adquisicion",
  "dimensiones",
  "materiales",
  "tecnica",
  "periodo_historico",
  "significado_cultural",
  "ubicacion_fisica",
]

export function DynamicMetadataEditor({ collection, itemId, metadata, onUpdate }: DynamicMetadataEditorProps) {
  const [editedMetadata, setEditedMetadata] = useState<Record<string, any>>(metadata)
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldValue, setNewFieldValue] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const coreFields = Object.entries(editedMetadata).filter(([key]) => CORE_FIELDS.includes(key))
  const customFields = Object.entries(editedMetadata).filter(([key]) => !CORE_FIELDS.includes(key))

  const updateField = async (fieldName: string, value: string) => {
    try {
      const metadataUpdate: MetadataUpdate = {
        metadata_updates: { [fieldName]: value },
        replace_all: false,
      }

      await api.admin.updateItemMetadata(collection, itemId, metadataUpdate)
      setEditedMetadata((prev) => ({ ...prev, [fieldName]: value }))
      onUpdate()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const addCustomField = async () => {
    if (!newFieldName || !newFieldValue) {
      setError("Nombre y valor del campo son requeridos")
      return
    }

    if (editedMetadata.hasOwnProperty(newFieldName)) {
      setError("Este campo ya existe")
      return
    }

    try {
      setSaving(true)
      setError(null)

      await api.admin.addItemField(collection, itemId, newFieldName, newFieldValue)

      setEditedMetadata((prev) => ({ ...prev, [newFieldName]: newFieldValue }))
      setNewFieldName("")
      setNewFieldValue("")
      onUpdate()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeField = async (fieldName: string) => {
    if (CORE_FIELDS.includes(fieldName)) {
      setError("No se pueden eliminar campos principales")
      return
    }

    if (!confirm(`¿Eliminar el campo "${fieldName}"?`)) return

    try {
      await api.admin.removeItemField(collection, itemId, fieldName)

      const newMetadata = { ...editedMetadata }
      delete newMetadata[fieldName]
      setEditedMetadata(newMetadata)
      onUpdate()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const saveAllChanges = async () => {
    try {
      setSaving(true)
      setError(null)

      const metadataUpdate: MetadataUpdate = {
        metadata_updates: editedMetadata,
        replace_all: true,
      }

      await api.admin.updateItemMetadata(collection, itemId, metadataUpdate)
      onUpdate()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Core Fields */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Campos Principales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coreFields.map(([key, value]) => (
            <div key={key}>
              <Label htmlFor={key} className="capitalize">
                {key}
              </Label>
              <Input
                id={key}
                value={value || ""}
                onChange={(e) => setEditedMetadata((prev) => ({ ...prev, [key]: e.target.value }))}
                onBlur={(e) => updateField(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Custom Fields */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Campos Personalizados</h3>
          <Badge variant="outline">{customFields.length} campos</Badge>
        </div>

        {customFields.length > 0 ? (
          <div className="space-y-3">
            {customFields.map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <Label className="w-32 text-sm font-medium capitalize">{key}:</Label>
                <Input
                  value={value || ""}
                  onChange={(e) => setEditedMetadata((prev) => ({ ...prev, [key]: e.target.value }))}
                  onBlur={(e) => updateField(key, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField(key)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay campos personalizados</p>
        )}
      </div>

      <Separator />

      {/* Add New Field */}
      <div>
        <h4 className="text-md font-semibold mb-4">Agregar Campo Personalizado</h4>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del campo"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Valor"
              value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addCustomField} disabled={!newFieldName || !newFieldValue || saving}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>

          {/* Field Suggestions */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Campos sugeridos:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_FIELDS.filter((field) => !editedMetadata.hasOwnProperty(field)).map((field) => (
                <Button
                  key={field}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setNewFieldName(field)}
                >
                  {field}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save All Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={saveAllChanges} disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar Todos los Cambios"}
        </Button>
      </div>
    </div>
  )
}
