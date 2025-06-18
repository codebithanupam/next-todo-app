'use client';
import { useState } from 'react';
import { FaTrash, FaEdit, FaBell, FaCheck, FaExclamation, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const TodoItem = ({ todo, deviceId, onUpdate, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: todo.title,
    description: todo.description,
    dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : '',
    priority: todo.priority,
    notifications: todo.notifications
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          deviceId,
          completed: todo.completed,
        }),
      });

      if (!res.ok) throw new Error('Failed to update todo');
      
      const updatedTodo = await res.json();
      onUpdate(updatedTodo);
      setIsEditModalOpen(false);
      
      toast.success(
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <p className="font-medium">Todo updated!</p>
            <p className="text-sm text-gray-500">{formData.title}</p>
          </div>
        </div>,
        {
          duration: 3000,
          position: 'top-center'
        }
      );
    } catch (error) {
      toast.error(error.message, { position: 'top-center' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete todo');
      
      onDelete(todo._id);
      setIsDeleteModalOpen(false);
      
      toast.success(
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <p className="font-medium">Todo deleted</p>
            <p className="text-sm text-gray-500">{todo.title}</p>
          </div>
        </div>,
        {
          duration: 3000,
          position: 'top-center'
        }
      );
    } catch (error) {
      toast.error(error.message, { position: 'top-center' });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleComplete = async () => {
    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...todo,
          completed: !todo.completed,
        }),
      });

      if (!res.ok) throw new Error('Failed to update todo');
      
      const updatedTodo = await res.json();
      onUpdate(updatedTodo);
      
      toast.success(
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <p className="font-medium">Todo marked as {!todo.completed ? 'complete' : 'incomplete'}</p>
            <p className="text-sm text-gray-500">{todo.title}</p>
          </div>
        </div>,
        {
          duration: 3000,
          position: 'top-center'
        }
      );
    } catch (error) {
      toast.error(error.message, { position: 'top-center' });
    }
  };

  const isDueSoon = () => {
    if (!todo.dueDate || todo.completed) return false;
    const dueDate = new Date(todo.dueDate);
    const now = new Date();
    return dueDate > now && dueDate - now < 24 * 60 * 60 * 1000;
  };

  const isOverdue = () => {
    if (!todo.dueDate || todo.completed) return false;
    return new Date(todo.dueDate) < new Date();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={`relative p-5 rounded-xl shadow-sm border transition-all duration-200 ${
        todo.completed 
          ? 'bg-green-50 border-green-100' 
          : 'bg-white border-gray-100 hover:shadow-md'
      } ${
        isDueSoon() ? 'border-l-4 border-l-yellow-500' : ''
      } ${
        isOverdue() && !todo.completed ? 'border-l-4 border-l-red-500' : ''
      }`}
    >
      {/* Todo Content */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-semibold ${
              todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
            }`}>
              {todo.title}
            </h3>
            {todo.notifications && (
              <span className="text-yellow-500">
                <FaBell size={14} />
              </span>
            )}
            {isDueSoon() && (
              <span className="text-yellow-500">
                <FaExclamation size={14} />
              </span>
            )}
          </div>
          
          {todo.description && (
            <p className={`mt-1.5 text-gray-600 ${
              todo.completed ? 'line-through' : ''
            }`}>
              {todo.description}
            </p>
          )}
          
          <div className="mt-3 flex flex-wrap gap-2">
            {todo.dueDate && (
              <span className={`text-xs px-2.5 py-1 rounded-full ${
                isOverdue() && !todo.completed
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                Due: {new Date(todo.dueDate).toLocaleString()}
              </span>
            )}
            
            <span className={`text-xs px-2.5 py-1 rounded-full ${
              todo.priority === 'high'
                ? 'bg-red-100 text-red-800'
                : todo.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {todo.priority} priority
            </span>
            
            {todo.completed && (
              <span className="text-xs px-2.5 py-1 bg-green-100 text-green-800 rounded-full">
                Completed
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={toggleComplete}
            className={`p-2.5 rounded-full transition-all ${
              todo.completed
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <FaCheck size={14} />
          </button>
          
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
            title="Edit"
          >
            <FaEdit size={14} />
          </button>
          
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
            title="Delete"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Todo</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="datetime-local"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      onChange={handleInputChange}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Enable notifications
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className={`px-4 py-2.5 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                      isUpdating
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isUpdating ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      'Update Todo'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Confirm Delete</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this todo?</p>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={`px-4 py-2.5 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                      isDeleting
                        ? 'bg-red-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isDeleting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      'Delete Todo'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TodoItem;