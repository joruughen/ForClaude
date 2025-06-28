"use client"

import type React from "react"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { api, type ObraCreate, type ZonaCreate } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { FileText, MapPin, Plus } from "lucide-react"

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("obras")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form states
  const [obraForm, setObraForm] = useState<ObraCreate>({
    titulo: "",
    artista: "",
    zona: "",
    tecnica: "",
    año: "",
    dimensiones: "",
    materiales: "",
    estilo: "",
    periodo_historico: "",
    significado_cultural: "",
    estado_conservacion: "",
    ubicacion_fisica: "",
    precio_estimado: "",
    descripcion: "",
    metadata_adicional: {},
  })

  const [zonaForm, setZonaForm] = useState<ZonaCreate>({
    nombre: "",
    descripcion: "",
    periodo: "",
    tematica: "",
    caracteristicas: "",
    metadata_adicional: {},
  })

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleCreateObra = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!obraForm.titulo || !obraForm.artista || !obraForm.zona || !obraForm.descripcion) {
      showMessage("error", "Los campos título, artista, zona y descripción son requeridos")
      return
    }

    setLoading(true)
    try {
      await api.admin.createObra(obraForm)
      showMessage("success", "Obra creada exitosamente")

      // Reset form
      setObraForm({
        titulo: "",
        artista: "",
        zona: "",
        tecnica: "",
        año: "",
        dimensiones: "",
        materiales: "",
        estilo: "",
        periodo_historico: "",
        significado_cultural: "",
        estado_conservacion: "",
        ubicacion_fisica: "",
        precio_estimado: "",
        descripcion: "",
        metadata_adicional: {},
      })
    } catch (err: any) {
      showMessage("error", err.message || "Error al crear la obra")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateZona = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!zonaForm.nombre || !zonaForm.descripcion) {
      showMessage("error", "Los campos nombre y descripción son requeridos")
      return
    }

    setLoading(true)
    try {
      await api.admin.createZona(zonaForm)
      showMessage("success", "Zona creada exitosamente")

      // Reset form
      setZonaForm({
        nombre: "",
        descripcion: "",
        periodo: "",
        tematica: "",
        caracteristicas: "",
        metadata_adicional: {},
      })
    } catch (err: any) {
      showMessage("error", err.message || "Error al crear la zona")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-2">Crea y gestiona obras y zonas del museo</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`rounded-lg p-4 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="obras" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Obras
            </TabsTrigger>
            <TabsTrigger value="zonas" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Zonas
            </TabsTrigger>
          </TabsList>

          {/* Obras Tab */}
          <TabsContent value="obras">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Crear Nueva Obra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateObra} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Campos requeridos */}
                    <div>
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        value={obraForm.titulo}
                        onChange={(e) => setObraForm({ ...obraForm, titulo: e.target.value })}
                        placeholder="Título de la obra"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="artista">Artista *</Label>
                      <Input
                        id="artista"
                        value={obraForm.artista}
                        onChange={(e) => setObraForm({ ...obraForm, artista: e.target.value })}
                        placeholder="Nombre del artista"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zona">Zona *</Label>
                      <Input
                        id="zona"
                        value={obraForm.zona}
                        onChange={(e) => setObraForm({ ...obraForm, zona: e.target.value })}
                        placeholder="Zona del museo"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tecnica">Técnica</Label>
                      <Input
                        id="tecnica"
                        value={obraForm.tecnica}
                        onChange={(e) => setObraForm({ ...obraForm, tecnica: e.target.value })}
                        placeholder="Técnica utilizada"
                      />
                    </div>
                    <div>
                      <Label htmlFor="año">Año</Label>
                      <Input
                        id="año"
                        value={obraForm.año}
                        onChange={(e) => setObraForm({ ...obraForm, año: e.target.value })}
                        placeholder="Año de creación"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dimensiones">Dimensiones</Label>
                      <Input
                        id="dimensiones"
                        value={obraForm.dimensiones}
                        onChange={(e) => setObraForm({ ...obraForm, dimensiones: e.target.value })}
                        placeholder="Dimensiones de la obra"
                      />
                    </div>
                    <div>
                      <Label htmlFor="materiales">Materiales</Label>
                      <Input
                        id="materiales"
                        value={obraForm.materiales}
                        onChange={(e) => setObraForm({ ...obraForm, materiales: e.target.value })}
                        placeholder="Materiales utilizados"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estilo">Estilo</Label>
                      <Input
                        id="estilo"
                        value={obraForm.estilo}
                        onChange={(e) => setObraForm({ ...obraForm, estilo: e.target.value })}
                        placeholder="Estilo artístico"
                      />
                    </div>
                    <div>
                      <Label htmlFor="periodo_historico">Período Histórico</Label>
                      <Input
                        id="periodo_historico"
                        value={obraForm.periodo_historico}
                        onChange={(e) => setObraForm({ ...obraForm, periodo_historico: e.target.value })}
                        placeholder="Período histórico"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado_conservacion">Estado de Conservación</Label>
                      <Input
                        id="estado_conservacion"
                        value={obraForm.estado_conservacion}
                        onChange={(e) => setObraForm({ ...obraForm, estado_conservacion: e.target.value })}
                        placeholder="Estado de conservación"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ubicacion_fisica">Ubicación Física</Label>
                      <Input
                        id="ubicacion_fisica"
                        value={obraForm.ubicacion_fisica}
                        onChange={(e) => setObraForm({ ...obraForm, ubicacion_fisica: e.target.value })}
                        placeholder="Ubicación física en el museo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="precio_estimado">Precio Estimado</Label>
                      <Input
                        id="precio_estimado"
                        value={obraForm.precio_estimado}
                        onChange={(e) => setObraForm({ ...obraForm, precio_estimado: e.target.value })}
                        placeholder="Precio estimado"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="significado_cultural">Significado Cultural</Label>
                    <Textarea
                      id="significado_cultural"
                      value={obraForm.significado_cultural}
                      onChange={(e) => setObraForm({ ...obraForm, significado_cultural: e.target.value })}
                      placeholder="Significado cultural de la obra"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="descripcion">Descripción *</Label>
                    <Textarea
                      id="descripcion"
                      value={obraForm.descripcion}
                      onChange={(e) => setObraForm({ ...obraForm, descripcion: e.target.value })}
                      placeholder="Descripción detallada de la obra"
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creando..." : "Crear Obra"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zonas Tab */}
          <TabsContent value="zonas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Crear Nueva Zona
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateZona} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={zonaForm.nombre}
                        onChange={(e) => setZonaForm({ ...zonaForm, nombre: e.target.value })}
                        placeholder="Nombre de la zona"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="periodo">Período</Label>
                      <Input
                        id="periodo"
                        value={zonaForm.periodo}
                        onChange={(e) => setZonaForm({ ...zonaForm, periodo: e.target.value })}
                        placeholder="Período histórico"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="tematica">Temática</Label>
                      <Input
                        id="tematica"
                        value={zonaForm.tematica}
                        onChange={(e) => setZonaForm({ ...zonaForm, tematica: e.target.value })}
                        placeholder="Temática de la zona"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="caracteristicas">Características</Label>
                    <Textarea
                      id="caracteristicas"
                      value={zonaForm.caracteristicas}
                      onChange={(e) => setZonaForm({ ...zonaForm, caracteristicas: e.target.value })}
                      placeholder="Características especiales de la zona"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="descripcion_zona">Descripción *</Label>
                    <Textarea
                      id="descripcion_zona"
                      value={zonaForm.descripcion}
                      onChange={(e) => setZonaForm({ ...zonaForm, descripcion: e.target.value })}
                      placeholder="Descripción detallada de la zona"
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creando..." : "Crear Zona"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
