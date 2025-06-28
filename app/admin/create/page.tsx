"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { Plus, CheckCircle, AlertCircle } from "lucide-react"

type CreateType = "obra" | "zona"

export default function CreatePage() {
  const [type, setType] = useState<CreateType>("obra")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    titulo: "",
    artista: "",
    año: "",
    tecnica: "",
    descripcion: "",
    ubicacion: "",
    zona: "",
    tipo: "",
    nombre: "",
    capacidad: "",
    horario: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      titulo: "",
      artista: "",
      año: "",
      tecnica: "",
      descripcion: "",
      ubicacion: "",
      zona: "",
      tipo: "",
      nombre: "",
      capacidad: "",
      horario: "",
    })
    setSuccess(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let result
      if (type === "obra") {
        const obraData = {
          titulo: formData.titulo,
          artista: formData.artista,
          año: formData.año,
          tecnica: formData.tecnica,
          descripcion: formData.descripcion,
          ubicacion: formData.ubicacion,
          zona: formData.zona,
          tipo: formData.tipo || "obra",
        }
        result = await api.admin.createObra(obraData)
      } else {
        const zonaData = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          ubicacion: formData.ubicacion,
          capacidad: formData.capacidad,
          horario: formData.horario,
          tipo: "zona",
        }
        result = await api.admin.createZona(zonaData)
      }

      setSuccess(`${type === "obra" ? "Obra" : "Zona"} creada correctamente`)
      resetForm()
    } catch (err: any) {
      console.error("Error creating item:", err)
      setError(err.message || `Error al crear la ${type}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Create</h1>
        <p className="text-gray-600 mt-2">Crea nuevas obras o zonas del museo</p>
      </div>

      {/* Type Selector */}
      <div className="flex gap-4">
        <Button
          variant={type === "obra" ? "default" : "outline"}
          onClick={() => {
            setType("obra")
            resetForm()
          }}
          className={type === "obra" ? "bg-black text-white" : ""}
        >
          Crear Obra
        </Button>
        <Button
          variant={type === "zona" ? "default" : "outline"}
          onClick={() => {
            setType("zona")
            resetForm()
          }}
          className={type === "zona" ? "bg-black text-white" : ""}
        >
          Crear Zona
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {type === "obra" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <Input value={formData.titulo} onChange={(e) => handleInputChange("titulo", e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Artista *</label>
                <Input
                  value={formData.artista}
                  onChange={(e) => handleInputChange("artista", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                <Input value={formData.año} onChange={(e) => handleInputChange("año", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Técnica</label>
                <Input value={formData.tecnica} onChange={(e) => handleInputChange("tecnica", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                <Input value={formData.ubicacion} onChange={(e) => handleInputChange("ubicacion", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zona</label>
                <Input value={formData.zona} onChange={(e) => handleInputChange("zona", e.target.value)} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <Input value={formData.nombre} onChange={(e) => handleInputChange("nombre", e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                <Input value={formData.ubicacion} onChange={(e) => handleInputChange("ubicacion", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad</label>
                <Input
                  value={formData.capacidad}
                  onChange={(e) => handleInputChange("capacidad", e.target.value)}
                  placeholder="Ej: 50 personas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horario</label>
                <Input
                  value={formData.horario}
                  onChange={(e) => handleInputChange("horario", e.target.value)}
                  placeholder="Ej: 9:00 - 18:00"
                />
              </div>
            </div>
          </>
        )}

        {/* Submit */}
        <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          {loading ? "Creando..." : `Crear ${type === "obra" ? "Obra" : "Zona"}`}
        </Button>
      </form>

      {/* Success Message */}
      {success && (
        <div className="max-w-2xl bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
