"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, PlusIcon, UserPlusIcon, EditIcon, TrashIcon, CalendarIcon, CheckIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { GroupReports } from "@/components/group-reports"
import { GroupEditForm } from "@/components/group-edit-form"
import { MemberManagement } from "@/components/member-management"
import { ExpenseDetailView } from "@/components/expense-detail-view"
import { useAppContext } from "@/lib/app-context"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Expense } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { groups, expenses, deleteGroup, updateGroup, addExpense, isLoading, categories, formatCurrency, user } = useAppContext()

  // State management
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showMemberManagement, setShowMemberManagement] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [activeTab, setActiveTab] = useState("expenses")

  // Filtering state
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [memberFilter, setMemberFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const groupId = params.id as string
  const group = groups.find((g) => g.id === groupId)

  // If group not found, redirect to groups page
  useEffect(() => {
    if (!group && !isLoading) {
      router.push("/groups")
    }
  }, [group, router, isLoading])

  if (!group) {
    return null
  }

  // Get expenses for this group
  const groupExpenses = expenses.filter((expense) => expense.group && expense.group.id === groupId)

  // Apply filters to expenses
  const filteredExpenses = groupExpenses.filter((expense) => {
    // Filter by search query
    const matchesSearch =
      expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by category
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter

    // Filter by member
    const matchesMember = memberFilter === "all" || expense.paidBy.id === memberFilter

    // Filter by date range
    const expenseDate = new Date(expense.date)
    const matchesDateRange =
      (!dateRange.from || expenseDate >= dateRange.from) && (!dateRange.to || expenseDate <= dateRange.to)

    return matchesSearch && matchesCategory && matchesMember && matchesDateRange
  })

  // Calculate member balances
  const memberBalances = group.members.map((member) => {
    // Calculate what this member paid
    const paid = groupExpenses
      .filter((expense) => expense.paidBy.id === member.id)
      .reduce((sum, expense) => sum + expense.amount, 0)

    // Calculate this member's share of all expenses
    const totalExpenses = groupExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const share = totalExpenses / group.members.length

    // Calculate balance (positive means others owe this member)
    const balance = paid - share

    return {
      member,
      paid,
      share,
      balance,
    }
  })

  const handleDeleteGroup = () => {
    deleteGroup(groupId)
    router.push("/groups")
    toast({
      title: "Group deleted",
      description: `${group.name} has been deleted successfully.`,
    })
  }

  const handleViewExpenseDetail = (expense: Expense) => {
    setSelectedExpense(expense)
  }

  const handleAddExpense = (expenseData: any) => {
    addExpense(expenseData, groupId)
    setShowExpenseForm(false)
    toast({
      title: "Expense added",
      description: `${formatCurrency(expenseData.amount)} for ${expenseData.title}`,
    })
  }

  const handleSettleUp = () => {
    toast({
      title: "Settle up",
      description: "This feature will be available in the next update.",
    })
  }

  const resetFilters = () => {
    setDateRange({ from: undefined, to: undefined })
    setCategoryFilter("all")
    setMemberFilter("all")
    setSearchQuery("")
  }

  return (
    <div className="space-y-6">
      {/* Header with navigation and actions */}
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/groups")}>
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center">
              {group.name}
              {group.isSettled && (
                <Badge className="ml-2" variant="outline">
                  Settled
                </Badge>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">{group.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowEditForm(true)}>
            <EditIcon className="mr-2 h-4 w-4" />
            Edit Group
          </Button>
          <Button onClick={() => setShowExpenseForm(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Forms and dialogs */}
      {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} groupId={groupId} />}

      {showEditForm && <GroupEditForm group={group} onClose={() => setShowEditForm(false)} />}

      {showMemberManagement && <MemberManagement group={group} onClose={() => setShowMemberManagement(false)} />}

      {selectedExpense && (
        <ExpenseDetailView expense={selectedExpense} group={group} onClose={() => setSelectedExpense(null)} />
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the group and all associated expenses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <CardTitle>Expenses</CardTitle>
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
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
                        selected={{
                          from: dateRange.from,
                          to: dateRange.to,
                        }}
                        onSelect={(range) =>
                          setDateRange({
                            from: range?.from,
                            to: range?.to,
                          })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="category" className="mt-1">
                      <SelectValue placeholder="Select category" />
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
                </div>

                <div>
                  <Label htmlFor="member">Paid By</Label>
                  <Select value={memberFilter} onValueChange={setMemberFilter}>
                    <SelectTrigger id="member" className="mt-1">
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {group.members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense List */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Expense List</CardTitle>
                <CardDescription>{filteredExpenses.length} expenses found</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseList expenses={filteredExpenses} onViewDetail={handleViewExpenseDetail} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>Group expense overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Total expenses:</span>
                    <span className="font-medium">{formatCurrency(group.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Your share:</span>
                    <span className="font-medium">{formatCurrency(group.yourShare)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Your contribution:</span>
                    <span className="font-medium">
                      {formatCurrency(groupExpenses
                        .filter((e) => e.paidBy.id === user?.id)
                        .reduce((sum, e) => sum + e.amount, 0))}
                    </span>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <h4 className="font-medium">Member Balances</h4>
                    {memberBalances.map(({ member, balance }) => (
                      <div key={member.id} className="flex justify-between text-sm">
                        <span>{member.name}</span>
                        <span className={cn(
                          "font-medium",
                          balance > 0 ? "text-green-600" : balance < 0 ? "text-red-600" : ""
                        )}>
                          {formatCurrency(balance)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" disabled={group.isSettled} onClick={handleSettleUp}>
                  Settle Up
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Group Members</CardTitle>
                <CardDescription>{group.members.length} members in this group</CardDescription>
              </div>
              <Button onClick={() => setShowMemberManagement(true)}>
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Manage Members
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {memberBalances.map(({ member, paid, share, balance }) => (
                  <div key={member.id} className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {balance >= 0 ? "gets back" : "owes"} ${Math.abs(balance).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Paid ${paid.toFixed(2)} of ${share.toFixed(2)} share
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={(paid / share) * 100}
                      className="h-2"
                      // Green if paid more than share, red if paid less
                      color={balance >= 0 ? "bg-green-500" : "bg-red-500"}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settlement Plan</CardTitle>
              <CardDescription>Suggested payments to settle the group</CardDescription>
            </CardHeader>
            <CardContent>
              {group.isSettled ? (
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <CheckIcon className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p className="font-medium">All settled up!</p>
                    <p className="text-sm text-muted-foreground">Everyone has paid their fair share.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Generate settlement plan */}
                  {memberBalances
                    .filter((b) => b.balance < 0) // Members who owe money
                    .flatMap((debtor) => {
                      const creditors = memberBalances.filter((b) => b.balance > 0)
                      return creditors
                        .map((creditor) => {
                          // Calculate how much this debtor should pay this creditor
                          // This is a simplified algorithm - in a real app, you'd optimize this
                          const amount = Math.min(Math.abs(debtor.balance), creditor.balance)
                          if (amount <= 0) return null

                          return (
                            <div
                              key={`${debtor.member.id}-${creditor.member.id}`}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={debtor.member.avatar} alt={debtor.member.name} />
                                  <AvatarFallback>{debtor.member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={creditor.member.avatar} alt={creditor.member.name} />
                                  <AvatarFallback>{creditor.member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div>
                                <p className="font-medium">{formatCurrency(amount)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {debtor.member.name} pays {creditor.member.name}
                                </p>
                              </div>
                            </div>
                          )
                        })
                        .filter(Boolean)
                    })}

                  {memberBalances.every((b) => Math.abs(b.balance) < 0.01) && (
                    <div className="flex items-center justify-center py-6">
                      <div className="text-center">
                        <CheckIcon className="mx-auto h-8 w-8 text-green-500 mb-2" />
                        <p className="font-medium">All settled up!</p>
                        <p className="text-sm text-muted-foreground">Everyone has paid their fair share.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={group.isSettled || memberBalances.every((b) => Math.abs(b.balance) < 0.01)}
                onClick={handleSettleUp}
              >
                Settle Up
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <GroupReports expenses={groupExpenses} group={group} />
        </TabsContent>
      </Tabs>

      {/* Delete Group Button */}
      <div className="flex justify-end pt-4">
        <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
          <TrashIcon className="mr-2 h-4 w-4" />
          Delete Group
        </Button>
      </div>
    </div>
  )
}

// Helper component for the arrow icon
function ArrowRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

