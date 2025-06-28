"use client"

import { useState } from "react"
import type { CollectionItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"

interface ItemTableProps {
  items: CollectionItem[]
  collectionName: string
  onEdit?: (item: CollectionItem) => void
  onDelete?: (id: string) => void
}

export function ItemTable({ items, collectionName, onEdit, onDelete }: ItemTableProps) {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredItems = items.filter((item) =>
    Object.values(item).some((value) => value?.toString().toLowerCase().includes(search.toLowerCase())),
  )

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="text-sm text-gray-600 flex items-center">
          {filteredItems.length} de {items.length} items
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Título</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Artista</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Año</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono">{item.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.titulo || item.name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.artista || item.artist || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.año || item.year || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.tipo || item.type || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/collections/${collectionName}/items/${item.id}`}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
