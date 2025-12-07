import { useState } from 'react';
import { DollarSign, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const DisbursementForm = ({ loan, onSubmit, onCancel, loading }) => {
  const [confirmAmount, setConfirmAmount] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!confirmAmount) {
      newErrors.confirmAmount = 'Please confirm the disbursement amount';
    } else if (parseFloat(confirmAmount) !== loan.amount) {
      newErrors.confirmAmount = 'Amount does not match the loan amount';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(loan._id);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-3">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
            Confirm Loan Disbursement
          </h3>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Borrower:</span>
                <span className="text-sm font-medium text-gray-900">{loan.userId?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Loan Amount:</span>
                <span className="text-sm font-medium text-gray-900">KSh {loan.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">National ID:</span>
                <span className="text-sm font-medium text-gray-900">{loan.userId?.nationalId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Application Date:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(loan.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Funds will be sent directly to the borrower's M-PESA account</li>
                  <li>This action cannot be undone</li>
                  <li>Ensure all loan details are correct before proceeding</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="confirmAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Disbursement Amount (KSh)
              </label>
              <input
                type="number"
                id="confirmAmount"
                value={confirmAmount}
                onChange={(e) => {
                  setConfirmAmount(e.target.value);
                  if (errors.confirmAmount) {
                    setErrors({ ...errors, confirmAmount: '' });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the loan amount to confirm"
                required
              />
              {errors.confirmAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmAmount}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !confirmAmount}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="spinner mr-2"></div>
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Processing...' : 'Confirm Disbursement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DisbursementForm;
