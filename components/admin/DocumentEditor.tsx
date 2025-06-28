"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import { Save, RefreshCw, AlertCircle, FileText } from "lucide-react"

interface DocumentEditorProps {
  collection: string
  itemId: string
  document: string
  onUpdate: () => void
}

export function DocumentEditor({ collection, itemId, document, onUpdate }: DocumentEditorProps) {
  const [editedDocument, setEditedDocument] = useState(document)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const handleDocumentChange = (value: string) => {
    setEditedDocument(value)
    setHasChanges(value !== document)
  }

  const saveDocument = async () => {
    try {
      setSaving(true)
      setError(null)

      await api.admin.updateItemDocument(collection, itemId, editedDocument)
      setHasChanges(false)
      onUpdate()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const resetDocument = () => {
    setEditedDocument(document)
    setHasChanges(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documento
        </Label>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={resetDocument}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Descartar
            </Button>
          )}
          <Button onClick={saveDocument} disabled={!hasChanges || saving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Textarea
          value={editedDocument}
          onChange={(e) => handleDocumentChange(e.target.value)}
          rows={12}
          className="font-mono text-sm"
          placeholder="Contenido del documento que se usa para generar embeddings..."
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{editedDocument.length} caracteres</span>
          {hasChanges && <span className="text-orange-600">• Cambios sin guardar</span>}
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Este documento se usa para generar los embeddings que permiten la búsqueda semántica. Los cambios afectarán
          cómo se encuentra este item en las búsquedas.
        </AlertDescription>
      </Alert>
    </div>
  )
}
