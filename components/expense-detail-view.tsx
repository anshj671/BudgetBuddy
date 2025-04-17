"use client"

import { useState } from "react"
import { XIcon, EditIcon, TrashIcon, CalendarIcon, TagIcon, UsersIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExpenseForm } from "@/components/expense-form"
import { useAppContext } from "@/lib/app-context"
import type { Expense, Group } from "@/lib/types"
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

interface ExpenseDetailViewProps {
  expense: Expense
  group: Group
  onClose: () => void
}

export function ExpenseDetailView({ expense, group, onClose }: ExpenseDetailViewProps) {
  const { deleteExpense } = useAppContext()
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Calculate each member's share
  const memberCount = group.members.length
  const equalShare = expense.amount / memberCount

  const handleDelete = () => {
    deleteExpense(expense.id)
    onClose()
  }

  if (showEditForm) {
    return <ExpenseForm expense={expense} onClose={() => setShowEditForm(false)} />
  }

  return (
    <>
      <Card className="fixed inset-0 z-50 m-auto h-fit max-h-[90vh] w-full max-w-md overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expense Details</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{expense.title}</h3>
            <Badge>{expense.category}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={expense.paidBy.avatar} alt={expense.paidBy.name} />
                <AvatarFallback>{expense.paidBy.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Paid by {expense.paidBy.name}</p>
                <p className="text-xs text-muted-foreground">{expense.paidBy.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${expense.amount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">${equalShare.toFixed(2)} per person</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(new Date(expense.date), "MMMM d, yyyy")}
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <TagIcon className="mr-2 h-4 w-4" />
              {expense.category}
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <UsersIcon className="mr-2 h-4 w-4" />
              Split equally among {memberCount} people
            </div>
          </div>

          {expense.description && (
            <div className="space-y-2">
              <h4 className="font-medium">Description</h4>
              <p className="text-sm">{expense.description}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Split Details</h4>
            <div className="space-y-2">
              {group.members.map((member) => {
                const isPayee = member.id === expense.paidBy.id
                return (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.name}</span>
                    </div>
                    <div className="text-right">
                      {isPayee ? (
                        <span className="text-sm text-green-500">
                          gets back ${(expense.amount - equalShare).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm text-red-500">owes ${equalShare.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" className="text-red-500" onClick={() => setShowDeleteConfirm(true)}>
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button onClick={() => setShowEditForm(true)}>
            <EditIcon className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
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
    </>
  )
}

