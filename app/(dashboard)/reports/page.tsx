"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseChart } from "@/components/expense-chart"
import { useAppContext } from "@/lib/app-context"

export default function ReportsPage() {
  const { expenses, totalBalance, totalOwed, totalLent } = useAppContext()
  const [chartType, setChartType] = useState<"bar" | "pie">("bar")

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalBalance >= 0 ? "You are owed" : "You owe"} ${Math.abs(totalBalance).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalLent.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Amount you've paid for others
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Owed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalOwed.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Amount others owe you
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Analysis</CardTitle>
          <CardDescription>View your expenses by category and time period</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="category" className="space-y-4">
            <TabsList>
              <TabsTrigger key="category" value="category">By Category</TabsTrigger>
              <TabsTrigger key="time" value="time">By Time Period</TabsTrigger>
            </TabsList>
            <TabsContent value="category" className="space-y-4">
              <div className="flex justify-end">
                <TabsList>
                  <TabsTrigger key="bar" value="bar" onClick={() => setChartType("bar")}>Bar</TabsTrigger>
                  <TabsTrigger key="pie" value="pie" onClick={() => setChartType("pie")}>Pie</TabsTrigger>
                </TabsList>
              </div>
              <ExpenseChart type={chartType} />
            </TabsContent>
            <TabsContent value="time" className="space-y-4">
              <ExpenseChart type="bar" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 