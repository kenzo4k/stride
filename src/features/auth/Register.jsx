import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, UserPlus, ArrowRight, ChevronDown, Users } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        defaultValues: {
            role: new URLSearchParams(location.search).get('invite') || 'student'
        }
    });
    const { createUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const password = watch("password", "");
    const selectedRole = watch("role", "student");

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // Determine role from invite parameter or form value
            const inviteParam = new URLSearchParams(location.search).get('invite');
            const role = ['instructor', 'admin'].includes(inviteParam) ? inviteParam : (data.role || 'student');

            // Create user with all fields
            await createUser({
                name: data.name,
                email: data.email,
                password: data.password,
                role: role,
                photoURL: data.photoURL
            });

            toast.success("Registration successful!");

            // Redirect based on role
            if (role === 'instructor') {
                navigate('/instructor');
            } else if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/student');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-600/10 to-emerald-600/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Main card */}
                <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4 border border-white/20">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Create an Account</h1>
                        <p className="text-indigo-100 text-sm">Join our community and start your journey</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                        {/* Name field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-400" />
                                Full Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register("name", { required: "Name is required" })}
                                    placeholder="Enter your full name"
                                    className={`w-full px-4 py-3 bg-gray-700/80 text-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-500 bg-red-900/20' : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                />
                                {errors.name && (
                                    <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Email field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-400" />
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    placeholder="Enter your email"
                                    className={`w-full px-4 py-3 bg-gray-700/80 text-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-500 bg-red-900/20' : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                />
                                {errors.email && (
                                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-blue-400" />
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 8,
                                            message: "Password must be at least 8 characters long"
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                            message: "Password must include uppercase, lowercase, number, and special character"
                                        }
                                    })}
                                    placeholder="Create a strong password"
                                    className={`w-full px-4 py-3 pr-12 bg-gray-700/80 text-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-500 bg-red-900/20' : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-blue-400" />
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    {...register("confirmPassword", {
                                        required: "Please confirm your password",
                                        validate: value =>
                                            value === password || "The passwords do not match"
                                    })}
                                    placeholder="Confirm your password"
                                    className={`w-full px-4 py-3 pr-12 bg-gray-700/80 text-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.confirmPassword ? 'border-red-500 bg-red-900/20' : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>


                        {/* Role selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-400" />
                                Register As
                            </label>
                            <input type="hidden" {...register("role")} />
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setValue("role", "student")}
                                    className={`relative overflow-hidden p-4 rounded-xl border text-left transition-all duration-300 group flex flex-col justify-between h-24 ${
                                        selectedRole === 'student'
                                            ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                            : 'bg-gray-700/40 border-gray-600/80 text-gray-300 hover:border-gray-500 hover:bg-gray-700/60'
                                    }`}
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <span className={`text-xs uppercase font-bold tracking-wider ${selectedRole === 'student' ? 'text-blue-400' : 'text-gray-400'}`}>
                                            Learn
                                        </span>
                                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${selectedRole === 'student' ? 'bg-blue-400 scale-110 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-transparent border border-gray-500'}`}></div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Student</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Enroll and take courses</p>
                                    </div>
                                    {/* Active background glow */}
                                    {selectedRole === 'student' && (
                                        <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setValue("role", "instructor")}
                                    className={`relative overflow-hidden p-4 rounded-xl border text-left transition-all duration-300 group flex flex-col justify-between h-24 ${
                                        selectedRole === 'instructor'
                                            ? 'bg-gradient-to-br from-purple-600/20 to-indigo-600/10 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                            : 'bg-gray-700/40 border-gray-600/80 text-gray-300 hover:border-gray-500 hover:bg-gray-700/60'
                                    }`}
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <span className={`text-xs uppercase font-bold tracking-wider ${selectedRole === 'instructor' ? 'text-purple-400' : 'text-gray-400'}`}>
                                            Teach
                                        </span>
                                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${selectedRole === 'instructor' ? 'bg-purple-400 scale-110 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-transparent border border-gray-500'}`}></div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Instructor</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Create and manage courses</p>
                                    </div>
                                    {/* Active background glow */}
                                    {selectedRole === 'instructor' && (
                                        <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>
                                    )}
                                </button>
                            </div>
                        </div>


                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none w-full shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        {/* Login link */}
                        <div className="text-center pt-4 border-t border-gray-700">
                            <p className="text-gray-400 text-sm">
                                Already have an account?{' '}
                                <Link
                                    to="/Auth/login"
                                    className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors"
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Bottom decorative text */}
                <div className="text-center mt-6">
                    <p className="text-gray-500 text-xs">
                        By creating an account, you agree to our Terms & Conditions
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;