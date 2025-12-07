import { CheckCircle, XCircle, Clock, AlertTriangle, Info, Check } from 'lucide-react';

const NotificationItem = ({ notification, onMarkAsRead, onClick }) => {
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
      loan_approved: 'border-green-200 bg-green-50 hover:bg-green-100',
      loan_rejected: 'border-red-200 bg-red-50 hover:bg-red-100',
      loan_disbursed: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      payment_reminder: 'border-orange-200 bg-orange-50 hover:bg-orange-100',
      loan_defaulted: 'border-red-200 bg-red-50 hover:bg-red-100',
    };
    return colors[type] || 'border-gray-200 bg-gray-50 hover:bg-gray-100';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div
      className={`border-l-4 rounded-r-lg p-4 cursor-pointer transition-colors ${
        getNotificationColor(notification.type)
      } ${!notification.isRead ? 'border-l-4' : 'border-l-gray-300'}`}
      onClick={() => onClick && onClick(notification)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${
              notification.isRead ? 'text-gray-700' : 'text-gray-900'
            }`}>
              {notification.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {formatTimeAgo(notification.createdAt)}
              </span>
              {!notification.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification._id);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-xs flex items-center space-x-1"
                >
                  <Check className="h-3 w-3" />
                  <span>Mark read</span>
                </button>
              )}
            </div>
          </div>
          <p className={`text-sm mt-1 ${
            notification.isRead ? 'text-gray-600' : 'text-gray-800'
          }`}>
            {notification.message}
          </p>
          {notification.metadata && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
              {notification.metadata.amount && (
                <span className="bg-white px-2 py-1 rounded">
                  Amount: KSh {notification.metadata.amount.toLocaleString()}
                </span>
              )}
              {notification.metadata.transactionId && (
                <span className="bg-white px-2 py-1 rounded">
                  Transaction: {notification.metadata.transactionId}
                </span>
              )}
              {notification.metadata.dueDate && (
                <span className="bg-white px-2 py-1 rounded">
                  Due: {new Date(notification.metadata.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
        {!notification.isRead && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
