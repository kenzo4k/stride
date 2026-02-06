import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthProvider';
import toast from 'react-hot-toast';
import coursesData from '../../../public/courses.json';
import PaymentSummary from './PaymentSummary';
import PaymentForm from './PaymentForm';

const Payment = () => {
  // Hooks
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useContext(AuthContext);

  // State
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Load course data and check authentication
  useEffect(() => {
    const initializePayment = async () => {
      setLoading(true);
      document.title = "Payment | Stride";

      try {
        // Check authentication first
        if (!user) {
          toast.error("Please login to continue with payment.");
          return navigate('/login', { 
            state: { from: location, returnTo: `/course/${courseId}/payment` }, 
            replace: true 
          });
        }

        // Load course from local JSON data
        const foundCourse = coursesData.find(c => c._id === courseId);
        
        if (!foundCourse) {
          throw new Error('Course not found.');
        }

        // Check if already enrolled
        const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        if (enrolledCourses.includes(courseId)) {
          toast.info("You are already enrolled in this course.");
          return navigate(`/course/${courseId}/learn`, { replace: true });
        }

        // Map _id to id for consistency
        const mappedCourse = {
          ...foundCourse,
          id: foundCourse._id
        };

        setCourse(mappedCourse);
        document.title = `Payment - ${mappedCourse.title} | Stride`;
      } catch (err) {
        setError(err.message);
        toast.error("Could not load course data.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      initializePayment();
    }
  }, [courseId, user, navigate, location]);

  // Check enrollment limits
  const checkEnrollmentLimits = () => {
    const userEnrollments = JSON.parse(localStorage.getItem('userEnrollments') || '[]');
    if (userEnrollments.length >= 3) {
      toast.error("You have reached the maximum enrollment limit (3 courses).");
      return false;
    }
    return true;
  };

  // Process payment
  const handlePaymentSubmit = async (paymentData) => {
    if (!checkEnrollmentLimits()) {
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get current enrollments
      const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      const userEnrollments = JSON.parse(localStorage.getItem('userEnrollments') || '[]');

      // Check if already enrolled (double check)
      if (enrolledCourses.includes(courseId)) {
        toast.info("You are already enrolled in this course.");
        navigate(`/course/${courseId}/learn`, { replace: true });
        return;
      }

      // Add course to enrolled courses
      enrolledCourses.push(courseId);
      
      // Create enrollment record
      const newEnrollment = {
        courseId: courseId,
        enrolledAt: new Date().toISOString(),
        userName: paymentData.fullName,
        userEmail: user.email
      };
      userEnrollments.push(newEnrollment);

      // Save to localStorage
      localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
      localStorage.setItem('userEnrollments', JSON.stringify(userEnrollments));

      // Show success message
      toast.success(`Successfully enrolled in ${course.title}!`, {
        duration: 4000,
        icon: '🎉'
      });

      // Navigate to course content page
      navigate(`/course/${courseId}/learn`);

    } catch (err) {
      console.error('Payment processing error:', err);
      toast.error(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-gray-400">Loading payment information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="alert alert-error max-w-md bg-red-900 border border-red-700 text-red-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error: {error}</span>
          <div>
            <button 
              onClick={() => navigate(`/course/${courseId}`)}
              className="btn btn-sm btn-outline border-red-600 text-red-100 hover:bg-red-800"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if course has seats available
  const seatsLeft = course.seats - course.enrollmentCount;
  if (seatsLeft <= 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="alert alert-warning max-w-md bg-yellow-900 border border-yellow-700 text-yellow-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>This course is sold out. No seats available.</span>
          <div>
            <button 
              onClick={() => navigate(`/course/${courseId}`)}
              className="btn btn-sm btn-outline border-yellow-600 text-yellow-100 hover:bg-yellow-800"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user already owns the course
  const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
  if (enrolledCourses.includes(courseId)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="alert alert-info max-w-md bg-blue-900 border border-blue-700 text-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>You are already enrolled in this course.</span>
          <div>
            <button 
              onClick={() => navigate(`/course/${courseId}/learn`)}
              className="btn btn-sm btn-outline border-blue-600 text-blue-100 hover:bg-blue-800"
            >
              Go to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="btn btn-ghost btn-sm text-gray-400 hover:text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Course
              </button>
              <div className="border-l border-gray-600 pl-4">
                <h1 className="text-xl font-semibold text-white">Secure Payment</h1>
                <p className="text-sm text-gray-400">Complete your enrollment</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              SSL Secured
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Payment Summary */}
            <div className="lg:order-1">
              <PaymentSummary course={course} />
            </div>

            {/* Right Column - Payment Form */}
            <div className="lg:order-2">
              <PaymentForm 
                onSubmit={handlePaymentSubmit} 
                loading={processing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Security Footer */}
      <div className="bg-gray-800 border-t border-gray-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              256-bit SSL Encryption
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
              </svg>
              PCI DSS Compliant
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Money Back Guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;