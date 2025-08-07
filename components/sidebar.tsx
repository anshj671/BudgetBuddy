"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3Icon, CreditCardIcon, HomeIcon, LogOutIcon, MenuIcon, SettingsIcon, UsersIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAppContext } from "@/lib/app-context"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAppContext()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: HomeIcon,
    },
    {
      name: "Expenses",
      path: "/expenses",
      icon: CreditCardIcon,
    },
    {
      name: "Groups",
      path: "/groups",
      icon: UsersIcon,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: BarChart3Icon,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: SettingsIcon,
    },
  ]

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true
    }

    if (path !== "/dashboard" && pathname.startsWith(path)) {
      return true
    }

    return false
  }

  const handleLogout = () => {
    logout()
    setOpen(false)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setOpen(false)
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
          <CreditCardIcon className="h-6 w-6 text-primary" />
          <span className="text-xl">BudgetBuddy</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {routes.map((route) => (
            <button
              key={route.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all ${
                isActive(route.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => handleNavigation(route.path)}
            >
              <route.icon className="h-4 w-4" />
              {route.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-2 py-2">
          <Avatar>
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <div className="font-medium">{user?.name}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
        </div>
        <div className="mt-2 grid gap-1">
          <button
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground text-left"
            onClick={() => handleNavigation("/profile")}
          >
            Profile
          </button>
          <Button
            variant="ghost"
            className="flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOutIcon className="h-4 w-4" />
            {isLoading ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden w-64 border-r md:block">
        <SidebarContent />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 md:hidden">
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}

