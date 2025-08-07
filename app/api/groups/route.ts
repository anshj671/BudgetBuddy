import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  let client;
  try {
    console.log('Received group creation request');
    client = await clientPromise
    console.log('MongoDB client connected');
    
    const db = client.db('budget-buddy')
    const groups = db.collection('groups')

    const group = await request.json()
    console.log('Parsed group data:', JSON.stringify(group, null, 2));
    
    // Validate required fields
    if (!group.name || !group.description || !group.members) {
      console.error('Missing required fields:', {
        hasName: !!group.name,
        hasDescription: !!group.description,
        hasMembers: !!group.members
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          details: {
            hasName: !!group.name,
            hasDescription: !!group.description,
            hasMembers: !!group.members
          }
        },
        { status: 400 }
      )
    }
    
    // Add timestamp
    group.createdAt = new Date()
    group.updatedAt = new Date()
    group.totalExpenses = 0
    group.yourShare = 0
    group.isSettled = false

    console.log('Attempting to insert group into database');
    const result = await groups.insertOne(group)
    console.log('Successfully inserted group:', result);
    
    return NextResponse.json({
      success: true,
      data: {
        ...group,
        _id: result.insertedId
      }
    })
  } catch (error: unknown) {
    console.error('Error creating group:', {
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
    const groups = db.collection('groups')

    const allGroups = await groups.find({}).toArray()
    
    return NextResponse.json({
      success: true,
      data: allGroups
    })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
} 