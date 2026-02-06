import React from 'react';
import recommendationService from '../../services/recommendationService';
import CourseCard from './CourseCard';

const RecommendedCourses = ({ 
  scenario = 'web-dev', 
  maxCourses = 4, 
  title = "Recommended For You",
  description = "Based on your learning history and interests",
  customCourses = null,
  compact = false
}) => {
  const recommendations = customCourses || recommendationService.getSampleRecommendations(scenario).recommendations;

  if (!recommendations || !recommendations.length) return null;

  const content = (
    <>
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${compact ? 'text-cyan-400' : 'text-white'}`}>{title}</h2>
        {description && <p className="text-gray-400">{description}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.slice(0, maxCourses).map((item) => {
          // Support both {course, reason} and just course
          const course = item.course || item;
          const reason = item.reason;

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
