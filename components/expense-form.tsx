"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, XIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAppContext } from "@/lib/app-context"
import type { Expense } from "@/lib/types"

interface ExpenseFormProps {
  expense?: Expense
  groupId?: string
  onClose: () => void
}

export function ExpenseForm({ expense, groupId, onClose }: ExpenseFormProps) {
  const { categories, groups, addExpense, updateExpense, isLoading } = useAppContext()
  const [title, setTitle] = useState(expense?.title || "")
  const [amount, setAmount] = useState(expense?.amount.toString() || "")
  const [category, setCategory] = useState(expense?.category || categories[0])
  const [description, setDescription] = useState(expense?.description || "")
  const [date, setDate] = useState<Date>(expense ? new Date(expense.date) : new Date())
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(expense?.group?.id || groupId)
  const [splitMethod, setSplitMethod] = useState("equal")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const expenseData = {
      title,
      amount: Number.parseFloat(amount),
      category,
      description,
      date: date.toISOString(),
    }

    if (expense) {
      updateExpense(expense.id, expenseData)
    } else {
      addExpense(expenseData, selectedGroupId)
    }

    onClose()
  }

  return (
    <Card className="fixed inset-0 z-50 m-auto h-fit max-h-[90vh] w-full max-w-md overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{expense ? "Edit Expense" : "Add Expense"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="group">Group (Optional)</Label>
            <Select
              value={selectedGroupId}
              onValueChange={setSelectedGroupId}
              disabled={!!groupId} // Disable if groupId is provided (adding from group page)
            >
              <SelectTrigger id="group">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>Personal Expense</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGroupId && (
            <div className="space-y-2">
              <Label>Split Method</Label>
              <RadioGroup value={splitMethod} onValueChange={setSplitMethod} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="equal" id="equal" />
                  <Label htmlFor="equal" className="cursor-pointer">
                    Equal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="percentage" disabled />
                  <Label htmlFor="percentage" className="cursor-pointer text-muted-foreground">
                    By percentage (coming soon)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" disabled />
                  <Label htmlFor="custom" className="cursor-pointer text-muted-foreground">
                    Custom amounts (coming soon)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : expense ? "Update" : "Add"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

