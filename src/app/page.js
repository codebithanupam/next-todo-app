'use client';
import { useState, useEffect } from 'react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import Notification from './components/Notification';
import { getDeviceId } from '../utils/device';
import { FaSpinner } from 'react-icons/fa';

export default function Home() {
  const [deviceId, setDeviceId] = useState('');
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      const id = getDeviceId();
      setDeviceId(id);
      await fetchTodos(id);
    };

    const fetchTodos = async (deviceId) => {
      try {
        setLoading(true);
        const res = await fetch(`/api/todos?deviceId=${deviceId}`);
        const data = await res.json();
        setTodos(data);
      } catch (error) {
        console.error('Failed to fetch todos:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleTodoAdded = (newTodo, tempId) => {
    if (tempId) {
      // If tempId is provided, this is either:
      // 1. Replacing an optimistic todo with the real one from server
      // 2. Removing a failed optimistic todo
      
      if (!newTodo) {
        // Remove failed optimistic todo
        setTodos(prev => prev.filter(todo => todo._id !== tempId));
      } else {
        // Replace optimistic todo with real todo
        setTodos(prev => prev.map(todo => 
          todo._id === tempId ? newTodo : todo
        ));
      }
    } else {
      // This is a new optimistic todo
      setTodos(prev => [newTodo, ...prev]);
    }
  };

  const handleTodoUpdated = (updatedTodo) => {
    setTodos(prev => prev.map(todo => 
      todo._id === updatedTodo._id ? updatedTodo : todo
    ));
  };

  const handleTodoDeleted = (deletedId) => {
    setTodos(prev => prev.filter(todo => todo._id !== deletedId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Your Todo App</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TodoForm deviceId={deviceId} onTodoAdded={handleTodoAdded} />
          </div>
          
          <div className="lg:col-span-2">
            <TodoList 
              deviceId={deviceId}
              todos={todos}
              onTodoUpdated={handleTodoUpdated}
              onTodoDeleted={handleTodoDeleted}
            />
          </div>
        </div>
        
        <Notification todos={todos} deviceId={deviceId} />
      </div>
    </main>
  );
}