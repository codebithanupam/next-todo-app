'use client';
import { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaSearch } from 'react-icons/fa';

const TodoList = ({ deviceId, todos, onTodoUpdated, onTodoDeleted }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Mark initial load as complete after first render
    const timer = setTimeout(() => setIsInitialLoad(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredTodos = todos.filter((todo) => {
    // Skip optimistic todos that failed to save
    if (todo.isOptimistic && todo.failed) return false;
    
    // Apply status filter
    if (filter === 'completed' && !todo.completed) return false;
    if (filter === 'active' && todo.completed) return false;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        todo.title.toLowerCase().includes(term) ||
        (todo.description && todo.description.toLowerCase().includes(term))
      );
    }
    
    return true;
  });

  const handleTodoUpdate = (updatedTodo) => {
    onTodoUpdated(updatedTodo);
  };

  const handleTodoDelete = (deletedId) => {
    onTodoDeleted(deletedId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">My Todos</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search todos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {isInitialLoad ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin text-blue-500">
            <FaSpinner size={24} />
          </div>
        </div>
      ) : filteredTodos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <p className="text-gray-500">
            {searchTerm 
              ? 'No matching todos found' 
              : 'No todos found. Add a new todo to get started!'}
          </p>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredTodos.map((todo) => (
              <motion.div
                key={todo._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
                className={todo.isOptimistic ? 'opacity-80' : ''}
              >
                <TodoItem 
                  todo={todo} 
                  deviceId={deviceId}
                  onUpdate={handleTodoUpdate}
                  onDelete={handleTodoDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default TodoList;