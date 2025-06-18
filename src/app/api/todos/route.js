import { NextResponse } from 'next/server';
import Todo from '@/models/Todo';
import connectDB from '@/utils/db';

await connectDB();

// Get all todos for a device
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('deviceId');

  try {
    const todos = await Todo.find({ deviceId }).sort({ createdAt: -1 });
    return NextResponse.json(todos, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// Create a new todo
export async function POST(request) {
  const { title, description, dueDate, priority, deviceId, notifications } = await request.json();

  try {
    const newTodo = new Todo({
      title,
      description,
      dueDate,
      priority,
      deviceId,
      notifications,
    });

    const todo = await newTodo.save();
    return NextResponse.json(todo, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}