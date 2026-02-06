import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

// Hardcoded credentials for each role
const HARDCODED_CREDENTIALS = [
  {
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  },
  {
    email: "student@example.com",
    password: "student123",
    role: "student",
  },
  {
    email: "instructor@example.com",
    password: "instructor123",
    role: "instructor",
  },
];

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = (data) => {
    const { email, password } = data;

    // Find matching credentials
    const user = HARDCODED_CREDENTIALS.find(
      (cred) => cred.email === email && cred.password === password
    );

    if (user) {
      // Store user data in localStorage
      const userData = {
        email: user.email,
        role: user.role,
        isAuthenticated: true,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      toast.success(`Welcome back, ${user.role}!`);

      // Update auth state
      window.dispatchEvent(new Event("storage"));

      // Redirect based on role
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "instructor":
          navigate("/instructor");
          break;
        case "student":
        default:
          navigate("/student");
      }
    } else {
      setError("Invalid email or password");
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-cyan-400/10 blur-3xl"></div>

        <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-2xl"></div>
          <div className="absolute inset-[1px] bg-gray-800/90 rounded-2xl"></div>

          <form
            onSubmit={handleSubmit(handleLogin)}
            className="relative p-8 space-y-6"
          >
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-gray-400">Sign in to your account</p>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register("email", { required: true })}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  {...register("password", { required: true })}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none w-full shadow-lg transition-all duration-200"
            >
              Sign In
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-400">OR</span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              className="btn bg-gray-700 hover:bg-gray-600 text-white border-none w-full shadow-lg transition-all duration-200 flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
