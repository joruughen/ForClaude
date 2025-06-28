"use client"
import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { StatsCards } from "@/components/admin/StatsCards"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Database, ImageIcon, RefreshCw, AlertCircle } from "lucide-react"

interface AnalyticsData {
  total_collections: number
  total_items: number
  total_images: number
  recent_uploads: number
  collections_detail: Record<string, any>
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.admin.getAnalytics()
      setAnalytics(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Panel de administración del Museo MAC</p>
          </div>
          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {analytics && <StatsCards analytics={analytics} />}

        {/* Collections Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Collections Status
              </CardTitle>
              <CardDescription>Estado actual de las colecciones</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.collections_detail ? (
                <div className="space-y-3">
                  {Object.entries(analytics.collections_detail).map(([name, details]: [string, any]) => (
                    <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{name}</h4>
                        <p className="text-sm text-gray-600">{details.total_items || 0} items</p>
                      </div>
                      <Badge variant={details.total_items > 0 ? "default" : "secondary"}>
                        {details.total_items > 0 ? "Active" : "Empty"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay datos disponibles</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Sistema Status
              </CardTitle>
              <CardDescription>Estado del sistema backend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Backend API</span>
                  <Badge variant="default">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>ChromaDB</span>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Images Storage</span>
                  <Badge variant="default">Available</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ImageIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Sistema iniciado</p>
                  <p className="text-sm text-gray-600">Panel de administración activo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
