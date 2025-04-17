"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import type { Expense, Group } from "@/lib/types"
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendItem,
  ChartLegendItemColor,
  ChartLegendItemLabel,
  ChartLegendItemValue,
  ChartPie,
  ChartPieSeries,
  ChartBar,
  ChartBarSeries,
  ChartBarItem,
  ChartXAxis,
  ChartYAxis,
} from "@/components/ui/chart"

interface GroupReportsProps {
  expenses: Expense[]
  group: Group
}

export function GroupReports({ expenses, group }: GroupReportsProps) {
  // State for filters
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const now = new Date()
    return {
      from: startOfMonth(subMonths(now, 1)),
      to: endOfMonth(now),
    }
  })
  const [timeFrame, setTimeFrame] = useState("month")
  const [chartType, setChartType] = useState("category")

  // Filtered expenses based on date range
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return isWithinInterval(expenseDate, { start: dateRange.from, end: dateRange.to })
  })

  // Prepare data for category chart
  const categoryData = (() => {
    const categories: Record<string, number> = {}

    filteredExpenses.forEach((expense) => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0
      }
      categories[expense.category] += expense.amount
    })

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      color: getCategoryColor(name),
    }))
  })()

  // Prepare data for member contribution chart
  const memberData = (() => {
    const members: Record<string, number> = {}

    group.members.forEach((member) => {
      members[member.id] = 0
    })

    filteredExpenses.forEach((expense) => {
      if (members[expense.paidBy.id] !== undefined) {
        members[expense.paidBy.id] += expense.amount
      }
    })

    return Object.entries(members).map(([id, value]) => {
      const member = group.members.find((m) => m.id === id)
      return {
        name: member?.name || "Unknown",
        value,
        color: getMemberColor(id),
      }
    })
  })()

  // Prepare data for time series chart
  const timeSeriesData = (() => {
    // This is a simplified implementation
    // In a real app, you'd group by day/week/month based on the timeFrame
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const data: Record<string, number> = {}

    // Initialize with zero values
    months.forEach((month) => {
      data[month] = 0
    })

    // Sum expenses by month
    filteredExpenses.forEach((expense) => {
      const date = new Date(expense.date)
      const month = months[date.getMonth()]
      data[month] += expense.amount
    })

    return Object.entries(data).map(([name, value]) => ({
      name,
      value,
    }))
  })()

  // Helper function to get color for category
  function getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      Food: "hsl(var(--chart-1))",
      Transport: "hsl(var(--chart-2))",
      Entertainment: "hsl(var(--chart-3))",
      Rent: "hsl(var(--chart-4))",
      Utilities: "hsl(var(--chart-5))",
      Shopping: "hsl(var(--chart-1))",
      Travel: "hsl(var(--chart-2))",
      Others: "hsl(var(--chart-3))",
      Settlement: "hsl(var(--chart-4))",
    }

    return colorMap[category] || "hsl(var(--chart-5))"
  }

  // Helper function to get color for member
  function getMemberColor(memberId: string): string {
    const colorMap: Record<string, string> = {
      "user-1": "hsl(var(--chart-1))",
      "user-2": "hsl(var(--chart-2))",
      "user-3": "hsl(var(--chart-3))",
      "user-4": "hsl(var(--chart-4))",
      "user-5": "hsl(var(--chart-5))",
      "user-6": 'hsl(var(--chart-1)  "hsl(var(--chart-4))',
      "user-5": "hsl(var(--chart-5))",
      "user-6": "hsl(var(--chart-1))",
      "user-7": "hsl(var(--chart-2))",
      "user-8": "hsl(var(--chart-3))",
    }

    return colorMap[memberId] || "hsl(var(--chart-5))"
  }

  // Calculate total expenses in the filtered date range
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate average expense
  const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0

  // Find highest expense
  const highestExpense = filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map((e) => e.amount)) : 0

  // Find most common category
  const mostCommonCategory = (() => {
    if (filteredExpenses.length === 0) return "N/A"

    const categoryCounts: Record<string, number> = {}
    filteredExpenses.forEach((expense) => {
      if (!categoryCounts[expense.category]) {
        categoryCounts[expense.category] = 0
      }
      categoryCounts[expense.category]++
    })

    let maxCount = 0
    let maxCategory = "N/A"

    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count
        maxCategory = category
      }
    })

    return maxCategory
  })()

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Customize your expense report view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) =>
                      setDateRange({
                        from: range?.from || dateRange.from,
                        to: range?.to || dateRange.to,
                      })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFrame">Time Frame</Label>
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger id="timeFrame">
                  <SelectValue placeholder="Select time frame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chartType">Chart Type</Label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger id="chartType">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">By Category</SelectItem>
                  <SelectItem value="member">By Member</SelectItem>
                  <SelectItem value="time">Over Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Highest Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${highestExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Single transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostCommonCategory}</div>
            <p className="text-xs text-muted-foreground">Most frequent</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>
            {chartType === "category" && "Expenses by Category"}
            {chartType === "member" && "Contributions by Member"}
            {chartType === "time" && "Expenses Over Time"}
          </CardTitle>
          <CardDescription>
            {chartType === "category" && "Breakdown of expenses by category"}
            {chartType === "member" && "How much each member has contributed"}
            {chartType === "time" && "Spending pattern over time"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartType === "category" && (
            <div className="grid md:grid-cols-2 gap-4">
              <ChartContainer className="aspect-square h-[300px]">
                <Chart className="h-full w-full">
                  <ChartPie className="h-full w-full">
                    <ChartPieSeries data={categoryData}>
                      {({ arc }) => (
                        <path
                          d={arc}
                          className="transition-colors"
                          fill={arc.data.color}
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        />
                      )}
                    </ChartPieSeries>
                  </ChartPie>
                </Chart>
              </ChartContainer>

              <ChartLegend className="flex flex-col justify-center">
                {categoryData.map((item) => (
                  <ChartLegendItem key={item.name} className="flex items-center gap-2 mb-2">
                    <ChartLegendItemColor className="h-3 w-3" style={{ backgroundColor: item.color }} />
                    <ChartLegendItemLabel className="flex-1">{item.name}</ChartLegendItemLabel>
                    <ChartLegendItemValue className="font-medium">${item.value.toFixed(2)}</ChartLegendItemValue>
                  </ChartLegendItem>
                ))}
              </ChartLegend>
            </div>
          )}

          {chartType === "member" && (
            <div className="grid md:grid-cols-2 gap-4">
              <ChartContainer className="aspect-square h-[300px]">
                <Chart className="h-full w-full">
                  <ChartPie className="h-full w-full">
                    <ChartPieSeries data={memberData}>
                      {({ arc }) => (
                        <path
                          d={arc}
                          className="transition-colors"
                          fill={arc.data.color}
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        />
                      )}
                    </ChartPieSeries>
                  </ChartPie>
                </Chart>
              </ChartContainer>

              <ChartLegend className="flex flex-col justify-center">
                {memberData.map((item) => (
                  <ChartLegendItem key={item.name} className="flex items-center gap-2 mb-2">
                    <ChartLegendItemColor className="h-3 w-3" style={{ backgroundColor: item.color }} />
                    <ChartLegendItemLabel className="flex-1">{item.name}</ChartLegendItemLabel>
                    <ChartLegendItemValue className="font-medium">${item.value.toFixed(2)}</ChartLegendItemValue>
                  </ChartLegendItem>
                ))}
              </ChartLegend>
            </div>
          )}

          {chartType === "time" && (
            <ChartContainer className="h-[300px]">
              <Chart className="h-full w-full">
                <ChartBar data={timeSeriesData} xAxis={<ChartXAxis />} yAxis={<ChartYAxis />}>
                  <ChartBarSeries>
                    {({ bar }) => (
                      <ChartBarItem
                        key={bar.key}
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        className="fill-primary"
                        onMouseEnter={bar.onMouseEnter}
                        onMouseLeave={bar.onMouseLeave}
                      />
                    )}
                  </ChartBarSeries>
                </ChartBar>
                <ChartTooltip>
                  {({ data }) => (
                    <ChartTooltipContent>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium">{data.name}</div>
                        <div className="text-xs text-muted-foreground">${data.value.toFixed(2)}</div>
                      </div>
                    </ChartTooltipContent>
                  )}
                </ChartTooltip>
              </Chart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Expense Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Detailed view of all expenses in the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">Date</th>
                  <th className="p-2 text-left font-medium">Description</th>
                  <th className="p-2 text-left font-medium">Category</th>
                  <th className="p-2 text-left font-medium">Paid By</th>
                  <th className="p-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      No expenses found for the selected period
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b">
                      <td className="p-2">{format(new Date(expense.date), "MMM d, yyyy")}</td>
                      <td className="p-2">{expense.title}</td>
                      <td className="p-2">{expense.category}</td>
                      <td className="p-2">{expense.paidBy.name}</td>
                      <td className="p-2 text-right">${expense.amount.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/50">
                  <td colSpan={4} className="p-2 font-medium">
                    Total
                  </td>
                  <td className="p-2 text-right font-medium">${totalExpenses.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

