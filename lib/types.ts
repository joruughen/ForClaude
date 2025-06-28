// Tipos TypeScript para el proyecto
export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
  imageUrl?: string
  relevantWorks?: any[]
}

export interface Collection {
  name: string
  count: number
  description?: string
}

export interface CollectionItem {
  id: string
  titulo?: string
  artista?: string
  año?: string
  tecnica?: string
  descripcion?: string
  ubicacion?: string
  zona?: string
  tipo?: string
  [key: string]: any
}

export interface ImageUploadResult {
  id: string
  filename: string
  url: string
  zona?: string
  artista?: string
}

export interface SearchResult {
  items: CollectionItem[]
  total: number
  query: string
}

export interface Analytics {
  total_collections: number
  total_items: number
  total_images: number
  recent_uploads: number
}
