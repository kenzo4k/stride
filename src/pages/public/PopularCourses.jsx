// src/pages/Home/PopularCourses.jsx

import React, { useEffect, useState } from 'react';
import CourseCard from '../../components/common/CourseCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PopularCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            // Import the local JSON file
            import('../../../public/courses.json')
                .then(data => {
                    // Filter out courses that were "deleted" in this session
                    const deletedCourseIds = JSON.parse(localStorage.getItem('deletedCourses') || '[]');
                    const filteredData = data.default.filter(course => !deletedCourseIds.includes(course._id));
                    
                    // Sort by rating and enrollment count to get popular courses
                    const sortedData = filteredData.sort((a, b) => {
                        // First by rating (descending)
                        if ((b.rating || 0) !== (a.rating || 0)) {
                            return (b.rating || 0) - (a.rating || 0);
                        }
                        // Then by enrollment count (descending)
                        return b.enrollmentCount - a.enrollmentCount;
                    }).slice(0, 6); // Show top 6 popular courses

                    setCourses(sortedData);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error loading courses data:", err);
                    setError("Could not load popular courses. Please try again later.");
                    setLoading(false);
                });
        } catch (err) {
            console.error("Error loading courses data:", err);
            setError("Could not load popular courses. Please try again later.");
            setLoading(false);
        }
    }, []);

    if (loading) return (
        <div className="bg-gray-900 py-24">
            <LoadingSpinner />
        </div>
    );

    if (error) return (
        <div className="bg-gray-900 text-center py-24">
            <p className="text-red-400 text-xl">{error}</p>
        </div>
    );

    return (
        <div className="bg-gray-900 py-24">
            <div className="container mx-auto px-4">
                { }
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                        Our Top-Rated Courses
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Join thousands of learners in these top-rated courses, celebrated for their depth and expert instruction.
                    </p>
                </div>

                { }
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PopularCourses;