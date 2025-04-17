"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppContext } from "@/lib/app-context"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAppContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only redirect to login if user is not logged in and trying to access dashboard pages
    if (!user && (pathname.startsWith("/dashboard") || pathname.startsWith("/groups"))) {
      router.push("/login")
    }
  }, [user, router, pathname])

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  )
}

