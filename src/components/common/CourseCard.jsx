import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaClock, FaStar, FaLevelUpAlt } from 'react-icons/fa';

const CourseCard = ({ course }) => {
    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';

    const handleImageError = (e) => {
        e.target.src = FALLBACK_IMAGE;
    };

    // Price rendering helper function
    const renderPrice = (price, discountPrice) => {
        if (discountPrice && discountPrice < price) {
            return (
                <div className="flex items-center gap-2">
                    <span className="text-xl md:text-2xl font-bold text-purple-400">${discountPrice}</span>
                    <span className="text-sm md:text-md line-through text-gray-500">${price}</span>
                </div>
            );
        }
        return <span className="text-xl md:text-2xl font-bold text-purple-400">${price || 0}</span>;
    };

    return (
        <Link to={`/course/${course._id || course.id}`} className="block group w-full">
            <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 transition overflow-hidden h-full flex flex-col">

                {/* Image Section */}
                <figure className="relative h-48 overflow-hidden">
                    <img
                        src={course.image || FALLBACK_IMAGE}
                        alt={course.title}
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 md:top-4 md:left-4">
                        <span className="bg-purple-600 text-white px-2 py-1 text-xs md:text-sm font-semibold rounded-full capitalize">
                            {course.level || 'All Levels'}
                        </span>
                    </div>
                </figure>

                {/* Content Section */}
                <div className="p-4 md:p-6 flex flex-col flex-grow">
                    {/* Category and Rating */}
                    <div className="flex justify-between items-center mb-2 md:mb-3">
                        <span className="text-xs md:text-sm font-medium text-purple-400 truncate max-w-[50%]">
                            {course.category || 'General'}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-400">
                            <FaStar className="text-xs md:text-sm" />
                            <span className="text-gray-300 font-semibold text-xs md:text-sm">
                                {course.rating?.toFixed(1) || '0.0'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 flex-grow line-clamp-2">
                        {course.title}
                    </h2>
                    
                    {/* Instructor */}
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <img 
                            src={course.instructor?.photoURL || `https://ui-avatars.com/api/?name=${typeof course.instructor === 'string' ? course.instructor : (course.instructor?.name || 'A')}&background=random`} 
                            alt={typeof course.instructor === 'string' ? course.instructor : course.instructor?.name}
                            className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"
                        />
                        <span className="text-xs md:text-sm text-gray-400 truncate">
                            {typeof course.instructor === 'string' ? course.instructor : (course.instructor?.name || 'Anonymous Instructor')}
                        </span>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex justify-between items-center text-gray-400 text-xs md:text-sm border-t border-b border-gray-700 py-2 md:py-3 my-2 md:my-3">
                        <div className="flex items-center gap-1 md:gap-2">
                            <FaUsers className="text-xs md:text-sm" />
                            <span>{course.enrollmentCount || 0} Students</span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                            <FaClock className="text-xs md:text-sm" />
                            <span>{course.duration || 'Self-paced'}</span>
                        </div>
                    </div>
                    
                    {/* Price and Action */}
                    <div className="flex justify-between items-center mt-auto">
                        {renderPrice(course.price, course.discount_price)}
                        <button className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none btn-sm">
                            See More
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;