// src/pages/Courses/AddCourse.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import axiosSecure from '../../services/axiosSecure';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


//add courses section
const AddCourse = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        if (!user) {
            Swal.fire({
                icon: 'error',
                title: 'Login Required',
                text: 'You must be logged in to add a course.',
                timer: 3000,
                showConfirmButton: false,
                background: '#1f2937',
                color: '#fff'
            });
            return;
        }

        setIsLoading(true);

        // Show loading notification
        Swal.fire({
            title: 'Adding Course',
            html: 'Please wait while we add your course...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            background: '#1f2937',
            color: '#fff'
        });

        // Prepare course data
        const courseData = {
            title: data.title,
            short_description: data.short_description,
            detailed_description: data.detailed_description,
            image: data.image_url,
            duration: data.duration,
            seats: parseInt(data.seats, 10),
            price: parseFloat(data.price),
            discount_price: data.discount_price ? parseFloat(data.discount_price) : null,
            category: data.category,
            level: data.level,
            language: data.language,
            prerequisites: data.prerequisites ? data.prerequisites.split(',').map(item => item.trim()) : [],
            learning_outcomes: data.learning_outcomes ? data.learning_outcomes.split(',').map(item => item.trim()) : [],
            curriculum: data.curriculum ? data.curriculum.split('\n').filter(item => item.trim()) : [],
            instructor: {
                name: data.instructor_name || user?.displayName,
                email: user?.email,
                bio: data.instructor_bio,
                qualification: data.instructor_qualification,
            },
            tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
            featured: data.featured || false,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            enrollmentCount: 0,
            enrolledStudents: [],
            rating: 0,
            reviews: [],
            completion_certificate: data.completion_certificate || false,
        };


        //data fetch section
        try {
            const response = await axiosSecure.post('/courses', courseData);

            if (response.data.insertedId) {
                // Success notification
                await Swal.fire({
                    icon: 'success',
                    title: 'Course Added!',
                    text: 'Your course has been successfully added to the platform.',
                    showConfirmButton: false,
                    timer: 2000,
                    background: '#1f2937',
                    color: '#fff',
                    iconColor: '#10b981'
                });

                reset();
                // Redirect to manage courses page
                navigate('/manage-courses');
            } else {
                throw new Error('Failed to add course');
            }
        } catch (error) {
            console.error('Failed to add course:', error);
            // Error notification
            Swal.fire({
                icon: 'error',
                title: 'Failed to Add Course',
                text: error.response?.data?.message || 'Something went wrong. Please try again.',
                confirmButtonColor: '#6366f1',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl shadow-purple-500/20">
                <h2 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Create a New Course</h2>
                <p className="text-center text-gray-400 mb-8">Fill in the details below to launch your new course.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* Section: Basic Information */}
                    <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 gap-6">
                            {/* Course Title */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Course Title</span></label>
                                <input type="text" placeholder="e.g., Ultimate Web Development Bootcamp" className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500" {...register("title", { required: "Title is required" })} />
                                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
                            </div>
                            {/* Short Description */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Short Description</span></label>
                                <textarea className="textarea textarea-bordered h-24 w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500" placeholder="A brief, catchy overview of the course." {...register("short_description", { required: "Short description is required" })}></textarea>
                                {errors.short_description && <p className="text-red-400 text-sm mt-1">{errors.short_description.message}</p>}
                            </div>
                            {/* Detailed Description */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Detailed Description</span></label>
                                <textarea className="textarea textarea-bordered h-32 w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500" placeholder="Provide a comprehensive description of the course content, goals, and target audience." {...register("detailed_description", { required: "Detailed description is required" })}></textarea>
                                {errors.detailed_description && <p className="text-red-400 text-sm mt-1">{errors.detailed_description.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section: Course Details */}
                    <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Course Specifics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Category */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Category</span></label>
                                <input type="text" placeholder="e.g., Development, Design" className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500" {...register("category", { required: "Category is required" })} />
                                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>}
                            </div>
                            {/* Level */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Level</span></label>
                                <select className="select select-bordered w-full bg-gray-700 border-gray-600 text-white focus:outline-none focus:border-cyan-500" defaultValue="" {...register("level", { required: "Level is required" })}>
                                    <option disabled value="">Select Level</option>
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                    <option>All Levels</option>
                                </select>
                                {errors.level && <p className="text-red-400 text-sm mt-1">{errors.level.message}</p>}
                            </div>
                            {/* Language */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Language</span></label>
                                <input type="text" placeholder="e.g., English" className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500" {...register("language", { required: "Language is required" })} />
                                {errors.language && <p className="text-red-400 text-sm mt-1">{errors.language.message}</p>}
                            </div>
                            {/* Duration */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Duration</span></label>
                                <input type="text" placeholder="e.g., 12 Weeks" className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500" {...register("duration", { required: "Duration is required" })} />
                                {errors.duration && <p className="text-red-400 text-sm mt-1">{errors.duration.message}</p>}
                            </div>
                            {/* Price */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Price ($)</span></label>
                                <input type="number" step="0.01" placeholder="e.g., 99.99" className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500" {...register("price", { required: "Price is required", valueAsNumber: true, min: { value: 0, message: "Price cannot be negative" } })} />
                                {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>}
                            </div>
                            {/* Discount Price */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Discount Price ($) (Optional)</span></label>
                                <input type="number" step="0.01" placeholder="e.g., 49.99" className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500" {...register("discount_price", { valueAsNumber: true, min: { value: 0, message: "Price cannot be negative" } })} />
                                {errors.discount_price && <p className="text-red-400 text-sm mt-1">{errors.discount_price.message}</p>}
                            </div>
                            {/* Total Seats */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Total Seats</span></label>
                                <input type="number" placeholder="e.g., 50" className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500" {...register("seats", { required: "Total seats are required", valueAsNumber: true, min: { value: 1, message: "Seats must be at least 1" } })} />
                                {errors.seats && <p className="text-red-400 text-sm mt-1">{errors.seats.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section: Content Details */}
                    <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Content Details</h3>
                        <div className="grid grid-cols-1 gap-6">
                            {/* Prerequisites */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Prerequisites (Comma-separated)</span></label>
                                <input type="text" placeholder="e.g., HTML, CSS, Basic JavaScript" className="input input-bordered w-full bg-gray-700 border-gray-600" {...register("prerequisites")} />
                            </div>
                            {/* Learning Outcomes */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Learning Outcomes (Comma-separated)</span></label>
                                <input type="text" placeholder="e.g., Build full-stack apps, Deploy to cloud" className="input input-bordered w-full bg-gray-700 border-gray-600" {...register("learning_outcomes")} />
                            </div>
                            {/* Curriculum */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Curriculum (One item per line)</span></label>
                                <textarea className="textarea textarea-bordered h-40 w-full bg-gray-700 border-gray-600" placeholder={"Example:\nModule 1: Introduction to React\nModule 2: State and Props\nModule 3: Advanced Hooks"} {...register("curriculum")}></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Section: Instructor Information */}
                    <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Instructor Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Instructor Name */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Instructor Name</span></label>
                                <input type="text" defaultValue={user?.displayName || ''} className="input input-bordered w-full bg-gray-700 border-gray-600" {...register("instructor_name", { required: "Instructor name is required" })} />
                                {errors.instructor_name && <p className="text-red-400 text-sm mt-1">{errors.instructor_name.message}</p>}
                            </div>
                            {/* Instructor Qualification */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Qualification</span></label>
                                <input type="text" placeholder="e.g., Lead Engineer at Google" className="input input-bordered w-full bg-gray-700 border-gray-600" {...register("instructor_qualification", { required: "Qualification is required" })} />
                                {errors.instructor_qualification && <p className="text-red-400 text-sm mt-1">{errors.instructor_qualification.message}</p>}
                            </div>
                        </div>
                        {/* Instructor Bio */}
                        <div className='mt-6'>
                            <label className="label"><span className="label-text font-semibold text-gray-300">Instructor Bio</span></label>
                            <textarea className="textarea textarea-bordered h-24 w-full bg-gray-700 border-gray-600" placeholder="A short bio about the instructor..." {...register("instructor_bio", { required: "Instructor bio is required" })}></textarea>
                            {errors.instructor_bio && <p className="text-red-400 text-sm mt-1">{errors.instructor_bio.message}</p>}
                        </div>
                    </div>


                    {/* Section: Metadata   */}
                    <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Metadata & Media</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Image URL */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Course Image URL</span></label>
                                <input type="url" placeholder="https://example.com/image.jpg" className="input input-bordered w-full bg-gray-700 border-gray-600" {...register("image_url", { required: "Image URL is required" })} />
                                {errors.image_url && <p className="text-red-400 text-sm mt-1">{errors.image_url.message}</p>}
                            </div>
                            {/* Tags */}
                            <div>
                                <label className="label"><span className="label-text font-semibold text-gray-300">Tags (Comma-separated)</span></label>
                                <input type="text" placeholder="e.g., react, nodejs, webdev" className="input input-bordered w-full bg-gray-700 border-gray-600" {...register("tags")} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {/* Featured Course */}
                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-4">
                                    <input type="checkbox" className="checkbox checkbox-primary" {...register("featured")} />
                                    <span className="label-text text-gray-300">Mark as Featured Course</span>
                                </label>
                            </div>
                            {/* Completion Certificate */}
                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-4">
                                    <input type="checkbox" className="checkbox checkbox-primary" {...register("completion_certificate")} />
                                    <span className="label-text text-gray-300">Offers Completion Certificate</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-10 text-center">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full md:w-1/2 disabled:bg-gray-500 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <FaSpinner className="animate-spin mr-2" />
                                    Processing...
                                </span>
                            ) : (
                                'Add Course to Platform now'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCourse;
