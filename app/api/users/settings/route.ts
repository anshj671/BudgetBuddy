import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  try {
    // Get user ID from the URL
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('wallet-way')
    const settings = db.collection('userSettings')

    const userSettings = await settings.findOne({ userId })
    
    return NextResponse.json({
      success: true,
      data: userSettings || { initialBalance: 0, currentBalance: 0 }
    })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, initialBalance, currentBalance } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('wallet-way')
    const settings = db.collection('userSettings')

    // Update or insert user settings
    const result = await settings.updateOne(
      { userId },
      { 
        $set: { 
          userId,
          initialBalance: Number(initialBalance),
          currentBalance: Number(currentBalance),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      data: { userId, initialBalance, currentBalance }
    })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user settings' },
      { status: 500 }
    )
  }
} 