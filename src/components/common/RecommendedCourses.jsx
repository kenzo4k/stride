import React, { useEffect, useState } from 'react';
import recommendationService from '../../services/recommendationService';
import CourseCard from './CourseCard';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const RecommendedCourses = ({ 
  scenario = 'web-dev', 
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

    if (!user) {
      const sampleRecs = recommendationService.getSampleRecommendations(scenario).recommendations;
      setRecommendations(sampleRecs);
      return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const response = await api.get('/recommendations');
        if (response.data && response.data.recommendations && response.data.recommendations.length > 0) {
          setRecommendations(response.data.recommendations);
        } else {
          const sampleRecs = recommendationService.getSampleRecommendations(scenario).recommendations;
          setRecommendations(sampleRecs);
        }
      } catch (error) {
        console.error("Error fetching personalized recommendations:", error);
        const sampleRecs = recommendationService.getSampleRecommendations(scenario).recommendations;
        setRecommendations(sampleRecs);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, scenario, customCourses]);

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
