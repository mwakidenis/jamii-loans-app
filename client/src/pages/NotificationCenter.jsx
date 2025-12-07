import { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    // Mock data for now - replace with actual API call
    const mockNotifications = [
      {
        _id: '1',
        type: 'loan_approved',
        title: 'Loan Approved',
        message: 'Congratulations! Your loan application for KSh 50,000 has been approved.',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata: { amount: 50000 }
      },
      {
        _id: '2',
        type: 'loan_disbursed',
        title: 'Loan Disbursed',
        message: 'Your loan of KSh 50,000 has been disbursed to your M-PESA account.',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        metadata: { amount: 50000, transactionId: 'ABC123' }
      },
      {
        _id: '3',
        type: 'payment_reminder',
        title: 'Payment Reminder',
        message: 'Your loan payment of KSh 5,500 is due in 3 days.',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        metadata: { amount: 5500, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }
      }
    ];

    setNotifications(mockNotifications);
    setLoading(false);
  };

  const markAsRead = async (notificationId) => {
    // Mock API call - replace with actual implementation
    setNotifications(prev =>
      prev.map(notif =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = async () => {
    // Mock API call - replace with actual implementation
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const getNotificationIcon = (type) => {
    const icons = {
      loan_approved: <CheckCircle className="h-5 w-5 text-green-600" />,
      loan_rejected: <XCircle className="h-5 w-5 text-red-600" />,
      loan_disbursed: <CheckCircle className="h-5 w-5 text-blue-600" />,
      payment_reminder: <Clock className="h-5 w-5 text-orange-600" />,
      loan_defaulted: <AlertTriangle className="h-5 w-5 text-red-600" />,
    };
    return icons[type] || <Info className="h-5 w-5 text-gray-600" />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      loan_approved: 'border-green-200 bg-green-50',
      loan_rejected: 'border-red-200 bg-red-50',
      loan_disbursed: 'border-blue-200 bg-blue-50',
      payment_reminder: 'border-orange-200 bg-orange-50',
      loan_defaulted: 'border-red-200 bg-red-50',
    };
    return colors[type] || 'border-gray-200 bg-gray-50';
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === 'unread' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === 'read' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Read ({notifications.filter(n => n.isRead).length})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`border rounded-lg p-4 ${getNotificationColor(notification.type)} ${
                  !notification.isRead ? 'border-l-4' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {notification.message}
                    </p>
                    {notification.metadata && (
                      <div className="mt-2 text-xs text-gray-600">
                        {notification.metadata.amount && (
                          <span>Amount: KSh {notification.metadata.amount.toLocaleString()}</span>
                        )}
                        {notification.metadata.transactionId && (
                          <span className="ml-4">Transaction ID: {notification.metadata.transactionId}</span>
                        )}
                        {notification.metadata.dueDate && (
                          <span className="ml-4">
                            Due: {new Date(notification.metadata.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications found'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                You'll receive notifications about your loan applications and payments here
              </p>
            </div>
          )}
        </div>

        {/* Load More Button (if needed) */}
        {filteredNotifications.length > 0 && filteredNotifications.length === notifications.length && (
          <div className="text-center mt-8">
            <button className="btn-secondary">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
