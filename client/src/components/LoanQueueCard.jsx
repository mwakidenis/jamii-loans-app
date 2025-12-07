import { CheckCircle, XCircle, Eye, Clock, DollarSign } from 'lucide-react';

const LoanQueueCard = ({ loan, onApprove, onReject, onViewDetails, actionLoading }) => {
  const getFeeStatusBadge = (feePaid) => {
    return feePaid ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Fee Paid
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Fee Pending
      </span>
    );
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div>
              <h3 className="font-medium text-gray-900">{loan.userId?.fullName}</h3>
              <p className="text-sm text-gray-600">{loan.userId?.email}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">KSh {loan.amount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Fee: KSh {loan.feeAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-3">
            {getFeeStatusBadge(loan.feePaid)}
            <span className="text-sm text-gray-500">
              <Clock className="h-4 w-4 inline mr-1" />
              {getTimeAgo(loan.createdAt)}
            </span>
            <span className="text-sm text-gray-500">
              ID: {loan.userId?.nationalId}
            </span>
          </div>

          {loan.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {loan.description}
            </p>
          )}
        </div>

        <div className="flex space-x-2 ml-4">
          {loan.status === 'pending' && loan.feePaid && (
            <>
              <button
                onClick={() => onApprove(loan._id)}
                disabled={actionLoading === loan._id}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {actionLoading === loan._id ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => onReject(loan._id)}
                disabled={actionLoading === loan._id}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </button>
            </>
          )}
          <button
            onClick={() => onViewDetails(loan)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Eye className="h-4 w-4 mr-1" />
            Details
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Application Progress</span>
          <span>{loan.feePaid ? 'Ready for Review' : 'Waiting for Fee Payment'}</span>
        </div>
        <div className="mt-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${loan.feePaid ? 'bg-green-500' : 'bg-yellow-500'}`}
            style={{ width: loan.feePaid ? '75%' : '50%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoanQueueCard;
