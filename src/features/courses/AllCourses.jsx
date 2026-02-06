import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, Users, Star, Award, BookOpen, User, ArrowRight, Filter, Search, Grid, List } from 'lucide-react';
import { RecommendedCourses } from '../../components/common';

// LoadingSpinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <BookOpen className="w-6 h-6 text-blue-500 animate-pulse" />
      </div>
    </div>
  </div>
);

const AllCourses = () => {
  const { category } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortOption, setSortOption] = useState('default'); // New state for sorting
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    const fetchAllCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        // Import the local JSON file
        const data = await import('../../../public/courses.json');

        // Filter out courses that were "deleted" in this session
        const deletedCourseIds = JSON.parse(localStorage.getItem('deletedCourses') || '[]');
        const filteredData = data.default.filter(course => !deletedCourseIds.includes(course._id));

        setCourses(filteredData);
      } catch (error) {
        console.error('Error loading courses data:', error);
        setError('Could not load courses data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllCourses();
  }, []);

  useEffect(() => {
    let filtered = [...courses]; // Create a mutable copy
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.short_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course =>
        course.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply sorting
    if (sortOption === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'title-asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'title-desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOption === 'rating-desc') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedCategory, courses, sortOption]);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  const categories = ['all', ...new Set(courses.map(course => course.category))];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">Oops! Something went wrong</h3>
            <p className="text-red-300/80">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const CourseCard = ({ course }) => (
    <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 flex flex-col">
      {/* Image Section - Top */}
      <div className="relative overflow-hidden w-full h-48">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent"></div>
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-sm text-white rounded-full text-sm font-medium">
            {course.level}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          {course.featured && (
            <div className="bg-yellow-500/90 backdrop-blur-sm rounded-full p-1.5">
              <Star className="w-4 h-4 text-white fill-current" />
            </div>
          )}
        </div>
        {course.discount_price < course.price && (
          <div className="absolute bottom-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-sm font-bold">
            {Math.round(((course.price - course.discount_price) / course.price) * 100)}% OFF
          </div>
        )}
      </div>

      {/* Content Section - Bottom */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-md text-xs uppercase tracking-wide">
            {course.category}
          </span>
          <span className="text-gray-500 text-xs">•</span>
          <span className="text-gray-400 text-xs">{course.language}</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
          {course.title}
        </h3>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {course.short_description}
        </p>

        <div className="flex items-center flex-wrap gap-4 mb-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.seats} seats</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{course.enrollmentCount} enrolled</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-gray-300 text-sm">{course.rating || 'New'}</span>
            </div>
            {course.completion_certificate && (
              <div className="flex items-center gap-1 text-green-400">
                <Award className="w-4 h-4" />
                <span className="text-xs">Certificate</span>
              </div>
            )}
          </div>
          <div className="text-right">
            {course.discount_price < course.price ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 line-through text-sm">${course.price}</span>
                <span className="text-green-400 font-bold text-lg">${course.discount_price}</span>
              </div>
            ) : (
              <span className="text-blue-400 font-bold text-lg">${course.price}</span>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="text-sm text-gray-400 mb-2 sm:mb-0">
            <span>by </span>
            <span className="text-gray-300 font-medium">{course.instructor.name}</span>
          </div>
          <Link
            to={`/course/${course._id}`}
            className="group/btn flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 w-full sm:w-auto justify-center"
          >
            <span>Details</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              Explore All Our Courses
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Discover a world of knowledge with our comprehensive course collection.
              From beginner to advanced levels, find the perfect course to advance your skills.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span>{courses.length} Courses Available</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                <span>{courses.reduce((sum, course) => sum + course.enrollmentCount, 0)} Students Enrolled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all w-full sm:w-80"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-gray-800">
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="default" className="bg-gray-800">Sort By</option>
                  <option value="price-asc" className="bg-gray-800">Price: Low to High</option>
                  <option value="price-desc" className="bg-gray-800">Price: High to Low</option>
                  <option value="title-asc" className="bg-gray-800">Title: A-Z</option>
                  <option value="title-desc" className="bg-gray-800">Title: Z-A</option>
                  <option value="rating-desc" className="bg-gray-800">Rating: High to Low</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-700/30 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <span>Showing {filteredCourses.length} of {courses.length} courses</span>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-300 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-colors"
            >
              View All Courses
            </button>
          </div>
        ) : (
          <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredCourses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* Recommended Courses Section */}
      <div className="border-t border-gray-800 mt-8">
        <RecommendedCourses 
          scenario="python" 
          title="Related To Your Interests" 
          description="Based on what other students are learning in this category" 
        />
      </div>
    </div>
  );
};

export default AllCourses;