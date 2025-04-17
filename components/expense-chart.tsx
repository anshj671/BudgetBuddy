"use client"

import { useMemo, useState } from "react"
import { useAppContext } from "@/lib/app-context"
import {
  ChartContainer,
  Chart,
  ChartTooltip,
  ChartTooltipContent,
  ChartPie,
  ChartPieSeries,
  ChartBar,
  ChartBarSeries,
  ChartBarItem,
  ChartXAxis,
  ChartYAxis,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Expense {
  id: string
  amount: number
  category: string
  date: string
  groupId?: string
  splitType?: "equal" | "percentage" | "amount"
  splitDetails?: Record<string, number>
  paidBy?: string | { id: string; name: string; email: string; avatar?: string }
  description?: string
}

interface ChartData {
  name: string
  value: number
  color?: string
  participants?: number
  perPerson?: number
  paidBy?: string
  description?: string
}

interface ExpenseChartProps {
  type: 'pie' | 'bar'
  expenses?: Expense[]
  className?: string
  showPerPerson?: boolean
  isLoading?: boolean
  error?: string
}

// Helper function to get a color for each category
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
    Other: "hsl(var(--chart-5))",
  }

  return colorMap[category] || "hsl(var(--chart-5))"
}

// Helper function to calculate split amounts
function calculateSplitAmount(expense: Expense): number {
  if (!expense.splitType || !expense.splitDetails) {
    return expense.amount
  }

  try {
    switch (expense.splitType) {
      case "equal":
        const participantCount = Object.keys(expense.splitDetails).length
        if (participantCount === 0) return expense.amount
        return expense.amount / participantCount
      case "percentage":
        const totalPercentage = Object.values(expense.splitDetails).reduce((sum, percentage) => sum + percentage, 0)
        if (totalPercentage !== 100) {
          console.warn(`Total percentage for expense ${expense.id} is ${totalPercentage}%, not 100%`)
        }
        return Object.values(expense.splitDetails).reduce((sum, percentage) => {
          return sum + (expense.amount * percentage) / 100
        }, 0)
      case "amount":
        const totalAmount = Object.values(expense.splitDetails).reduce((sum, amount) => sum + amount, 0)
        if (Math.abs(totalAmount - expense.amount) > 0.01) {
          console.warn(`Total split amount for expense ${expense.id} doesn't match expense amount`)
        }
        return totalAmount
      default:
        return expense.amount
    }
  } catch (error) {
    console.error("Error calculating split amount:", error)
    return expense.amount
  }
}

// Helper function to validate expense data
function validateExpense(expense: Expense): boolean {
  if (!expense.id || !expense.amount || !expense.category || !expense.date) {
    return false
  }

  if (expense.amount <= 0) {
    return false
  }

  if (expense.splitType && expense.splitDetails) {
    if (expense.splitType === "percentage") {
      const totalPercentage = Object.values(expense.splitDetails).reduce((sum, p) => sum + p, 0)
      if (Math.abs(totalPercentage - 100) > 0.01) {
        return false
      }
    } else if (expense.splitType === "amount") {
      const totalAmount = Object.values(expense.splitDetails).reduce((sum, a) => sum + a, 0)
      if (Math.abs(totalAmount - expense.amount) > 0.01) {
        return false
      }
    }
  }

  return true
}

// Helper function to get paidBy name
function getPaidByName(paidBy?: string | { id: string; name: string; email: string; avatar?: string }): string {
  if (!paidBy) return ''
  if (typeof paidBy === 'string') return paidBy
  return paidBy.name
}

export function ExpenseChart({ type, expenses = [], className, showPerPerson = false, isLoading = false, error }: ExpenseChartProps) {
  const { categories = [] } = useAppContext()
  const [hoveredItem, setHoveredItem] = useState<ChartData | null>(null)

  // Calculate chart data using useMemo
  const chartData = useMemo(() => {
    if (!expenses?.length) {
      return []
    }

    // Filter out invalid expenses
    const validExpenses = expenses.filter(validateExpense)

    if (type === "pie") {
      // Group expenses by category
      return (categories?.length ? categories : ["Other"])
        .map((category) => {
          const categoryExpenses = validExpenses.filter((expense) => expense.category === category)
          const total = categoryExpenses.reduce((sum, expense) => {
            const splitAmount = calculateSplitAmount(expense)
            return sum + splitAmount
          }, 0)

          // Calculate per person amount if needed
          const participantCount = categoryExpenses.reduce((sum, expense) => {
            if (expense.splitType === "equal" && expense.splitDetails) {
              return sum + Object.keys(expense.splitDetails).length
            }
            return sum + 1
          }, 0)

          return {
            name: category,
            value: Number.parseFloat(total.toFixed(2)),
            color: getCategoryColor(category),
            participants: participantCount,
            perPerson: participantCount > 0 ? Number.parseFloat((total / participantCount).toFixed(2)) : undefined,
            paidBy: getPaidByName(categoryExpenses[0]?.paidBy),
            description: categoryExpenses[0]?.description
          }
        })
        .filter((item) => item.value > 0)
    } else {
      // Group expenses by day of week
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      return days.map((day) => {
        const dayExpenses = validExpenses.filter(expense => {
          try {
            const date = new Date(expense.date)
            const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
            return weekday.startsWith(day)
          } catch (error) {
            console.error("Error parsing date:", error)
            return false
          }
        })
        
        const total = dayExpenses.reduce((sum, expense) => {
          const splitAmount = calculateSplitAmount(expense)
          return sum + splitAmount
        }, 0)

        // Calculate per person amount if needed
        const participantCount = dayExpenses.reduce((sum, expense) => {
          if (expense.splitType === "equal" && expense.splitDetails) {
            return sum + Object.keys(expense.splitDetails).length
          }
          return sum + 1
        }, 0)

        return {
          name: day,
          value: Number.parseFloat(total.toFixed(2)),
          color: getCategoryColor(day),
          participants: participantCount,
          perPerson: participantCount > 0 ? Number.parseFloat((total / participantCount).toFixed(2)) : undefined,
          paidBy: getPaidByName(dayExpenses[0]?.paidBy),
          description: dayExpenses[0]?.description
        }
      })
    }
  }, [expenses, categories, type])

  if (isLoading) {
    return (
      <ChartContainer className={cn("h-[300px]", className)}>
        <Skeleton className="h-full w-full" />
      </ChartContainer>
    )
  }

  if (error) {
    return (
      <ChartContainer className={cn("h-[300px]", className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </ChartContainer>
    )
  }

  if (!chartData.length) {
    return (
      <ChartContainer className={cn("h-[300px] flex items-center justify-center", className)}>
        <p className="text-muted-foreground">No data to display</p>
      </ChartContainer>
    )
  }

  const handleMouseEnter = (item: ChartData) => {
    setHoveredItem(item)
  }

  const handleMouseLeave = () => {
    setHoveredItem(null)
  }

  if (type === "pie") {
    return (
      <ChartContainer className={cn("h-[300px]", className)}>
        <Chart className="h-full w-full">
          <ChartPie>
            <ChartPieSeries>
              {chartData.map((item, index) => {
                const total = chartData.reduce((sum, d) => sum + d.value, 0)
                const startAngle = (index / chartData.length) * 2 * Math.PI
                const endAngle = ((index + 1) / chartData.length) * 2 * Math.PI
                const radius = 100

                const startX = 150 + radius * Math.cos(startAngle)
                const startY = 150 + radius * Math.sin(startAngle)
                const endX = 150 + radius * Math.cos(endAngle)
                const endY = 150 + radius * Math.sin(endAngle)

                const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1"

                const d = [
                  `M 150 150`,
                  `L ${startX} ${startY}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                  "Z"
                ].join(" ")

                return (
                <path
                    key={item.name}
                    d={d}
                    style={{ fill: item.color }}
                    className="transition-colors hover:opacity-80"
                    onMouseEnter={() => handleMouseEnter(item)}
                    onMouseLeave={handleMouseLeave}
                  />
                )
              })}
            </ChartPieSeries>
            <ChartTooltip>
              <ChartTooltipContent>
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium">{hoveredItem?.name || (chartData?.[0]?.name ?? '')}</div>
                  <div className="text-xs text-muted-foreground">
                    Total: ${((hoveredItem?.value || chartData?.[0]?.value) ?? 0).toFixed(2)}
                  </div>
                  {showPerPerson && (hoveredItem?.perPerson || chartData?.[0]?.perPerson) && (
                    <div className="text-xs text-muted-foreground">
                      Per Person: ${((hoveredItem?.perPerson || chartData?.[0]?.perPerson) ?? 0).toFixed(2)}
                    </div>
                  )}
                  {hoveredItem?.paidBy && (
                    <div className="text-xs text-muted-foreground">
                      Paid by: {hoveredItem.paidBy}
                    </div>
                  )}
                  {hoveredItem?.description && (
                    <div className="text-xs text-muted-foreground">
                      {hoveredItem.description}
                    </div>
                  )}
                </div>
              </ChartTooltipContent>
            </ChartTooltip>
          </ChartPie>
        </Chart>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer className={cn("h-[300px]", className)}>
      <Chart className="h-full w-full">
        <ChartBar data={chartData}>
          <ChartBarSeries>
            {chartData.map((item, index) => (
              <ChartBarItem
                key={item.name}
                className="fill-primary hover:opacity-80"
                style={{
                  height: `${(item.value / Math.max(...chartData.map(d => d.value))) * 100}%`,
                  width: "20px",
                  transform: `translateX(${index * 30}px)`,
                  backgroundColor: item.color
                }}
                onMouseEnter={() => handleMouseEnter(item)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </ChartBarSeries>
          <ChartXAxis>
            <div className="flex justify-between px-2 pt-2">
              {chartData.map(item => (
                <div key={item.name} className="text-xs text-muted-foreground">
                  {item.name}
                </div>
              ))}
            </div>
          </ChartXAxis>
          <ChartYAxis>
            <div className="flex h-full flex-col justify-between py-2">
              {[...Array(5)].map((_, i) => {
                const max = Math.max(...chartData.map(d => d.value))
                const value = max - (i * max) / 4
                return (
                  <div key={i} className="text-xs text-muted-foreground">
                    ${value.toFixed(0)}
                  </div>
                )
              })}
            </div>
          </ChartYAxis>
        </ChartBar>
        <ChartTooltip>
            <ChartTooltipContent>
              <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">{hoveredItem?.name || (chartData?.[0]?.name ?? '')}</div>
              <div className="text-xs text-muted-foreground">
                Total: ${((hoveredItem?.value || chartData?.[0]?.value) ?? 0).toFixed(2)}
              </div>
              {showPerPerson && (hoveredItem?.perPerson || chartData?.[0]?.perPerson) && (
                <div className="text-xs text-muted-foreground">
                  Per Person: ${((hoveredItem?.perPerson || chartData?.[0]?.perPerson) ?? 0).toFixed(2)}
                </div>
              )}
              {hoveredItem?.paidBy && (
                <div className="text-xs text-muted-foreground">
                  Paid by: {hoveredItem.paidBy}
                </div>
              )}
              {hoveredItem?.description && (
                <div className="text-xs text-muted-foreground">
                  {hoveredItem.description}
                </div>
              )}
              </div>
            </ChartTooltipContent>
        </ChartTooltip>
      </Chart>
    </ChartContainer>
  )
}

