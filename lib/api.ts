// -----------------------------------------------------------------------------
//  Configuración de endpoints
// -----------------------------------------------------------------------------
const DEFAULT_API = "https://257c-45-236-45-57.ngrok-free.app"

export const API_BASE =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE || DEFAULT_API
    : (window as any).NEXT_PUBLIC_API_BASE || DEFAULT_API

const ADMIN_API = `${API_BASE}/admin`

// -----------------------------------------------------------------------------
//  Interfaces
// -----------------------------------------------------------------------------
export interface ObraCreate {
  titulo: string
  artista: string
  zona: string
  tecnica?: string
  año?: string
  dimensiones?: string
  materiales?: string
  estilo?: string
  periodo_historico?: string
  significado_cultural?: string
  estado_conservacion?: string
  ubicacion_fisica?: string
  precio_estimado?: string
  descripcion: string
  metadata_adicional?: Record<string, any>
}

export interface ZonaCreate {
  nombre: string
  descripcion: string
  periodo?: string
  tematica?: string
  caracteristicas?: string
  metadata_adicional?: Record<string, any>
}

export interface ImageItem {
  id: string
  obra_id: string
  titulo: string
  artista: string
  zona: string
  filename: string
  descripcion_visual?: string
  tamaño?: string
  formato?: string
  url?: string
  document?: string
  metadata?: any
}

export interface BulkOperation {
  item_ids: string[]
  operation: "update_metadata" | "delete" | "move_zone"
  operation_data: Record<string, any>
}

export interface MetadataUpdate {
  metadata_updates: Record<string, any>
  replace_all: boolean
}

// -----------------------------------------------------------------------------
//  API helpers
// -----------------------------------------------------------------------------
export const API_URL = process.env.NEXT_PUBLIC_API_BASE || "https://257c45-236-45-57.ngrok-free.app"

type Options = Omit<RequestInit, "headers"> & { headers?: HeadersInit }

export async function apiRequest<T = unknown>(endpoint: string, options: Options = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options

  // When sending FormData do NOT set Content-Type – the browser will add it.
  const defaultHeaders: HeadersInit =
    body instanceof FormData
      ? { "ngrok-skip-browser-warning": "true" }
      : {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers: { ...defaultHeaders, ...customHeaders },
    body,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`${response.status} ${response.statusText}\n${text || "No body"}`)
  }

  // Empty 204 responses break `response.json()`
  if (response.status === 204) return {} as T

  return (await response.json()) as T
}

export const api = {
  // ---------------- CHAT ----------------
  chat: {
    sendMessage: (message: string) =>
      apiRequest("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message }),
      }),

    sendImage: (formData: FormData) =>
      apiRequest(`${API_BASE}/chat-with-image`, {
        method: "POST",
        body: formData,
      }),
  },

  // ---------------- ADMIN ----------------
  admin: {
    // Collections
    getCollections: async () => {
      const data = await apiRequest(`${ADMIN_API}/collections`)
      return Array.isArray(data) ? data.map((name) => ({ name, count: 0, description: "" })) : []
    },

    getCollection: (name: string) => apiRequest(`${ADMIN_API}/collections/${name}`),

    getCollectionStats: (name: string) => apiRequest(`${ADMIN_API}/collections/${name}/stats`),

    duplicateCollection: (sourceName: string, newName: string) =>
      apiRequest(`${ADMIN_API}/collections/${sourceName}/duplicate?new_collection_name=${newName}`, {
        method: "POST",
      }),

    deleteCollection: (name: string) =>
      apiRequest(`${ADMIN_API}/collections/${name}?confirm=true`, {
        method: "DELETE",
      }),

    exportCollection: (name: string) => apiRequest(`${ADMIN_API}/export/${name}`),

    // Items - Basic CRUD
    getItem: (collection: string, id: string) => apiRequest(`${ADMIN_API}/collections/${collection}/items/${id}`),

    updateItem: (collection: string, id: string, data: any) =>
      apiRequest(`${ADMIN_API}/collections/${collection}/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    deleteItem: (collection: string, id: string) =>
      apiRequest(`${ADMIN_API}/collections/${collection}/items/${id}`, {
        method: "DELETE",
      }),

    // Items - Advanced CRUD
    updateItemMetadata: (collection: string, id: string, metadataUpdate: MetadataUpdate) =>
      apiRequest(`${ADMIN_API}/collections/${collection}/items/${id}/metadata`, {
        method: "PUT",
        body: JSON.stringify(metadataUpdate),
      }),

    updateItemDocument: (collection: string, id: string, document: string) =>
      apiRequest(`${ADMIN_API}/collections/${collection}/items/${id}/document`, {
        method: "PUT",
        body: JSON.stringify({ document }),
      }),

    addItemField: (collection: string, id: string, fieldName: string, fieldValue: string) => {
      const formData = new FormData()
      formData.append("field_name", fieldName)
      formData.append("field_value", fieldValue)
      return apiRequest(`${ADMIN_API}/collections/${collection}/items/${id}/add-field`, {
        method: "POST",
        body: formData,
      })
    },

    removeItemField: (collection: string, id: string, fieldName: string) =>
      apiRequest(`${ADMIN_API}/collections/${collection}/items/${id}/field/${fieldName}`, {
        method: "DELETE",
      }),

    // Bulk Operations
    bulkOperation: (collection: string, operation: BulkOperation) =>
      apiRequest(`${ADMIN_API}/collections/${collection}/bulk-operation`, {
        method: "POST",
        body: JSON.stringify(operation),
      }),

    // Content Creation
    createObra: (data: ObraCreate) =>
      apiRequest(`${ADMIN_API}/obras`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    createZona: (data: ZonaCreate) =>
      apiRequest(`${ADMIN_API}/zonas`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    // Images - Basic
    uploadImage: (formData: FormData) =>
      apiRequest(`${ADMIN_API}/upload-image`, {
        method: "POST",
        body: formData,
      }),

    getImageUrl: (filename: string) => `${API_BASE}/static/images/${filename}`,

    getImagesByObra: (obra_id: string) => apiRequest(`${ADMIN_API}/images/by-obra/${obra_id}`),

    listImages: async (zona?: string, artista?: string) => {
      const params = new URLSearchParams()
      if (zona) params.append("zona_filter", zona)
      if (artista) params.append("artista_filter", artista)

      const data = await apiRequest(`${ADMIN_API}/images?${params}`)

      if (data.images && Array.isArray(data.images)) {
        data.images = data.images.map((img: any) => ({
          ...img,
          url: img.url || `${API_BASE}/static/images/${img.filename}`,
          ...(typeof img.metadata === "string" ? JSON.parse(img.metadata || "{}") : img.metadata || {}),
        }))
      }

      return data
    },

    deleteImage: (imageId: string) => apiRequest(`${ADMIN_API}/images/${imageId}`, { method: "DELETE" }),

    updateImageMetadata: (imageId: string, metadata: any) =>
      apiRequest(`${ADMIN_API}/images/${imageId}/metadata`, {
        method: "PUT",
        body: JSON.stringify(metadata),
      }),

    // Images - Advanced
    bulkDeleteImages: (imageIds: string[]) =>
      apiRequest(`${ADMIN_API}/images/bulk-delete`, {
        method: "POST",
        body: JSON.stringify(imageIds),
      }),

    reassociateImage: (imageId: string, obraId: string) => {
      const formData = new FormData()
      formData.append("obra_id", obraId)
      return apiRequest(`${ADMIN_API}/images/${imageId}/associate-obra`, {
        method: "PUT",
        body: formData,
      })
    },

    // Search & Analytics
    search: (query: string, collection = "mac_info", tipo?: string, n_results = 5) => {
      const params = new URLSearchParams({
        q: query,
        collection_name: collection,
        n_results: n_results.toString(),
      })
      if (tipo) params.append("tipo_filter", tipo)
      return apiRequest(`${ADMIN_API}/search?${params}`)
    },

    getAnalytics: async () => {
      const data = await apiRequest(`${ADMIN_API}/analytics`)
      return {
        total_collections: data.total_collections || 0,
        total_items: Object.values(data.collections_detail || {}).reduce(
          (sum: number, col: any) => sum + (col.total_items || 0),
          0,
        ),
        total_images: data.collections_detail?.mac_images?.total_items || 0,
        recent_uploads: 0,
        collections_detail: data.collections_detail || {},
      }
    },

    checkObraHasImages: (obra_id: string) => apiRequest(`${ADMIN_API}/obras/${obra_id}/has-images`),

    healthCheck: () => apiRequest(`${ADMIN_API}/health`),
  },
}
