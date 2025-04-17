"use client"

import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, DollarSignIcon, UsersIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ExpenseChart } from "@/components/expense-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import { ExpenseForm } from "@/components/expense-form"
import { useAppContext } from "@/lib/app-context"
import { SettleDebtDialog } from "@/components/settle-debt-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem } from "@/components/ui/select"

export default function DashboardPage() {
  const { 
    user, 
    expenses, 
    totalBalance, 
    totalOwed, 
    totalLent, 
    initialBalance,
    setInitialBalance,
    totalExpenses,
    isLoading, 
    formatCurrency, 
    groups,
    categories
  } = useAppContext()
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showSettleDialog, setShowSettleDialog] = useState(false)
  const [showInitialBalanceForm, setShowInitialBalanceForm] = useState(false)
  const [newInitialBalance, setNewInitialBalance] = useState(initialBalance.toString())

  const handleInitialBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await setInitialBalance(Number(newInitialBalance))
    setShowInitialBalanceForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowExpenseForm(true)}>Add Expense</Button>
          <Button variant="outline" onClick={() => setShowInitialBalanceForm(true)}>
            Set Initial Balance
          </Button>
        </div>
      </div>

      {showInitialBalanceForm && (
        <Card>
          <CardHeader>
            <CardTitle>Set Initial Balance</CardTitle>
            <CardDescription>Enter your starting balance for the month</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInitialBalanceSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="initialBalance">Initial Balance</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  value={newInitialBalance}
                  onChange={(e) => setNewInitialBalance(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <Button type="submit">Save</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} />}
      {showSettleDialog && <SettleDebtDialog onClose={() => setShowSettleDialog(false)} />}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger key="overview" value="overview">Overview</TabsTrigger>
          <TabsTrigger key="expenses" value="expenses">Expenses</TabsTrigger>
          <TabsTrigger key="analytics" value="analytics">Analytics</TabsTrigger>
          <TabsTrigger key="groups" value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div key="overview-stats-grid" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
                <p className="text-xs text-muted-foreground">
                  Initial: {formatCurrency(initialBalance)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <ArrowUpIcon className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">
                  {expenses.filter(expense => !expense.group).length} personal expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Group Balance</CardTitle>
                <ArrowDownIcon className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{formatCurrency(totalLent - totalOwed)}</div>
                <p className="text-xs text-muted-foreground">
                  {totalLent - totalOwed >= 0 ? "You are owed" : "You owe"} {formatCurrency(Math.abs(totalLent - totalOwed))}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{groups.filter(g => !g.isSettled).length}</div>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-muted-foreground"
                  onClick={() => (window.location.href = "/groups")}
                >
                  View all groups
                </Button>
              </CardContent>
            </Card>
          </div>

          <div key="overview-expenses-grid" className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div key="recent-expenses-container" className="space-y-4">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between">
                      <div key={`${expense.id}-left`} className="flex items-center space-x-4">
                        <div key={`${expense.id}-content`} className="flex flex-col">
                          <p className="font-medium">{expense.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString()} • {expense.category}
                          </p>
                        </div>
                      </div>
                      <div key={`${expense.id}-right`} className="text-right">
                        <p className={`font-medium ${expense.paidBy.id === user?.id ? 'text-red-500' : 'text-green-500'}`}>
                          {expense.paidBy.id === user?.id ? '-' : '+'}{formatCurrency(expense.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {expense.group ? expense.group.name : 'Personal'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Expense Overview</CardTitle>
                <CardDescription>Your spending pattern</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ExpenseChart type="bar" expenses={expenses} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card key="all-expenses-card">
            <CardHeader>
              <CardTitle>All Expenses</CardTitle>
              <CardDescription>View and manage your expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div key="all-expenses-container" className="space-y-4">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div key={`${expense.id}-left`} className="flex items-center space-x-4">
                      <div key={`${expense.id}-content`} className="flex flex-col">
                        <p className="font-medium">{expense.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString()} • {expense.category}
                        </p>
                      </div>
                    </div>
                    <div key={`${expense.id}-right`} className="text-right">
                      <p className={`font-medium ${expense.paidBy.id === user?.id ? 'text-red-500' : 'text-green-500'}`}>
                        {expense.paidBy.id === user?.id ? '-' : '+'}{formatCurrency(expense.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {expense.group ? expense.group.name : 'Personal'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card key="expense-distribution-card">
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseChart type="pie" expenses={expenses} />
            </CardContent>
          </Card>

          <Card key="monthly-expenses-card">
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseChart type="bar" expenses={expenses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card key="groups-list-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Groups</CardTitle>
                <CardDescription>Manage your shared expenses with friends and family</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => (window.location.href = "/groups")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div key="groups-container" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groups.slice(0, 3).map((group) => (
                  <Card key={group.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{group.name}</CardTitle>
                      <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{group.members.length} members</div>
                      <p className="text-xs text-muted-foreground">
                        Total expenses: {formatCurrency(group.totalExpenses)}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() => (window.location.href = `/groups/${group.id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

