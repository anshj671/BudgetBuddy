import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please provide both email and password' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db('wallet-way');
    const users = db.collection('users');

    // Find user
    const user = await users.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 401 }
      );
    }

    // Check password (simple string comparison)
    if (password !== user.password) {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    // Only proceed with login if password is correct
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      { 
        message: 'Login successful', 
        user: userResponse 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
} 