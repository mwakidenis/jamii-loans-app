import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoan } from '../context/LoanContext';

const LoanDisbursement = () => {
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const { user } = useAuth();
  const { getAllLoans, initiateLoanDisbursement } = useLoan();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApprovedLoans();
  }, []);

  const fetchApprovedLoans = async () => {
    const result = await getAllLoans({ status: 'approved' });
    if (result.success) {
      // Filter loans that are approved but not yet disbursed
      const disbursableLoans = result.data.filter(loan =>
        loan.status === 'approved' &&
        loan.disbursementStatus !== 'completed' &&
        loan.disbursementStatus !== 'processing'
      );
      setApprovedLoans(disbursableLoans);
    }
    setLoading(false);
  };

  const handleDisburse = async (loanId) => {
    setActionLoading(loanId);
    const result = await initiateLoanDisbursement(loanId);
    if (result.success) {
      alert('Loan disbursement initiated successfully!');
      fetchApprovedLoans(); // Refresh the list
    } else {
      alert(result.message);
    }
    setActionLoading(null);
  };

  const getDisbursementStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      processing: 'status-processing',
      completed: 'status-approved',
      failed: 'status-rejected',
    };

    const icons = {
      pending: <Clock className="h-4 w-4" />,
      processing: <AlertTriangle className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
      failed: <XCircle className="h-4 w-4" />,
    };

    return (
      <span className={`status-badge ${statusClasses[status] || 'status-pending'} flex items-center space-x-1`}>
        {icons[status]}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Loan Disbursement</h1>
            </div>
            <div className="text-sm text-gray-600">
              {user?.fullName} (Admin)
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            Manage loan disbursements for approved applications. Funds will be sent directly to borrowers' M-PESA accounts.
          </p>
        </div>

        {/* Loans Ready for Disbursement */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Loans Ready for Disbursement</h2>
            <p className="text-sm text-gray-600 mt-1">
              {approvedLoans.length} loan{approvedLoans.length !== 1 ? 's' : ''} pending disbursement
            </p>
          </div>

          {approvedLoans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Borrower
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approval Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disbursement Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvedLoans.map((loan) => (
                    <tr key={loan._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {loan.userId?.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {loan.userId?.nationalId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        KSh {loan.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.approvalDate ? new Date(loan.approvalDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getDisbursementStatusBadge(loan.disbursementStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {loan.disbursementStatus === 'pending' && (
                          <button
                            onClick={() => handleDisburse(loan._id)}
                            disabled={actionLoading === loan._id}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            <DollarSign className="h-4 w-4" />
                            <span>{actionLoading === loan._id ? 'Processing...' : 'Disburse'}</span>
                          </button>
                        )}
                        {loan.disbursementStatus === 'processing' && (
                          <span className="text-sm text-gray-500">Processing...</span>
                        )}
                        {loan.disbursementStatus === 'completed' && (
                          <span className="text-sm text-green-600">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No loans ready for disbursement</p>
              <p className="text-gray-400 text-sm mt-2">
                Approved loans will appear here once they're ready to be disbursed
              </p>
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Disbursement Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-blue-900">Approval</h4>
              <p className="text-sm text-blue-700 mt-1">
                Loan applications are reviewed and approved by administrators
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-blue-900">Disbursement</h4>
              <p className="text-sm text-blue-700 mt-1">
                Funds are transferred directly to the borrower's M-PESA account
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-blue-900">Confirmation</h4>
              <p className="text-sm text-blue-700 mt-1">
                Borrowers receive instant confirmation via SMS and email
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDisbursement;
