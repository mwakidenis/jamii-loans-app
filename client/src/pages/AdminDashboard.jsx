import { useState, useEffect } from 'react';
import { LogOut, Users, CheckCircle, XCircle, Eye, Filter, Zap, DollarSign, TrendingUp, Bell, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoan } from '../context/LoanContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const {
    getAllLoans,
    approveLoanAdmin,
    rejectLoanAdmin,
    autoApproveLoanAdmin,
    getLoanQueue,
    initiateLoanDisbursement,
    getAdminStats,
    sendApprovalNotification,
    loading
  } = useLoan();
  const [loans, setLoans] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [loanQueue, setLoanQueue] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchLoans();
    fetchAdminStats();
    fetchLoanQueue();

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      if (activeTab === 'queue') {
        fetchLoanQueue();
      }
      fetchAdminStats();
      setLastUpdate(new Date());
    }, 10000); // 10-second polling to reduce blinking

    return () => clearInterval(interval);
  }, [statusFilter, activeTab]);

  const fetchLoans = async (page = 1) => {
    const params = { page };
    if (statusFilter) {
      params.status = statusFilter;
    }

    const result = await getAllLoans(params);
    if (result.success) {
      setLoans(result.data);
      setPagination(result.pagination);
    }
  };

  const fetchAdminStats = async () => {
    const result = await getAdminStats();
    if (result.success) {
      setAdminStats(result.data);
    }
  };

  const fetchLoanQueue = async () => {
    const result = await getLoanQueue();
    if (result.success) {
      setLoanQueue(result.data);
    }
  };

  const handleApprove = async (loanId) => {
    setActionLoading(loanId);
    const result = await approveLoanAdmin(loanId);
    if (result.success) {
      fetchLoans(pagination?.page || 1);
      fetchLoanQueue(); // Refresh queue after approval
      alert('Loan approved successfully!');
    } else {
      alert(result.message);
    }
    setActionLoading(null);
  };

  const handleReject = async (loanId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(loanId);
    const result = await rejectLoanAdmin(loanId, rejectionReason);
    if (result.success) {
      fetchLoans(pagination?.page || 1);
      fetchLoanQueue(); // Refresh queue after rejection
      setExpandedLoan(null);
      setRejectionReason('');
      alert('Loan rejected successfully!');
    } else {
      alert(result.message);
    }
    setActionLoading(null);
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

  const getFeeStatusBadge = (feePaid) => {
    return feePaid ? (
      <span className="status-badge status-approved">Paid</span>
    ) : (
      <span className="status-badge status-pending">Pending</span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Jamii Loans Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.fullName} (Admin)</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'queue' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Loan Queue
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'stats' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Statistics
            </button>
          </div>
        </div>

        {/* Last Update Indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <RefreshCw className="h-4 w-4" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <button
            onClick={() => {
              fetchLoans();
              fetchAdminStats();
              fetchLoanQueue();
              setLastUpdate(new Date());
            }}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Status Filter Tabs */}
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setStatusFilter('')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    statusFilter === '' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    statusFilter === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter('approved')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    statusFilter === 'approved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setStatusFilter('rejected')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    statusFilter === 'rejected' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>

            {/* Loans Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : loans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <tr key={loan._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {loan.userId?.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {loan.userId?.nationalId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.userId?.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        KSh {loan.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getFeeStatusBadge(loan.feePaid)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(loan.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {loan.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setExpandedLoan(expandedLoan === loan._id ? null : loan._id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleApprove(loan._id)}
                              disabled={!loan.feePaid || actionLoading === loan._id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setExpandedLoan(expandedLoan === loan._id ? null : loan._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No loans found</p>
            </div>
          )}
        </div>

        {/* Expanded Loan Details */}
        {expandedLoan && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            {(() => {
              const loan = loans.find(l => l._id === expandedLoan);
              return loan ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Applicant Information</h4>
                      <p className="text-sm text-gray-600">Name: {loan.userId?.fullName}</p>
                      <p className="text-sm text-gray-600">Email: {loan.userId?.email}</p>
                      <p className="text-sm text-gray-600">National ID: {loan.userId?.nationalId}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Loan Information</h4>
                      <p className="text-sm text-gray-600">Amount: KSh {loan.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Fee: KSh {loan.feeAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Fee Paid: {loan.feePaid ? 'Yes' : 'No'}</p>
                      <p className="text-sm text-gray-600">Date: {new Date(loan.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {loan.description && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Purpose</h4>
                      <p className="text-sm text-gray-600">{loan.description}</p>
                    </div>
                  )}
                  {loan.status === 'pending' && (
                    <div className="mt-6 border-t pt-6">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleApprove(loan._id)}
                          disabled={!loan.feePaid || actionLoading === loan._id}
                          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === loan._id ? 'Approving...' : 'Approve Loan'}
                        </button>
                        <div className="flex-1">
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="form-input w-full"
                            rows="3"
                          />
                          <button
                            onClick={() => handleReject(loan._id)}
                            disabled={actionLoading === loan._id}
                            className="btn-danger mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === loan._id ? 'Rejecting...' : 'Reject Loan'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => fetchLoans(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => fetchLoans(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
          </>
        )}

        {/* Loan Queue Tab */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Loan Processing Queue</h2>
              {loanQueue.length > 0 ? (
                <div className="space-y-4">
                  {loanQueue.map((loan) => (
                    <div key={loan._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-medium text-gray-900">{loan.userId?.fullName}</h3>
                              <p className="text-sm text-gray-600">{loan.userId?.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">KSh {loan.amount.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">Fee: KSh {loan.feeAmount.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4">
                            {getStatusBadge(loan.status)}
                            {getFeeStatusBadge(loan.feePaid)}
                            <span className="text-sm text-gray-600">
                              {new Date(loan.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {loan.status === 'pending' && loan.feePaid && (
                            <>
                              <button
                                onClick={() => handleApprove(loan._id)}
                                disabled={actionLoading === loan._id}
                                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === loan._id ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => setExpandedLoan(expandedLoan === loan._id ? null : loan._id)}
                                className="btn-danger"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setExpandedLoan(expandedLoan === loan._id ? null : loan._id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No loans in queue</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminStats ? (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Loans</p>
                      <p className="text-2xl font-bold text-gray-900">{adminStats.totalLoans}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-gray-900">{adminStats.approvedLoans}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-gray-900">{adminStats.rejectedLoans}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">KSh {adminStats.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="spinner"></div>
                <p className="text-gray-500 mt-4">Loading statistics...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
