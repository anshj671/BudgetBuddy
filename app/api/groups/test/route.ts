import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('wallet-way')
    const groups = db.collection('groups')

    // Get the first group to check structure
    const sampleGroup = await groups.findOne({})
    
    // Get count of groups
    const count = await groups.countDocuments()
    
    return NextResponse.json({
      success: true,
      message: 'Groups collection test successful',
      sampleGroup,
      totalGroups: count
    })
  } catch (error) {
    console.error('Groups collection test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test groups collection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 