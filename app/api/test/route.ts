import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { CollectionInfo } from 'mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('budget-buddy')
    
    // Test the connection by listing collections
    const collections = await db.listCollections().toArray()
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MongoDB',
      collections: collections.map((c: CollectionInfo) => c.name)
    })
  } catch (error) {
    console.error('MongoDB connection error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to MongoDB',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 