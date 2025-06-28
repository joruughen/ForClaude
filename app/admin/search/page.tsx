"use client"

import type React from "react"

import { useState } from "react"
import type { CollectionItem } from "@/lib/types"
import { api } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ItemTable } from "@/components/admin/ItemTable"
import { Search, Database } from "lucide-react"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [collection, setCollection] = useState("mac_info")
  const [tipo, setTipo] = useState("")
  const [nResults, setNResults] = useState(5)
  const [results, setResults] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setHasSearched(true)

    try {
      const data = await api.admin.search(query, collection, tipo || undefined, nResults)
      // Tu backend devuelve { results: [...] }
      setResults(data.results || [])
    } catch (err) {
      console.error("Error searching:", err)
      alert("Error al realizar la búsqueda")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Search</h1>
        <p className="text-gray-600 mt-2">Busca en las collections del museo</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Query</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar obras, artistas, técnicas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Collection</label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="mac_info">mac_info</option>
              <option value="mac_images">mac_images</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo (opcional)</label>
            <Input placeholder="obra, zona, etc." value={tipo} onChange={(e) => setTipo(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resultados</label>
            <Input
              type="number"
              min="1"
              max="20"
              value={nResults}
              onChange={(e) => setNResults(Number.parseInt(e.target.value) || 5)}
            />
          </div>
        </div>

        <Button type="submit" disabled={loading || !query.trim()} className="bg-black text-white hover:bg-gray-800">
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {/* Results */}
      {hasSearched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-black">
              Resultados {results.length > 0 && `(${results.length})`}
            </h2>
          </div>

          {results.length > 0 ? (
            <ItemTable items={results} collectionName={collection} />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{loading ? "Buscando..." : "No se encontraron resultados"}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
