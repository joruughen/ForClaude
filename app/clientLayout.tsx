"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/Sidebar"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) {
    return (
      <html lang="es">
        <body className={inter.className}>
          <div className="flex h-screen bg-white">
            
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
