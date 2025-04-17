"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { Expense, Group, User } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

interface AppContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, "id" | "paidBy" | "group">, groupId?: string) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  groups: Group[]
  addGroup: (group: Omit<Group, "id" | "members" | "totalExpenses" | "yourShare" | "isSettled">) => void
  updateGroup: (id: string, group: Partial<Group>) => void
  deleteGroup: (id: string) => void
  categories: string[]
  totalBalance: number
  totalOwed: number
  totalLent: number
  initialBalance: number
  setInitialBalance: (amount: number) => void
  totalExpenses: number
  settleDebt: (userId: string, amount: number) => void
  isLoading: boolean
  currency: string
  setCurrency: (currency: string) => void
  formatCurrency: (amount: number) => string
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [currency, setCurrency] = useState("INR")
  const [categories] = useState<string[]>([
    "Food",
    "Transport",
    "Entertainment",
    "Rent",
    "Utilities",
    "Shopping",
    "Others"
  ])
  const [initialBalance, setInitialBalance] = useState(0)

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      // Fetch user settings when user is loaded
      fetchUserSettings(parsedUser.id)
    }
  }, [])

  // Update localStorage when user changes
  useEffect(() => {
    if (isClient) {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    }
  }, [user, isClient])

  // Add function to fetch user settings
  const fetchUserSettings = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/settings?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user settings')
      }
      const result = await response.json()
      setInitialBalance(result.data?.initialBalance || 0)
    } catch (error) {
      console.error('Error fetching user settings:', error)
      toast({
        title: "Error",
        description: "Failed to fetch user settings",
        variant: "destructive",
      })
    }
  }

  // Update setInitialBalance to store in database
  const updateInitialBalance = async (newBalance: number) => {
    if (!user) return

    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          initialBalance: newBalance,
          theme: user.settings?.theme || 'dark',
          currency: user.settings?.currency || 'USD',
          notifications: user.settings?.notifications || {
            email: true,
            push: true,
            reminders: true,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user settings')
      }

      const result = await response.json()
      if (result.success) {
        setInitialBalance(newBalance)
        setUser({
          ...user,
          settings: {
            ...user.settings,
            initialBalance: newBalance,
          },
        })
      }
    } catch (error) {
      console.error('Error updating initial balance:', error)
      throw error
    }
  }

  const formatCurrency = (amount: number) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  }

  const addExpense = async (expense: Omit<Expense, "id" | "paidBy" | "group">, groupId?: string) => {
    if (!user) return;

    // Create a MongoDB-friendly expense object
    const newExpense: {
      title: string;
      description: string;
      amount: number;
      date: string;
      category: string;
      paidBy: {
        id: string;
        name: string;
        email: string;
        avatar: string;
      };
      group?: {
        id: string;
        name: string;
      };
    } = {
      title: expense.title,
      description: expense.description || '',
      amount: Number(expense.amount),
      date: expense.date || new Date().toISOString(),
      category: expense.category,
      paidBy: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }
    }

    // Only add group if groupId is provided
    if (groupId) {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        newExpense.group = {
          id: group.id,
          name: group.name
        };
      }
    }
    
    try {
      console.log('Attempting to add expense:', JSON.stringify(newExpense, null, 2));
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Failed to add expense: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Successfully added expense:', result);
      
      // Create a complete Expense object with the MongoDB _id as our id
      const completeExpense: Expense = {
        id: result.data._id,
        title: newExpense.title,
        description: newExpense.description,
        amount: newExpense.amount,
        date: newExpense.date,
        category: newExpense.category,
        paidBy: newExpense.paidBy,
        group: newExpense.group
      };
      
      setExpenses(prev => [...prev, completeExpense]);
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Add a function to fetch expenses from the database
  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/expenses')
      if (!response.ok) {
        throw new Error('Failed to fetch expenses')
      }
      const result = await response.json()
      setExpenses(result.data)
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast({
        title: "Error",
        description: "Failed to fetch expenses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  }

  // Call fetchExpenses when the component mounts
  useEffect(() => {
    if (isClient) {
      fetchExpenses()
    }
  }, [isClient])

  const updateExpense = (id: string, expenseUpdate: Partial<Expense>) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...expenseUpdate } : expense
    ))
  }

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id))
  }

  const addGroup = async (group: Omit<Group, "id" | "members" | "totalExpenses" | "yourShare" | "isSettled">) => {
    if (!user) return;

    try {
      const newGroup = {
      ...group,
      members: [
        {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          }
      ],
      totalExpenses: 0,
      yourShare: 0,
      isSettled: false,
    }

      console.log('Attempting to add group:', JSON.stringify(newGroup, null, 2));
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGroup),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Failed to add group: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Successfully added group:', result);
      
      // Create a complete Group object with the MongoDB _id as our id
      const completeGroup: Group = {
        id: result.data._id,
        name: newGroup.name,
        description: newGroup.description,
        members: newGroup.members,
        totalExpenses: newGroup.totalExpenses,
        yourShare: newGroup.yourShare,
        isSettled: newGroup.isSettled,
      };
      
      setGroups(prev => [...prev, completeGroup]);
    } catch (error) {
      console.error('Error adding group:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add group. Please try again.",
        variant: "destructive",
      });
    }
  }

  const updateGroup = async (id: string, groupUpdate: Partial<Group>) => {
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupUpdate),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Failed to update group: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Successfully updated group:', result);

      setGroups(prev => prev.map(group => {
        if (group.id === id) {
          // Calculate new totals if expenses are updated
          if (groupUpdate.members) {
            const groupExpenses = expenses.filter(expense => expense.group?.id === id)
            const totalExpenses = groupExpenses.reduce((sum, expense) => sum + expense.amount, 0)
            const yourShare = totalExpenses / groupUpdate.members.length
            
            return {
              ...group,
              ...groupUpdate,
              totalExpenses,
              yourShare,
              isSettled: totalExpenses === 0 || yourShare === 0
            }
          }
          return { ...group, ...groupUpdate }
        }
        return group
      }))
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update group. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Update group totals when expenses change
  useEffect(() => {
    if (!user) return

    setGroups(prev => prev.map(group => {
      const groupExpenses = expenses.filter(expense => expense.group?.id === group.id)
      const totalExpenses = groupExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      const yourShare = totalExpenses / group.members.length
      
      return {
        ...group,
        totalExpenses,
        yourShare,
        isSettled: totalExpenses === 0 || yourShare === 0
      }
    }))
  }, [expenses, user])

  const deleteGroup = async (id: string) => {
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Failed to delete group: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Successfully deleted group:', result);

      setGroups(prev => prev.filter(group => group.id !== id))
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete group. Please try again.",
        variant: "destructive",
      });
    }
  }

  const calculateBalances = () => {
    if (!user) return { totalBalance: 0, totalOwed: 0, totalLent: 0, totalExpenses: 0 };

    let totalOwed = 0;
    let totalLent = 0;
    let totalExpenses = 0;

    // Calculate personal expenses (not in groups)
    const personalExpenses = expenses.filter(expense => !expense.group);
    personalExpenses.forEach(expense => {
      if (expense.paidBy.id === user.id) {
        totalExpenses += expense.amount;
      }
    });

    // Calculate group expenses
    const groupExpenses = expenses.filter(expense => expense.group);
    groupExpenses.forEach(expense => {
      if (expense.paidBy.id === user.id) {
        totalLent += expense.amount;
      } else {
        totalOwed += expense.amount;
      }
    });

    // Calculate current balance (initial balance minus personal expenses)
    const currentBalance = initialBalance - totalExpenses;

    return {
      totalBalance: currentBalance,
      totalOwed,
      totalLent,
      totalExpenses,
    };
  }

  const { totalBalance, totalOwed, totalLent, totalExpenses } = calculateBalances();

  const settleDebt = (userId: string, amount: number) => {
    // Add settlement logic here
      toast({
        title: "Debt settled",
      description: `Successfully settled debt of $${amount}`,
      })
  }

  const logout = () => {
      setUser(null)
    setExpenses([])
    setGroups([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
      router.push("/login")
  }

  // Add a function to fetch groups from the database
  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/groups')
      if (!response.ok) {
        throw new Error('Failed to fetch groups')
      }
      const result = await response.json()
      setGroups(result.data)
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast({
        title: "Error",
        description: "Failed to fetch groups. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  }

  // Call fetchGroups when the component mounts
  useEffect(() => {
    if (isClient) {
      fetchGroups()
    }
  }, [isClient])

  const contextValue: AppContextType = {
        user,
        setUser,
        logout,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        groups,
        addGroup,
        updateGroup,
        deleteGroup,
        categories,
        totalBalance,
        totalOwed,
        totalLent,
        initialBalance,
        setInitialBalance: updateInitialBalance,
        totalExpenses,
        settleDebt,
        isLoading,
        currency,
        setCurrency,
        formatCurrency,
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

