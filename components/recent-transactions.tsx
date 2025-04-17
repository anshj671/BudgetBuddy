"use client"

import { formatDistanceToNow } from "date-fns"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppContext } from "@/lib/app-context"

export function RecentTransactions() {
  const { expenses } = useAppContext()

  // Get the 5 most recent transactions
  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-4">
      {recentTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={transaction.paidBy.avatar} alt={transaction.paidBy.name} />
            <AvatarFallback>{transaction.paidBy.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{transaction.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
            </p>
          </div>
          <div className={`font-medium ${transaction.paidBy.id === "user-1" ? "text-red-500" : "text-green-500"}`}>
            {transaction.paidBy.id === "user-1" ? (
              <div className="flex items-center">
                <ArrowUpIcon className="mr-1 h-4 w-4" />${transaction.amount.toFixed(2)}
              </div>
            ) : (
              <div className="flex items-center">
                <ArrowDownIcon className="mr-1 h-4 w-4" />${transaction.amount.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      ))}

      {recentTransactions.length === 0 && (
        <div className="flex h-[140px] items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No recent transactions</p>
          </div>
        </div>
      )}
    </div>
  )
}

