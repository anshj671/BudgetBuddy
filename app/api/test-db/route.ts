import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('Testing MongoDB connection...')
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)
    console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length)
    
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: false,
        error: 'MONGODB_URI environment variable is not set',
        envVars: {
          hasMongoUri: !!process.env.MONGODB_URI,
          hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
          hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        }
      }, { status: 500 })
    }

    console.log('Attempting to connect to MongoDB...')
    const client = await clientPromise
    console.log('Client received:', !!client)
    
    if (!client) {
      return NextResponse.json({
        success: false,
        error: 'MongoDB client is null/undefined after connection attempt',
        envVars: {
          hasMongoUri: !!process.env.MONGODB_URI,
          hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
          hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        }
      }, { status: 503 })
    }

    console.log('Testing database access...')
    const db = client.db('budget-buddy')
    const collections = await db.listCollections().toArray()
    console.log('Collections found:', collections.length)
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      collections: collections.map(c => c.name),
      envVars: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      }
    })
  } catch (error: any) {
    console.error('MongoDB test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      envVars: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      }
    }, { status: 500 })
  }
}
