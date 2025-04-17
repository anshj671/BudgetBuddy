"use client"

import { useState } from "react"
import { PlusIcon, SearchIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { useAppContext } from "@/lib/app-context"

export default function ExpensesPage() {
  const { expenses, categories } = useAppContext()
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(
      (expense) =>
        (categoryFilter === "all" || expense.category === categoryFilter) &&
        (expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expense.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sortBy === "amount-desc") return b.amount - a.amount
      if (sortBy === "amount-asc") return a.amount - b.amount
      return 0
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowExpenseForm(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} />}

      <Card>
        <CardHeader>
          <CardTitle>Manage Expenses</CardTitle>
          <CardDescription>View, filter, and search through all your expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search expenses..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" className="mt-6">
            <TabsList>
              <TabsTrigger value="all">All Expenses</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="group">Group</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <ExpenseList expenses={filteredExpenses} />
            </TabsContent>

            <TabsContent value="personal" className="mt-4">
              <ExpenseList expenses={filteredExpenses.filter((expense) => !expense.group)} />
            </TabsContent>

            <TabsContent value="group" className="mt-4">
              <ExpenseList expenses={filteredExpenses.filter((expense) => expense.group)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

