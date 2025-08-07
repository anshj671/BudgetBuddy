import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  let client;
  try {
    console.log('Received expense creation request');
    client = await clientPromise
    console.log('MongoDB client connected');
    
    const db = client.db('budget-buddy')
    const expenses = db.collection('expenses')

    const expense = await request.json()
    console.log('Parsed expense data:', JSON.stringify(expense, null, 2));
    
    // Validate required fields and types
    if (!expense.title || !expense.amount || !expense.category || !expense.paidBy) {
      console.error('Missing or invalid required fields:', {
        hasTitle: !!expense.title,
        hasAmount: !!expense.amount,
        hasCategory: !!expense.category,
        hasPaidBy: !!expense.paidBy,
        amountType: typeof expense.amount
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing or invalid required fields',
          details: {
            hasTitle: !!expense.title,
            hasAmount: !!expense.amount,
            hasCategory: !!expense.category,
            hasPaidBy: !!expense.paidBy,
            amountType: typeof expense.amount
          }
        },
        { status: 400 }
      )
    }

    // Ensure amount is a number
    if (typeof expense.amount !== 'number') {
      expense.amount = Number(expense.amount);
    }
    
    // Add timestamp
    expense.createdAt = new Date()
    expense.updatedAt = new Date()

    console.log('Attempting to insert expense into database with structure:', {
      title: typeof expense.title,
      amount: typeof expense.amount,
      category: typeof expense.category,
      date: expense.date,
      paidBy: expense.paidBy,
      group: expense.group
    });
    
    const result = await expenses.insertOne(expense)
    console.log('Successfully inserted expense:', result);
    
    return NextResponse.json({
      success: true,
      data: {
        ...expense,
        _id: result.insertedId
      }
    })
  } catch (error: unknown) {
    console.error('Error creating expense:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'An unknown error occurred'
        }
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('budget-buddy')
    const expenses = db.collection('expenses')

    const allExpenses = await expenses.find({}).toArray()
    
    return NextResponse.json({
      success: true,
      data: allExpenses
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
} 