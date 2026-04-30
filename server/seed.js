import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';
import StudentMetric from './models/StudentMetric.js';
import Assessment from './models/Assessment.js';
import CourseContent from './models/CourseContent.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/registrationDB';

// Helper function to generate random data for ML readiness
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
      StudentMetric.deleteMany({}),
      Assessment.deleteMany({}),
      CourseContent.deleteMany({}),
    ]);
    console.log('All collections cleared');

    // === CREATE USERS ===
    console.log('Creating users...');
    
    // Admin user
    const admin = await User.create({
      name: 'Platform Admin',
      email: 'admin@stride.com',
      role: 'admin',
      xp: 5000,
      level: 10,
    });

    // Instructor user
    const instructor = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah@stride.com',
      role: 'instructor',
      xp: 3500,
      level: 8,
      bio: 'Full-stack developer with 10+ years of experience teaching programming.',
      title: 'Senior Software Engineer',
    });

    // Second instructor
    const instructor2 = await User.create({
      name: 'Michael Chen',
      email: 'michael@stride.com',
      role: 'instructor',
      xp: 2800,
      level: 7,
      bio: 'Data scientist and ML expert with a passion for teaching.',
      title: 'ML Engineer',
    });

    // Student users
    const students = await User.create([
      // High-performing students
      {
        name: 'Alice Williams',
        email: 'alice@student.com',
        role: 'student',
        xp: 4500,
        level: 12,
        bio: 'Computer Science major, always eager to learn new technologies.',
      },
      {
        name: 'Bob Martinez',
        email: 'bob@student.com',
        role: 'student',
        xp: 3200,
        level: 9,
        bio: 'Working professional transitioning to tech.',
      },
      {
        name: 'Carol Davis',
        email: 'carol@student.com',
        role: 'student',
        xp: 2800,
        level: 8,
        bio: 'Recent grad exploring web development.',
      },
      // Average-performing students
      {
        name: 'David Brown',
        email: 'david@student.com',
        role: 'student',
        xp: 1500,
        level: 5,
        bio: 'Learning to code in my spare time.',
      },
      {
        name: 'Emma Wilson',
        email: 'emma@student.com',
        role: 'student',
        xp: 1200,
        level: 4,
        bio: 'Curious about data science.',
      },
      // Struggling students (at-risk for ML detection)
      {
        name: 'Frank Lee',
        email: 'frank@student.com',
        role: 'student',
        xp: 200,
        level: 2,
        bio: 'New to programming, finding it challenging.',
      },
      {
        name: 'Grace Taylor',
        email: 'grace@student.com',
        role: 'student',
        xp: 150,
        level: 1,
        bio: 'Just started my coding journey.',
      },
      {
        name: 'Henry Anderson',
        email: 'henry@student.com',
        role: 'student',
        xp: 100,
        level: 1,
        bio: 'Balancing work and studies.',
      },
    ]);

    console.log(`Created ${1 + 1 + 1 + students.length} users`);

    // === CREATE COURSES ===
    console.log('Creating courses...');
    
    const courses = await Course.create([
      {
        title: 'Complete Web Development Bootcamp',
        short_description: 'Learn HTML, CSS, JavaScript, React, Node.js and more!',
        detailed_description: 'A comprehensive course covering all aspects of modern web development. From basic HTML to advanced React patterns.',
        price: 4999,
        discount_price: 2999,
        instructor: instructor._id,
        category: 'Web Development',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
        seats: 100,
        level: 'Beginner',
        language: 'English',
        duration: '40 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: [
          'Build responsive websites',
          'Create interactive web applications',
          'Master JavaScript ES6+',
          'Learn React and Redux',
        ],
        tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
        status: 'active',
      },
      {
        title: 'Python for Data Science',
        short_description: 'Master Python programming for data analysis and machine learning.',
        detailed_description: 'Learn Python from scratch and progress to advanced data science techniques including Pandas, NumPy, and visualization.',
        price: 5999,
        discount_price: 3999,
        instructor: instructor2._id,
        category: 'Data Science',
        image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935',
        seats: 80,
        level: 'Intermediate',
        language: 'English',
        duration: '35 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: ['Basic programming knowledge'],
        learning_outcomes: [
          'Master Python fundamentals',
          'Analyze data with Pandas',
          'Create visualizations',
          'Build ML models',
        ],
        tags: ['Python', 'Data Science', 'Machine Learning', 'Pandas'],
        status: 'active',
      },
      {
        title: 'Advanced JavaScript Concepts',
        short_description: 'Deep dive into JavaScript: async/await, closures, prototypes, and more.',
        detailed_description: 'Take your JavaScript skills to the next level with advanced concepts and patterns used in modern frameworks.',
        price: 3999,
        instructor: instructor._id,
        category: 'Web Development',
        image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a',
        seats: 50,
        level: 'Advanced',
        language: 'English',
        duration: '20 hours',
        featured: false,
        completion_certificate: true,
        prerequisites: ['JavaScript basics'],
        learning_outcomes: [
          'Master async programming',
          'Understand prototypes and inheritance',
          'Build complex applications',
        ],
        tags: ['JavaScript', 'ES6+', 'Advanced'],
        status: 'active',
      },
      {
        title: 'Introduction to Machine Learning',
        short_description: 'Learn the fundamentals of ML algorithms and their applications.',
        detailed_description: 'A beginner-friendly introduction to machine learning concepts, algorithms, and practical applications.',
        price: 6999,
        discount_price: 4999,
        instructor: instructor2._id,
        category: 'Machine Learning',
        image: 'https://images.unsplash.com/photo-1555949963-aa79fefcee84',
        seats: 60,
        level: 'Beginner',
        language: 'English',
        duration: '30 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: ['Basic Python', 'Statistics basics'],
        learning_outcomes: [
          'Understand ML fundamentals',
          'Build regression models',
          'Create classification models',
          'Evaluate model performance',
        ],
        tags: ['Machine Learning', 'Python', 'AI', 'Data Science'],
        status: 'active',
      },
      {
        title: 'React Native Mobile Development',
        short_description: 'Build cross-platform mobile apps with React Native.',
        detailed_description: 'Learn to build native mobile applications for iOS and Android using React Native and JavaScript.',
        price: 5499,
        instructor: instructor._id,
        category: 'Mobile Development',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c',
        seats: 40,
        level: 'Intermediate',
        language: 'English',
        duration: '25 hours',
        featured: false,
        completion_certificate: true,
        prerequisites: ['JavaScript', 'React basics'],
        learning_outcomes: [
          'Build iOS and Android apps',
          'Use React Native components',
          'Handle navigation',
          'Deploy to app stores',
        ],
        tags: ['React Native', 'Mobile', 'JavaScript', 'iOS', 'Android'],
        status: 'active',
      },
    ]);

    console.log(`Created ${courses.length} courses`);

    // === CREATE ENROLLMENTS ===
    console.log('Creating enrollments...');
    
    const enrollmentData = [];
    
    // Enroll all students in Web Development course
    for (const student of students) {
      enrollmentData.push({
        userId: student._id,
        courseId: courses[0]._id,
        progress: randomBetween(20, 95),
        grade: 0,
        status: 'active',
      });
    }
    
    // Enroll some students in Data Science course
    for (let i = 0; i < 5; i++) {
      enrollmentData.push({
        userId: students[i]._id,
        courseId: courses[1]._id,
        progress: randomBetween(10, 80),
        grade: 0,
        status: 'active',
      });
    }
    
    // Enroll advanced students in Advanced JavaScript
    enrollmentData.push({
      userId: students[0]._id,
      courseId: courses[2]._id,
      progress: randomBetween(50, 100),
      grade: 0,
      status: 'active',
    });
    enrollmentData.push({
      userId: students[1]._id,
      courseId: courses[2]._id,
      progress: randomBetween(30, 70),
      grade: 0,
      status: 'active',
    });
    
    // Enroll some in ML course
    for (let i = 2; i < 6; i++) {
      enrollmentData.push({
        userId: students[i]._id,
        courseId: courses[3]._id,
        progress: randomBetween(5, 60),
        grade: 0,
        status: 'active',
      });
    }

    const enrollments = await Enrollment.create(enrollmentData);
    console.log(`Created ${enrollments.length} enrollments`);

    // === CREATE COURSE CONTENT ===
    console.log('Creating course content...');
    
    const courseContentData = courses.map((course, index) => ({
      courseId: course._id,
      sections: [
        {
          title: `Section ${index + 1}: Introduction`,
          lessons: [
            { title: 'Welcome to the course', type: 'video', content: 'https://example.com/video1.mp4', xp: 10 },
            { title: 'Course overview', type: 'article', content: '<h1>Course Overview</h1><p>Welcome to this course...</p>', xp: 5 },
            { title: 'Setting up your environment', type: 'article', content: '<h1>Setup</h1><p>Follow these steps to set up...</p>', xp: 10 },
          ],
        },
        {
          title: `Section ${index + 1}: Core Concepts`,
          lessons: [
            { title: 'Fundamentals', type: 'video', content: 'https://example.com/video2.mp4', xp: 15 },
            { title: 'Key concepts quiz', type: 'quiz', content: '', xp: 20 },
            { title: 'Practice exercise', type: 'coding', content: '// Write your code here', xp: 25 },
          ],
        },
        {
          title: `Section ${index + 1}: Advanced Topics`,
          lessons: [
            { title: 'Advanced techniques', type: 'article', content: '<h1>Advanced Topics</h1><p>Let\'s explore...</p>', xp: 15 },
            { title: 'Final project', type: 'coding', content: '// Build your project', xp: 50 },
          ],
        },
      ],
    }));

    await CourseContent.create(courseContentData);
    console.log(`Created ${courses.length} course content documents`);

    // === CREATE ASSESSMENTS ===
    console.log('Creating assessments...');
    
    const assessmentData = courses.map((course) => ({
      courseId: course._id,
      topics: [
        {
          name: 'Fundamentals',
          questions: [
            { type: 'mcq', question: 'What is the main purpose of this technology?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0, points: 10 },
            { type: 'true_false', question: 'This concept is important for beginners.', correctAnswer: true, points: 5 },
            { type: 'fill_blank', question: 'The _______ is used to achieve this goal.', answer: 'component', points: 5 },
          ],
        },
        {
          name: 'Intermediate',
          questions: [
            { type: 'mcq', question: 'Which approach is better for this scenario?', options: ['A', 'B', 'C', 'D'], correctAnswer: 1, points: 15 },
            { type: 'matching', question: 'Match the concepts with their uses.', pairs: [
              { left: 'Concept A', right: 'Use 1', correct: true },
              { left: 'Concept B', right: 'Use 2', correct: true },
            ], points: 10 },
          ],
        },
      ],
    }));

    await Assessment.create(assessmentData);
    console.log(`Created ${courses.length} assessments`);

    // === CREATE STUDENT METRICS ===
    console.log('Creating student metrics for ML features...');
    
    // Define performance patterns for ML data variety
    const performancePatterns = [
      // High performers (indices 0-2)
      { loginRange: [40, 60], sessionRange: [120, 240], lessonsRange: [15, 20], quizRange: [85, 98], assignmentRange: [80, 95], risk: 'low' },
      // Average performers (indices 3-4)
      { loginRange: [15, 30], sessionRange: [45, 90], lessonsRange: [8, 15], quizRange: [60, 80], assignmentRange: [55, 75], risk: 'medium' },
      // Struggling students (indices 5-7)
      { loginRange: [3, 10], sessionRange: [10, 40], lessonsRange: [2, 7], quizRange: [25, 55], assignmentRange: [30, 50], risk: 'high' },
    ];

    const metricsData = [];
    const totalLessonsPerCourse = 9; // Based on course content created

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const studentEnrollments = enrollments.filter(e => e.userId.toString() === student._id.toString());
      
      // Determine performance pattern
      let pattern;
      if (i < 3) pattern = performancePatterns[0];
      else if (i < 5) pattern = performancePatterns[1];
      else pattern = performancePatterns[2];

      for (const enrollment of studentEnrollments) {
        // Generate quiz scores
        const quizScores = Array.from({ length: 3 }, () => randomBetween(pattern.quizRange[0], pattern.quizRange[1]));
        const averageQuizScore = Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length);

        // Generate assignment scores
        const assignmentScores = Array.from({ length: 2 }, () => randomBetween(pattern.assignmentRange[0], pattern.assignmentRange[1]));
        const averageAssignmentScore = Math.round(assignmentScores.reduce((a, b) => a + b, 0) / assignmentScores.length);

        // Calculate engagement score components
        const loginCount = randomBetween(pattern.loginRange[0], pattern.loginRange[1]);
        const sessionTime = randomBetween(pattern.sessionRange[0], pattern.sessionRange[1]);
        const lessonsCompleted = randomBetween(pattern.lessonsRange[0], pattern.lessonsRange[1]);
        const videoWatchTime = Math.round(lessonsCompleted * randomFloat(15, 30));
        const articlesRead = randomBetween(Math.floor(lessonsCompleted / 2), lessonsCompleted);
        const codingExercisesCompleted = randomBetween(Math.floor(lessonsCompleted / 3), Math.floor(lessonsCompleted / 2));

        // Calculate engagement score
        const lessonScore = (lessonsCompleted / totalLessonsPerCourse) * 30;
        const quizScoreContribution = averageQuizScore * 0.25;
        const assignmentScoreContribution = averageAssignmentScore * 0.25;
        const activityScore = Math.min(loginCount / 10, 1) * 20;
        const engagementScore = Math.round(lessonScore + quizScoreContribution + assignmentScoreContribution + activityScore);

        // Calculate streak and active days
        const totalDaysActive = randomBetween(Math.floor(loginCount / 2), loginCount);
        const streakDays = pattern.risk === 'high' ? randomBetween(0, 3) : randomBetween(5, 15);

        // Generate last active date (recent for active, older for at-risk)
        const daysAgo = pattern.risk === 'high' ? randomBetween(7, 30) : randomBetween(0, 3);
        const lastActive = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        metricsData.push({
          studentId: student._id,
          courseId: enrollment.courseId,
          loginCount,
          sessionTime,
          lessonsCompleted,
          totalLessons: totalLessonsPerCourse,
          quizScores,
          averageQuizScore,
          assignmentsCompleted: assignmentScores.length,
          totalAssignments: 2,
          assignmentScores,
          averageAssignmentScore,
          videoWatchTime,
          articlesRead,
          codingExercisesCompleted,
          totalCodingExercises: Math.floor(totalLessonsPerCourse / 3),
          lastActive,
          streakDays,
          totalDaysActive,
          engagementScore,
          riskFlag: pattern.risk,
        });
      }
    }

    const studentMetrics = await StudentMetric.create(metricsData);
    console.log(`Created ${studentMetrics.length} student metric records`);

    // === SUMMARY ===
    console.log('\n========== SEED SUMMARY ==========');
    console.log(`Users: 1 Admin, 2 Instructors, ${students.length} Students`);
    console.log(`Courses: ${courses.length}`);
    console.log(`Enrollments: ${enrollments.length}`);
    console.log(`Course Content: ${courses.length}`);
    console.log(`Assessments: ${courses.length}`);
    console.log(`Student Metrics: ${studentMetrics.length}`);
    console.log('===================================\n');

    console.log('Seed completed successfully!');

    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();