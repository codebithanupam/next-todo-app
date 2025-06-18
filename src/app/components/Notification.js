'use client';
import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const Notification = ({ todos, deviceId }) => {
  useEffect(() => {
    const checkNotifications = () => {
      if (!todos || !Array.isArray(todos)) return;
      
      const now = new Date();
      todos.forEach((todo) => {
        if (todo.notifications && todo.dueDate && !todo.completed) {
          const dueDate = new Date(todo.dueDate);
          const timeDiff = dueDate.getTime() - now.getTime();
          
          // Notify if due date is within 1 hour and not already notified
          if (timeDiff > 0 && timeDiff <= 3600000 && !todo.notified) {
            toast.custom((t) => (
              <div className={`max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 transition-all duration-300 ${
                t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Todo due soon!
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {todo.title}
                      </p>
                      <p className="mt-1 text-xs text-yellow-600">
                        Due at: {new Date(todo.dueDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ), {
              duration: 10000,
              position: 'top-right',
              id: `todo-notification-${todo._id}`,
            });
          }
        }
      });
    };

    const interval = setInterval(checkNotifications, 60000);
    checkNotifications();

    return () => clearInterval(interval);
  }, [todos, deviceId]);

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: '',
        style: {
          padding: '0',
          background: 'transparent',
          boxShadow: 'none',
        },
      }}
    />
  );
};

export default Notification;