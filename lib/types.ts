export interface User {
  id: string
  name: string
  email: string
  avatar: string
}

export interface Expense {
  id: string
  title: string
  description: string
  amount: number
  date: string
  category: string
  paidBy: User
  group?: {
    id: string
    name: string
  }
}

export interface Group {
  id: string
  name: string
  description: string
  members: User[]
  totalExpenses: number
  yourShare: number
  isSettled: boolean
}

