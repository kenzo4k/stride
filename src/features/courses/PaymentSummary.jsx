import React from 'react';

const PaymentSummary = ({ course }) => {
  if (!course) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Calculate discount percentage
  const originalPrice = course.price;
  const discountPrice = course.discount_price || originalPrice;
  const discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  
  // Calculate seats available
  const seatsLeft = course.seats - course.enrollmentCount;

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 sticky top-6">
      {/* Course Image */}
      {course.image && (
        <div className="mb-6">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-48 object-cover rounded-lg shadow-md border border-gray-600"
          />
        </div>
      )}

      {/* Course Title and Basic Info */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{course.title}</h2>
        
        {/* Instructor */}
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-300">
            {course.instructor?.name || course.author?.name || 'Unknown Instructor'}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="rating rating-sm">
            {[1, 2, 3, 4, 5].map((star) => (
              <input
                key={star}
                type="radio"
                name="rating"
                className="mask mask-star-2 bg-orange-400"
                checked={star <= (course.rating || 0)}
                readOnly
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">
            {course.rating || 0}/5 ({course.reviews?.length || 0} reviews)
          </span>
        </div>

        {/* Category and Level Badges */}
        <div className="flex gap-2 mb-4">
          <span className="badge badge-primary bg-indigo-500 text-white">{course.category}</span>
          <span className="badge badge-secondary bg-purple-500 text-white">{course.level}</span>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>
        
        <div className="space-y-3">
          {/* Original Price */}
          {discountPrice < originalPrice && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Original Price:</span>
              <span className="text-gray-300 line-through">${originalPrice.toFixed(2)}</span>
            </div>
          )}

          {/* Discount */}
          {discountPercentage > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Discount ({discountPercentage}% OFF):</span>
              <span className="text-green-400">-${(originalPrice - discountPrice).toFixed(2)}</span>
            </div>
          )}

          {/* Final Price */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-700">
            <span className="text-lg font-semibold text-white">Total:</span>
            <span className="text-2xl font-bold text-cyan-400">${discountPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Course Info */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-400">Duration:</span>
          <span className="font-medium text-white">{course.duration}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Language:</span>
          <span className="font-medium text-white">{course.language}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Available Seats:</span>
          <span className={`font-medium ${seatsLeft <= 5 ? 'text-red-400' : 'text-green-400'}`}>
            {seatsLeft > 0 ? seatsLeft : 'Sold Out'}
          </span>
        </div>

        {course.completion_certificate && (
          <div className="flex justify-between">
            <span className="text-gray-400">Certificate:</span>
            <span className="font-medium text-green-400">✓ Included</span>
          </div>
        )}
      </div>

      {/* Enrollment Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Enrollment Progress</span>
          <span className="text-white">
            {course.enrollmentCount} / {course.seats} enrolled
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((course.enrollmentCount / course.seats) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-green-400 font-medium">Secure Payment</span>
        </div>
        <p className="text-xs text-gray-400">
          Your payment information is encrypted and secure. This is a demo environment.
        </p>
      </div>
    </div>
  );
};

export default PaymentSummary;