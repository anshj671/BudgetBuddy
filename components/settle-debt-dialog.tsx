"use client"

import type React from "react"

import { useState } from "react"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppContext } from "@/lib/app-context"

interface SettleDebtDialogProps {
  onClose: () => void
}

export function SettleDebtDialog({ onClose }: SettleDebtDialogProps) {
  const { totalOwed, settleDebt, isLoading } = useAppContext()
  const [amount, setAmount] = useState(totalOwed.toString())
  const [userId, setUserId] = useState("user-2")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    settleDebt(userId, Number.parseFloat(amount))
    onClose()
  }

  return (
    <Card className="fixed inset-0 z-50 m-auto h-fit max-h-[90vh] w-full max-w-md overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Settle Debt</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Who did you pay?</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger id="user">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="user-2" value="user-2">Sarah Williams</SelectItem>
                <SelectItem key="user-3" value="user-3">Michael Brown</SelectItem>
                <SelectItem key="user-4" value="user-4">Jessica Lee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={totalOwed}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Total amount you owe: ${totalOwed.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select defaultValue="cash">
              <SelectTrigger id="method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="cash" value="cash">Cash</SelectItem>
                <SelectItem key="bank" value="bank">Bank Transfer</SelectItem>
                <SelectItem key="upi" value="upi">UPI</SelectItem>
                <SelectItem key="other" value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || Number.parseFloat(amount) <= 0}>
            {isLoading ? "Processing..." : "Settle"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

