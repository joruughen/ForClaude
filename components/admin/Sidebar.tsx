"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Database, Plus, Upload, ImageIcon, Search, MessageCircle } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Collections", href: "/admin/collections", icon: Database },
  { name: "Create", href: "/admin/create", icon: Plus },
  { name: "Upload Image", href: "/admin/upload", icon: Upload },
  { name: "Images", href: "/admin/images", icon: ImageIcon },
  { name: "Search", href: "/admin/search", icon: Search },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-black">MAC Admin</h1>
        <p className="text-sm text-gray-600">Panel de administración</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                    isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-black">
          <MessageCircle className="h-4 w-4" />
          Volver al Chat
        </Link>
      </div>
    </div>
  )
}
