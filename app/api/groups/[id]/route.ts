import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('wallet-way')
    const groups = db.collection('groups')

    const group = await groups.findOne({ _id: new ObjectId(params.id) })
    
    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: group
    })
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch group' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('wallet-way')
    const groups = db.collection('groups')

    const updates = await request.json()
    updates.updatedAt = new Date()

    const result = await groups.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updates }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { id: params.id, ...updates }
    })
  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update group' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('wallet-way')
    const groups = db.collection('groups')

    const result = await groups.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete group' },
      { status: 500 }
    )
  }
} 