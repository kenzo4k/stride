import React, { useEffect, useState } from 'react';
import CourseCard from '../../components/common/CourseCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { courseService } from '../../services/courseService';

const LatestCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLatestCourses = async () => {
            try {
                const data = await courseService.getAllCourses();

                // Filter out courses that were "deleted" in this session
                const deletedCourseIds = JSON.parse(localStorage.getItem('deletedCourses') || '[]');
                const filteredData = data.filter(course => !deletedCourseIds.includes(course._id));
                
                // Sort by createdAt to get latest courses (newest first)
                const sortedData = filteredData
                    .filter(course => course.status === 'active')
                    .sort((a, b) => 
                        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                    )
                    .slice(0, 8);

                setCourses(sortedData);
                setLoading(false);
            } catch (err) {
                console.error("Error loading courses data:", err);
                setError("Could not load the latest courses. Please try again later.");
                setLoading(false);
            }
        };

        fetchLatestCourses();
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
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                        Our Latest Courses
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Explore the newest additions to our catalog and stay ahead with the latest skills and technologies.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {courses.map(course => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LatestCourses;