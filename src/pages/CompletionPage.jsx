import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { courseService } from "../services/courseService";
import toast from "react-hot-toast";

const CompletionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const enrollStudent = async () => {
      const queryParams = new URLSearchParams(location.search);
      const courseId = queryParams.get("courseId");

      if (!courseId) {
        setError("Invalid course ID.");
        setLoading(false);
        return;
      }

      try {
        // Fetch course details for display
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData);

        // Check if already enrolled to avoid duplicates/errors
        const enrollments = await courseService.getEnrolledCourses();
        const isEnrolled = enrollments.some(e => {
          const cid = typeof e.courseId === 'object' && e.courseId !== null ? e.courseId._id : e.courseId;
          return cid === courseId;
        });

        if (!isEnrolled) {
          // Call enrollment API
          await courseService.enrollInCourse(courseId);
        }
        
        toast.success("Enrollment complete! Happy learning.");
      } catch (err) {
        console.error("Enrollment error in CompletionPage:", err);
        setError(err.response?.data?.message || err.message || "Failed to complete enrollment.");
      } finally {
        setLoading(false);
      }
    };

    enrollStudent();
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-100">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-gray-400">Completing your enrollment. Please do not close this page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 text-gray-100">
        <div className="alert alert-error max-w-md bg-red-900 border border-red-700 text-red-100 flex flex-col items-start gap-4">
          <div className="flex gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Error: {error}</span>
          </div>
          <Link to="/courses" className="btn btn-sm bg-red-800 border-none text-white hover:bg-red-700">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Congratulations!</h1>
          <p className="text-gray-400">You are successfully enrolled in</p>
          <p className="text-xl font-bold text-indigo-400">{course?.title || "your course"}</p>
        </div>

        <div className="p-4 bg-gray-750 rounded-xl border border-gray-700/50 text-sm text-gray-300">
          Your payment has been successfully processed, and your workspace is set up.
        </div>

        <button
          onClick={() => navigate(`/course/${course?._id || course?.id}/learn`)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-indigo-550/20"
        >
          Start Learning Now
        </button>
      </div>
    </div>
  );
};

export default CompletionPage;
