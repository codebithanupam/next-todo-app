'use client';
import { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaSpinner, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const TodoForm = ({ deviceId, onTodoAdded }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    notifications: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create optimistic todo (temporary client-side only)
      const optimisticTodo = {
        _id: `temp-${Date.now()}`,
        ...formData,
        deviceId,
        createdAt: new Date().toISOString(),
        completed: false,
        isOptimistic: true // Mark as optimistic
      };

      // Immediately show the todo in the list
      onTodoAdded(optimisticTodo);

      // Reset form
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        notifications: false
      });

      // Close form on mobile after submission
      if (isMobile) {
        setIsFormOpen(false);
      }

      // Make the actual API call
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          deviceId
        }),
      });

      if (!response.ok) throw new Error('Failed to add todo');

      const newTodo = await response.json();
      
      // Replace optimistic todo with real todo from server
      onTodoAdded(newTodo, optimisticTodo._id);

      // Visual feedback
      toast.success(
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <FaCheck className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="font-medium">Todo added!</p>
            <p className="text-sm text-gray-500">{formData.title}</p>
          </div>
        </div>,
        {
          duration: 2000,
          position: isMobile ? 'top-center' : 'top-right'
        }
      );

    } catch (error) {
      // Remove optimistic todo if there was an error
      onTodoAdded(null, optimisticTodo._id);
      
      toast.error(error.message, { 
        position: isMobile ? 'top-center' : 'top-right',
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isMobile) {
    return (
      <div className="fixed bottom-6 right-6 z-10">
        {isFormOpen ? (
          <div className="bg-white rounded-xl shadow-xl p-4 w-[calc(100vw-3rem)] max-w-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Todo</h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Title*"
                  required
                />
              </div>
              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Description"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={formData.notifications}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm">Notify me</label>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all ${
                  isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaCheck />
                    <span>Save Todo</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <motion.button
            onClick={() => setIsFormOpen(true)}
            className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus size={20} />
          </motion.button>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FaPlus className="text-blue-500" />
        Add New Todo
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title*</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="notifications"
            checked={formData.notifications}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 text-sm">Enable notifications</label>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all ${
            isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            'Add Todo'
          )}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;