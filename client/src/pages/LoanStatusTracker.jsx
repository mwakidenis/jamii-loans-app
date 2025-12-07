import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoan } from '../context/LoanContext';

const LoanStatusTracker = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const { user } = useAuth();
  const { fetchLoanHistory } = useLoan();
  const navigate = useNavigate();

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    const result = await fetchLoanHistory();
    if (result.success) {
      setLoans(result.data);
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="h-5 w-5 text-yellow-600" />,
      approved: <CheckCircle className="h-5 w-5 text-green-600" />,
      rejected: <XCircle className="h-5 w-5 text-red-600" />,
      paid: <CheckCircle className="h-5 w-5 text-blue-600" />,
      defaulted: <AlertTriangle className="h-5 w-5 text-red-600" />,
    };
    return icons[status] || <Clock className="h-5 w-5 text-gray-600" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'border-yellow-200 bg-yellow-50',
      approved: 'border-green-200 bg-green-50',
      rejected: 'border-red-200 bg-red-50',
      paid: 'border-blue-200 bg-blue-50',
      defaulted: 'border-red-200 bg-red-50',
    };
    return colors[status] || 'border-gray-200 bg-gray-50';
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      paid: 'status-paid',
      defaulted: 'status-defaulted',
    };

    return (
      <span className={`status-badge ${statusClasses[status] || 'status-pending'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getNextSteps = (loan) => {
    switch (loan.status) {
      case 'pending':
        return 'Your application is being reviewed by our admin team. This usually takes 24-48 hours.';
      case 'approved':
        if (loan.disbursementStatus === 'pending') {
          return 'Your loan has been approved! Funds will be disbursed to your M-PESA account shortly.';
        } else if (loan.disbursementStatus === 'processing') {
          return 'Your loan disbursement is being processed. You will receive a confirmation SMS once completed.';
        } else if (loan.disbursementStatus === 'completed') {
          return 'Your loan has been successfully disbursed. Check your M-PESA account for the funds.';
        }
        return 'Your loan has been approved! Please wait for disbursement.';
      case 'rejected':
        return `Your application was not approved. Reason: ${loan.rejectionReason || 'Contact support for more details.'}`;
      case 'paid':
        return 'Your loan has been fully repaid. Thank you for using JAMII Loan!';
      case 'defaulted':
        return 'Your loan is in default status. Please contact support to resolve this issue.';
      default:
        return 'Status unknown. Please contact support if you have questions.';
    }
  };

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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Loan Status Tracker</h1>
            </div>
            <button
              onClick={loadLoans}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loans.length > 0 ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loans.filter(l => l.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loans.filter(l => l.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loans.filter(l => l.status === 'rejected').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Paid</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loans.filter(l => l.status === 'paid').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loans List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Your Loan Applications</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {loans.map((loan) => (
                  <div key={loan._id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(loan.status)}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            KSh {loan.amount.toLocaleString()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Applied on {new Date(loan.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(loan.status)}
                        <button
                          onClick={() => setSelectedLoan(selectedLoan === loan._id ? null : loan._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedLoan === loan._id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Loan Details</h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium">Amount:</span> KSh {loan.amount.toLocaleString()}</p>
                              <p><span className="font-medium">Fee:</span> KSh {loan.feeAmount.toLocaleString()}</p>
                              <p><span className="font-medium">Fee Paid:</span> {loan.feePaid ? 'Yes' : 'No'}</p>
                              <p><span className="font-medium">Applied:</span> {new Date(loan.createdAt).toLocaleDateString()}</p>
                              {loan.approvalDate && (
                                <p><span className="font-medium">Approved:</span> {new Date(loan.approvalDate).toLocaleDateString()}</p>
                              )}
                              {loan.disbursedAt && (
                                <p><span className="font-medium">Disbursed:</span> {new Date(loan.disbursedAt).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                            <div className={`p-3 rounded-md ${getStatusColor(loan.status)}`}>
                              <p className="text-sm text-gray-700">{getNextSteps(loan)}</p>
                            </div>
                            {loan.description && (
                              <div className="mt-3">
                                <h5 className="font-medium text-gray-900 mb-1">Purpose</h5>
                                <p className="text-sm text-gray-600">{loan.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No loan applications found</p>
            <p className="text-gray-400 text-sm mt-2">
              Your loan applications will appear here once you apply
            </p>
            <button
              onClick={() => navigate('/apply')}
              className="mt-4 btn-primary"
            >
              Apply for a Loan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanStatusTracker;
