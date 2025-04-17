"use client"

import { useState } from "react"
import { format } from "date-fns"
import { MoreHorizontalIcon, PencilIcon, TrashIcon, EyeIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ExpenseForm } from "@/components/expense-form"
import { useAppContext } from "@/lib/app-context"
import type { Expense } from "@/lib/types"
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

interface ExpenseListProps {
  expenses: Expense[]
  onViewDetail?: (expense: Expense) => void
}

export function ExpenseList({ expenses, onViewDetail }: ExpenseListProps) {
  const { deleteExpense, formatCurrency } = useAppContext()
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteConfirmExpense, setDeleteConfirmExpense] = useState<Expense | null>(null)

  const handleDelete = () => {
    if (deleteConfirmExpense) {
      deleteExpense(deleteConfirmExpense.id)
      setDeleteConfirmExpense(null)
    }
  }

  return (
    <>
      {editingExpense && <ExpenseForm expense={editingExpense} onClose={() => setEditingExpense(null)} />}

      <AlertDialog open={!!deleteConfirmExpense} onOpenChange={(open) => !open && setDeleteConfirmExpense(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this expense and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
        {expenses.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No expenses found</p>
            </div>
          </div>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={expense.paidBy.avatar} alt={expense.paidBy.name} />
                    <AvatarFallback>{expense.paidBy.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{expense.title}</h3>
                    <p className="text-sm text-muted-foreground">{expense.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(expense.amount)}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(expense.date), "MMM d, yyyy")}</p>
                  </div>
                  <Badge variant="outline">{expense.category}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onViewDetail && (
                        <DropdownMenuItem onClick={() => onViewDetail(expense)}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => setEditingExpense(expense)}>
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteConfirmExpense(expense)}>
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  )
}

