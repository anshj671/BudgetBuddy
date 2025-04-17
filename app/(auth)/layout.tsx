"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppContext } from "@/lib/app-context"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAppContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only redirect if user is logged in and trying to access auth pages
    if (user && (pathname === "/login" || pathname === "/signup")) {
      router.push("/dashboard")
    }
  }, [user, router, pathname])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

