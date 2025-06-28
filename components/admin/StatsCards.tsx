import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, ImageIcon, FileText, Activity } from "lucide-react"

interface AnalyticsData {
  total_collections: number
  total_items: number
  total_images: number
  recent_uploads: number
  collections_detail: Record<string, any>
}

interface StatsCardsProps {
  analytics: AnalyticsData
}

export function StatsCards({ analytics }: StatsCardsProps) {
  const getObraCount = () => {
    return analytics.collections_detail?.mac_info?.types_distribution?.obra || 0
  }

  const getZonaCount = () => {
    return analytics.collections_detail?.mac_info?.types_distribution?.zona || 0
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Obras</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getObraCount()}</div>
          <p className="text-xs text-muted-foreground">Obras de arte registradas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Zonas</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getZonaCount()}</div>
          <p className="text-xs text-muted-foreground">Zonas del museo</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Imágenes</CardTitle>
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.total_images}</div>
          <p className="text-xs text-muted-foreground">Imágenes almacenadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Colecciones</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.total_collections}</div>
          <p className="text-xs text-muted-foreground">Colecciones activas</p>
        </CardContent>
      </Card>
    </div>
  )
}
