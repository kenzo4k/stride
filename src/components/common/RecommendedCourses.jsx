import React, { useEffect, useState } from 'react';
import CourseCard from './CourseCard';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const RecommendedCourses = ({ 
  courseId = null,
  category = null,
  maxCourses = 4, 
  title = "Recommended For You",
  description = "Based on your learning history and interests",
  customCourses = null,
  compact = false
}) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customCourses) {
      setRecommendations(customCourses);
      return;
    }

    const fetchFallbackCourses = async () => {
      try {
        let response;
        if (category) {
          response = await api.get(`/courses/category/${category}`);
        } else {
          response = await api.get('/courses');
        }
        let list = response.data || [];
        if (courseId) {
          list = list.filter(c => (c._id || c.id) !== courseId);
        }
        if (list.length === 0 && category) {
          response = await api.get('/courses');
          list = response.data || [];
          if (courseId) {
            list = list.filter(c => (c._id || c.id) !== courseId);
          }
        }
        setRecommendations(list);
      } catch (err) {
        console.error("Error fetching fallback database courses:", err);
        setRecommendations([]);
      }
    };

    if (!user) {
      fetchFallbackCourses();
      return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const params = {};
        if (courseId) params.courseId = courseId;
        if (category) params.category = category;
        const response = await api.get('/recommendations', { params });
        if (response.data && response.data.recommendations && response.data.recommendations.length > 0) {
          setRecommendations(response.data.recommendations);
        } else {
          await fetchFallbackCourses();
        }
      } catch (error) {
        console.error("Error fetching personalized recommendations:", error);
        await fetchFallbackCourses();
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, courseId, category, customCourses]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-cyan-400"></span>
      </div>
    );
  }

  if (!recommendations || !recommendations.length) return null;

  const content = (
    <>
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${compact ? 'text-cyan-400' : 'text-white'}`}>{title}</h2>
        {description && <p className="text-gray-400">{description}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.slice(0, maxCourses).map((item) => {
          const course = item.course || item;
          const reason = item.reason || (item.recommendation_score ? `Top Match (${Math.round(item.recommendation_score * 100)}%)` : null);

          return (
            <div key={course.id || course._id} className="relative group">
              <CourseCard course={course} />
              {reason && (
                <div className="mt-2 text-xs text-cyan-400 font-medium px-1">
                  {reason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  if (compact) {
    return <div className="mb-12">{content}</div>;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {content}
      </div>
    </section>
  );
};

export default RecommendedCourses;
