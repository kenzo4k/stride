// src/services/recommendationService.js

const recommendationService = {
  // Sample completed courses (simulated user history)
  sampleCompletedCourses: [
    {
      id: 1,
      title: 'Web Development Fundamentals',
      category: 'Web Development',
      level: 'Beginner'
    },
    {
      id: 2,
      title: 'Python Basics',
      category: 'Programming',
      level: 'Beginner'
    },
    {
      id: 3,
      title: 'Data Science Introduction',
      category: 'Data Science',
      level: 'Intermediate'
    }
  ],

  // Sample available courses (catalog)
  sampleCourses: [
    {
      id: '1',
      title: 'React Fundamentals',
      category: 'Web Development',
      level: 'Beginner',
      instructor: 'John Doe',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
      price: 49.99,
      rating: 4.8,
      enrollmentCount: 1250
    },
    {
      id: '2',
      title: 'Node.js Basics',
      category: 'Web Development',
      level: 'Intermediate',
      instructor: 'Jane Smith',
      image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=600&q=80',
      price: 59.99,
      rating: 4.7,
      enrollmentCount: 980
    },
    {
      id: '3',
      title: 'Database Design',
      category: 'Web Development',
      level: 'Intermediate',
      instructor: 'Mike Johnson',
      image: 'https://images.unsplash.com/photo-1544383023-53fafa435504?auto=format&fit=crop&w=600&q=80',
      price: 44.99,
      rating: 4.6,
      enrollmentCount: 850
    },
    {
      id: '4',
      title: 'Data Science with Python',
      category: 'Data Science',
      level: 'Intermediate',
      instructor: 'Sarah Wilson',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
      price: 69.99,
      rating: 4.9,
      enrollmentCount: 2100
    },
    {
      id: '5',
      title: 'Python Automation',
      category: 'Programming',
      level: 'Intermediate',
      instructor: 'Tom Brown',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      price: 39.99,
      rating: 4.5,
      enrollmentCount: 750
    },
    {
      id: '6',
      title: 'Web Development with Django',
      category: 'Web Development',
      level: 'Advanced',
      instructor: 'Emily Davis',
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80',
      price: 79.99,
      rating: 4.8,
      enrollmentCount: 620
    },
    {
      id: '7',
      title: 'Advanced React Patterns',
      category: 'Web Development',
      level: 'Advanced',
      instructor: 'Chris Lee',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      price: 89.99,
      rating: 4.9,
      enrollmentCount: 480
    },
    {
      id: '8',
      title: 'Machine Learning Fundamentals',
      category: 'Data Science',
      level: 'Advanced',
      instructor: 'David Chen',
      image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=600&q=80',
      price: 99.99,
      rating: 4.7,
      enrollmentCount: 920
    }
  ],

  // Get recommendations based on user's completed courses
  getRecommendations: (completedCourses = []) => {
    const recommendations = [];
    const allCourses = recommendationService.sampleCourses;

    completedCourses.forEach(completed => {
      allCourses.forEach(available => {
        let score = 0;
        let reason = '';

        // Same category recommendation
        if (available.category === completed.category) {
          score += 3;
          reason = `Continue building ${completed.category} skills`;
        }

        // Level progression recommendation
        const levels = ['Beginner', 'Intermediate', 'Advanced'];
        const completedLevelIndex = levels.indexOf(completed.level);
        const availableLevelIndex = levels.indexOf(available.level);

        if (availableLevelIndex === completedLevelIndex + 1) {
          score += 2;
          reason = `Next level in ${completed.category}`;
        }

        // Same level in same category
        if (available.level === completed.level && available.category === completed.category) {
          score += 1;
          reason = `More courses in ${completed.category}`;
        }

        // Only add if it has some relevance
        if (score > 0) {
          // Check if already recommended
          const existingIndex = recommendations.findIndex(r => r.course.id === available.id);
          
          if (existingIndex >= 0) {
            // Update if this has higher score
            if (score > recommendations[existingIndex].score) {
              recommendations[existingIndex] = {
                course: available,
                score: score,
                reason: reason
              };
            }
          } else {
            recommendations.push({
              course: available,
              score: score,
              reason: reason
            });
          }
        }
      });
    });

    // Sort by score descending and return top 4
    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, 4);
  },

  // Get recommendations for sample scenarios
  getSampleRecommendations: (scenario = 'web-dev') => {
    const scenarios = {
      'web-dev': {
        completed: [
          { id: 1, title: 'Web Development Fundamentals', category: 'Web Development', level: 'Beginner' }
        ],
        recommendations: [
          {
            course: recommendationService.sampleCourses[0],
            score: 4,
            reason: 'Continue building Web Development skills'
          },
          {
            course: recommendationService.sampleCourses[1],
            score: 3,
            reason: 'Next level in Web Development'
          },
          {
            course: recommendationService.sampleCourses[2],
            score: 3,
            reason: 'Next level in Web Development'
          },
          {
            course: recommendationService.sampleCourses[5],
            score: 2,
            reason: 'Advanced Web Development'
          }
        ]
      },
      'python': {
        completed: [
          { id: 2, title: 'Python Basics', category: 'Programming', level: 'Beginner' }
        ],
        recommendations: [
          {
            course: recommendationService.sampleCourses[4],
            score: 3,
            reason: 'Based on your interest in Python'
          },
          {
            course: recommendationService.sampleCourses[5],
            score: 3,
            reason: 'Web Development with Python'
          },
          {
            course: recommendationService.sampleCourses[3],
            score: 2,
            reason: 'Data Science with Python'
          },
          {
            course: recommendationService.sampleCourses[0],
            score: 1,
            reason: 'Expand your programming skills'
          }
        ]
      },
      'mixed': {
        completed: [
          { id: 1, title: 'Web Development Fundamentals', category: 'Web Development', level: 'Beginner' },
          { id: 2, title: 'Python Basics', category: 'Programming', level: 'Beginner' }
        ],
        recommendations: [
          {
            course: recommendationService.sampleCourses[0],
            score: 4,
            reason: 'Continue building Web Development skills'
          },
          {
            course: recommendationService.sampleCourses[1],
            score: 3,
            reason: 'Next level in Web Development'
          },
          {
            course: recommendationService.sampleCourses[4],
            score: 3,
            reason: 'Based on your interest in Python'
          },
          {
            course: recommendationService.sampleCourses[5],
            score: 3,
            reason: 'Web Development with Python'
          }
        ]
      }
    };

    return scenarios[scenario] || scenarios['web-dev'];
  },

  // Get all available courses (for testing/demo)
  getAllCourses: () => {
    return recommendationService.sampleCourses;
  }
};

export default recommendationService;
