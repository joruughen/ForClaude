"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Copy, Trash2, Download, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Collection {
  name: string
  count: number
  description: string
}

interface CollectionCardProps {
  collection: Collection
  onDuplicate: (sourceName: string, newName: string) => void
  onDelete: (collectionName: string) => void
  onExport: (collectionName: string) => void
}

export function CollectionCard({ collection, onDuplicate, onDelete, onExport }: CollectionCardProps) {
  const [duplicateName, setDuplicateName] = useState(`${collection.name}_backup`)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)

  const handleDuplicate = () => {
    if (duplicateName.trim()) {
      onDuplicate(collection.name, duplicateName.trim())
      setIsDuplicateDialogOpen(false)
      setDuplicateName(`${collection.name}_backup`)
    }
  }

  const getStatusColor = () => {
    if (collection.count === 0) return "secondary"
    if (collection.count < 10) return "outline"
    return "default"
  }

  const getStatusText = () => {
    if (collection.count === 0) return "Empty"
    if (collection.count < 10) return "Low"
    return "Active"
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{collection.name}</CardTitle>
          </div>
          <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
        </div>
        <p className="text-sm text-gray-600">{collection.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Items:</span>
          <span className="font-semibold">{collection.count}</span>
        </div>

        <div className="flex flex-col gap-2">
          <Link href={`/admin/collections/${collection.name}`}>
            <Button variant="outline" className="w-full bg-transparent">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Colección
            </Button>
          </Link>

          <div className="grid grid-cols-3 gap-2">
            <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Copy className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Duplicar Colección</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nombre de la nueva colección:</label>
                    <Input
                      value={duplicateName}
                      onChange={(e) => setDuplicateName(e.target.value)}
                      placeholder="Nombre de la copia"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleDuplicate} disabled={!duplicateName.trim()}>
                      Duplicar
                    </Button>
                    <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={() => onExport(collection.name)}>
              <Download className="h-3 w-3" />
            </Button>

            <Button variant="destructive" size="sm" onClick={() => onDelete(collection.name)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
