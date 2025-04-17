"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Something went wrong</h1>
      <p className="mt-4 text-center text-muted-foreground">An error occurred while loading this page.</p>
      <div className="mt-6 flex space-x-4">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}

