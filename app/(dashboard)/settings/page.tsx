"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppContext } from "@/lib/app-context"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { user, setUser, currency, setCurrency } = useAppContext()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    reminders: true,
  })
  const [theme, setTheme] = useState("dark")

  const handleSaveSettings = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger key="general" value="general">General</TabsTrigger>
          <TabsTrigger key="notifications" value="notifications">Notifications</TabsTrigger>
          <TabsTrigger key="appearance" value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <select
                  id="currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option key="USD" value="USD">USD ($)</option>
                  <option key="EUR" value="EUR">EUR (€)</option>
                  <option key="GBP" value="GBP">GBP (£)</option>
                  <option key="INR" value="INR">INR (₹)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, push: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders for upcoming payments
                  </p>
                </div>
                <Switch
                  checked={notifications.reminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, reminders: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option key="dark" value="dark">Dark</option>
                  <option key="light" value="light">Light</option>
                  <option key="system" value="system">System</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
} 