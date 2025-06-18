import { NextResponse } from 'next/server';
import Todo from '@/models/Todo';
import connectDB from '@/utils/db';

await connectDB();

// Update a todo
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Todo ID is required' }, { status: 400 });
    }

    const { title, description, dueDate, priority, deviceId, notifications, completed } = await request.json();

    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      {
        title,
        description,
        dueDate,
        priority,
        deviceId,
        notifications,
        completed,
      },
      { new: true }
    );

    if (!updatedTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTodo, { status: 200 });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// Delete a todo
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Todo ID is required' }, { status: 400 });
    }

    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Todo deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}