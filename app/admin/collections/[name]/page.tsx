"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Edit, RefreshCw, Trash2 } from "lucide-react"

import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/api"

interface CollectionItem {
  id: string
  metadata: Record<string, any>
  document: string
}

export default function CollectionDetailPage() {
  const params = useParams()
  const collectionName = params.name as string

  const [items, setItems] = useState<CollectionItem[]>([])
  const [filteredItems, setFilteredItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const { toast } = useToast()

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */

  const loadCollection = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiRequest<{ items: CollectionItem[] }>(
        `/admin/collections/${encodeURIComponent(collectionName)}`,
      )

      setItems(data.items || [])
      setFilteredItems(data.items || [])
    } catch (err: any) {
      setError(err.message || "Error al cargar la colección")
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm(`¿Eliminar item "${itemId}" de la colección "${collectionName}"?\nEsta acción no se puede deshacer.`))
      return

    try {
      await apiRequest(`/admin/collections/${encodeURIComponent(collectionName)}/items/${encodeURIComponent(itemId)}`, {
        method: "DELETE",
      })
      toast({ title: "Item eliminado correctamente", variant: "success" })
      loadCollection()
    } catch (err: any) {
      toast({
        title: "Error al eliminar",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const exportCollection = async () => {
    try {
      const data = await apiRequest(`/admin/collections/${encodeURIComponent(collectionName)}`)

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${collectionName}_export.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      toast({
        title: "Error al exportar",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  /* ------------------------------------------------------------------ */
  /* Effects                                                             */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    loadCollection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName])

  useEffect(() => {
    if (!search) {
      setFilteredItems(items)
      return
    }

    const term = search.toLowerCase()
    setFilteredItems(
      items.filter(
        (item) =>
          item.id.toLowerCase().includes(term) ||
          item.document.toLowerCase().includes(term) ||
          Object.values(item.metadata).some((v) => String(v).toLowerCase().includes(term)),
      ),
    )
  }, [search, items])

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 text-gray-500">Cargando colección…</div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8 space-y-4">
          <p className="text-red-600 font-medium">{error}</p>
          <Button onClick={loadCollection} variant="outline">
            Reintentar
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header ----------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/collections">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
            </Link>

            <div>
              <h1 className="text-3xl font-bold">{collectionName}</h1>
              <p className="text-gray-500">
                {items.length} items • {filteredItems.length} mostrados
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={exportCollection} variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Button onClick={loadCollection} variant="outline">
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Search ----------------------------------------------------- */}
        <Card>
          <CardContent className="pt-6">
            <Input
              placeholder="Buscar items por ID, metadata o documento…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Items list ------------------------------------------------- */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            {search ? "No se encontraron resultados." : "Esta colección está vacía."}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6 space-y-4">
                  {/* Card header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-blue-600">{item.id}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {item.metadata.tipo || "Sin tipo"}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/admin/collections/${encodeURIComponent(
                          collectionName,
                        )}/items/${encodeURIComponent(item.id)}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">📋 Metadata:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(item.metadata).map(([k, v]) => (
                        <div key={k} className="bg-gray-50 rounded p-3">
                          <div className="text-xs font-semibold uppercase text-gray-600">{k}</div>
                          <div className="text-sm break-words">
                            {typeof v === "object" ? JSON.stringify(v) : String(v)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document */}
                  <div className="bg-blue-50 rounded p-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">📄 Documento:</h4>
                    <p className="text-sm text-blue-900 leading-relaxed">{item.document}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Longitud&nbsp;
                      {item.document?.length ?? 0}&nbsp;caracteres
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
