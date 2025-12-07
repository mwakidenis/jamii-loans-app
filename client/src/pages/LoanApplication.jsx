import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Phone, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoan } from '../context/LoanContext';

const LoanApplication = () => {
  const [formData, setFormData] = useState({
    amount: '',
    phoneNumber: '',
    description: '',
  });
  const [eligibility, setEligibility] = useState(null);
  const [feeAmount, setFeeAmount] = useState(0);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { checkEligibility, applyLoan } = useLoan();
  const navigate = useNavigate();

  useEffect(() => {
    const loadEligibility = async () => {
      console.log('Loading eligibility...');
      setIsLoading(true);
      const result = await checkEligibility();
      console.log('Eligibility result:', result);
      if (result.success) {
        setEligibility(result.data);
      } else {
        console.error('Eligibility check failed:', result.message);
      }
      setIsLoading(false);
    };

    loadEligibility();
  }, []); // Remove checkEligibility from dependencies to prevent infinite loop

  useEffect(() => {
    // Calculate fee when amount changes
    const amount = parseFloat(formData.amount) || 0;
    setFeeAmount(Math.round(amount * 0.1));
  }, [formData.amount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount < 1000 || amount > (eligibility?.maxAmount || 500000)) {
      newErrors.amount = `Amount must be between 1000 and ${eligibility?.maxAmount?.toLocaleString() || '500,000'}`;
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^254\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be in format 254xxxxxxxxx';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await applyLoan({
      ...formData,
      amount: parseFloat(formData.amount),
    });

    if (result.success) {
      // Show success message and redirect
      alert('Loan application submitted successfully! Your application will be reviewed by our admin team.');
      navigate('/dashboard');
    } else {
      setErrors({ general: result.message });
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!eligibility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to check eligibility. Please try again.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!eligibility.eligible) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-red-600 mb-4">
              <CreditCard className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Eligible</h2>
            <p className="text-gray-600 mb-6">{eligibility.reason}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Apply for a Loan</h1>
          <p className="mt-2 text-gray-600">Fill in the details below to submit your loan application</p>
        </div>

        {/* Eligibility Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Eligibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Credit Score</p>
              <p className="text-2xl font-bold text-primary-600">{eligibility.creditScore}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Max Amount</p>
              <p className="text-2xl font-bold text-secondary-600">KSh {eligibility.maxAmount.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Loan Limit</p>
              <p className="text-2xl font-bold text-gray-900">KSh {eligibility.loanLimit.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Loan Amount */}
            <div>
              <label htmlFor="amount" className="form-label">
                Loan Amount (KSh)
              </label>
              <div className="relative">
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  required
                  min="1000"
                  max={eligibility.maxAmount}
                  className="form-input pl-8"
                  placeholder="Enter loan amount"
                  value={formData.amount}
                  onChange={handleChange}
                />
                <span className="absolute left-3 top-3 text-gray-400 font-medium">KSh</span>
              </div>
              {formData.amount && (
                <p className="mt-2 text-sm text-gray-600">
                  Processing Fee: KSh {feeAmount.toLocaleString()} (10%)
                </p>
              )}
              {errors.amount && (
                <p className="mt-1 text-sm text-danger-600">{errors.amount}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="form-label">
                M-PESA Phone Number
              </label>
              <div className="relative">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  required
                  className="form-input pl-8"
                  placeholder="254xxxxxxxxx"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Enter your Safaricom number for M-PESA payment
              </p>
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-danger-600">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="form-label">
                Purpose of Loan (Optional)
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="form-input pl-8"
                  placeholder="Describe how you plan to use the loan"
                  value={formData.description}
                  onChange={handleChange}
                />
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {formData.description.length}/500 characters
              </p>
              {errors.description && (
                <p className="mt-1 text-sm text-danger-600">{errors.description}</p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-danger-50 border border-danger-200 rounded-md p-4">
                <p className="text-sm text-danger-600">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="spinner mr-2"></div>
              ) : (
                <CheckCircle className="h-5 w-5 mr-2" />
              )}
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>

          {/* Important Notes */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Important:</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• A 10% processing fee will be charged via M-PESA after approval</li>
              <li>• Your application will be reviewed by our admin team</li>
              <li>• Applications are reviewed within 24-48 hours</li>
              <li>• You will receive notifications about your application status</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;
