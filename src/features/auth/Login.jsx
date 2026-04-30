import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { signIn } = useAuth();

  const handleLogin = async (data) => {
    const { email, password } = data;

    try {
      const response = await signIn(email, password);
      const user = response.data.user;

      toast.success(`Welcome back, ${user.role}!`);

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
    } catch (err) {
      const message = err.response?.data?.message || "Invalid email or password";
      setError(message);
      toast.error(message);
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

            <div className="text-center text-gray-400 text-sm mt-4">
              Don't have an account? <Link to="/Auth/register" className="text-indigo-400 hover:underline">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
