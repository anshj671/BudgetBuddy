import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await clientPromise;
    if (!client) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }
    
    const db = client.db('budget-buddy');
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      email: email.toLowerCase(),
      password, // Store password as plain text
      name,
      createdAt: new Date()
    };

    const result = await users.insertOne(newUser);

    // Remove password from response
    const userResponse = {
      id: result.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json(
      { message: 'User created successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
} 