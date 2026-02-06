import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';

const PaymentForm = ({ onSubmit, loading }) => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    termsAccepted: false
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;

    // Format card number with dashes
    if (name === 'cardNumber') {
      // Remove all non-digits
      const digits = value.replace(/\D/g, '');
      // Format as XXXX-XXXX-XXXX-XXXX
      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1-');
      processedValue = formatted.substring(0, 19); // Limit to 19 characters (16 digits + 3 dashes)
    }
    
    // Format expiry date MM/YY
    if (name === 'expiryDate') {
      const digits = value.replace(/\D/g, '');
      if (digits.length >= 2) {
        processedValue = digits.substring(0, 2) + '/' + digits.substring(2, 4);
      } else {
        processedValue = digits;
      }
    }

    // CVV - only digits, max 4
    if (name === 'cvv') {
      processedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Card Number validation
    const cardDigits = formData.cardNumber.replace(/\D/g, '');
    if (!cardDigits) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardDigits.length < 13 || cardDigits.length > 19) {
      newErrors.cardNumber = 'Card number must be 13-19 digits';
    }

    // Expiry Date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    } else {
      // Check if date is in the future
      const [month, year] = formData.expiryDate.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      if (expiry < now) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    // Terms validation
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Payment Details</h2>
        <p className="text-gray-400">Complete your enrollment with secure payment processing.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-700 border ${
              errors.fullName ? 'border-red-500' : 'border-gray-600'
            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Enter your full name"
            required
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly={!!user?.email}
            className={`w-full px-4 py-3 bg-gray-700 border ${
              errors.email ? 'border-red-500' : 'border-gray-600'
            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              user?.email ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            placeholder="Enter your email address"
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Card Number */}
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-300 mb-2">
            Card Number *
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-700 border ${
              errors.cardNumber ? 'border-red-500' : 'border-gray-600'
            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="1234-5678-9012-3456"
            required
          />
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-400">{errors.cardNumber}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">Demo: Use any 13-19 digit number</p>
        </div>

        {/* Expiry Date and CVV Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Expiry Date */}
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300 mb-2">
              Expiry Date *
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700 border ${
                errors.expiryDate ? 'border-red-500' : 'border-gray-600'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="MM/YY"
              maxLength="5"
              required
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-400">{errors.expiryDate}</p>
            )}
          </div>

          {/* CVV */}
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-300 mb-2">
              CVV *
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700 border ${
                errors.cvv ? 'border-red-500' : 'border-gray-600'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="123"
              maxLength="4"
              required
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-400">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="termsAccepted" className="text-sm text-gray-300">
              I agree to the{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                Privacy Policy
              </a>
              *
            </label>
          </div>
          {errors.termsAccepted && (
            <p className="mt-1 text-sm text-red-400">{errors.termsAccepted}</p>
          )}
        </div>

        {/* Payment Security Notice */}
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-blue-400 font-medium">Demo Environment</span>
          </div>
          <p className="text-xs text-gray-400">
            This is a demonstration payment form. No real payment will be processed.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Processing Payment...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Complete Enrollment
            </>
          )}
        </button>
      </form>

      {/* Demo Instructions */}
      <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
        <h4 className="text-blue-400 font-medium mb-2">Demo Payment Instructions</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Use any 13-19 digit card number (e.g., 4242-4242-4242-4242)</li>
          <li>• Use any future date for expiry (e.g., 12/25)</li>
          <li>• Use any 3-4 digit CVV (e.g., 123)</li>
          <li>• Check the terms checkbox to enable payment</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentForm;