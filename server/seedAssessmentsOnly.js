/* global process */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import Course from './models/Course.js';
import Assessment from './models/Assessment.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stride';

async function seedAssessments() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    // Clear assessments only
    console.log('Clearing existing assessments collection...');
    await Assessment.deleteMany({});
    console.log('Assessment collection cleared.');

    try {
      console.log('Dropping old index constraints...');
      await Assessment.collection.dropIndexes();
      console.log('Indexes dropped successfully.');
    } catch (indexErr) {
      console.log('No indexes to drop or index drop bypassed:', indexErr.message);
    }

    // Fetch all courses
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses to generate assessments for.`);

    if (courses.length === 0) {
      console.log('⚠️ No courses found in the database. Please run the main seed script first.');
      process.exit(0);
    }

    const assessmentData = [];
    courses.forEach((course) => {
      // 1. Pre-Assessment
      assessmentData.push({
        courseId: course._id,
        type: 'pre-assessment',
        topics: [
          {
            name: 'Initial Skill Check',
            questions: [
              { type: 'mcq', question: `Which of the following is a key prerequisite for learning ${course.title}?`, options: ['Basic computer literacy', '10 years programming experience', 'PhD in computer science', 'No prior knowledge needed'], correctAnswer: 0, points: 10 },
              { type: 'true_false', question: 'A pre-assessment measures baseline knowledge before the course starts.', correctAnswer: true, points: 5 },
              { type: 'fill_blank', question: `What is the main subject of ${course.title}?`, answer: course.category || 'technology', points: 5 },
            ]
          }
        ]
      });

      // 2. Final Exam
      assessmentData.push({
        courseId: course._id,
        type: 'final-exam',
        topics: [
          {
            name: 'Fundamentals',
            questions: [
              { type: 'mcq', question: `What is the primary target of ${course.title}?`, options: ['To build production apps', 'To learn theoretical models', 'To configure environments', 'All of the above'], correctAnswer: 3, points: 10 },
              { type: 'true_false', question: 'Prerequisites must be met before taking this course.', correctAnswer: true, points: 5 },
              { type: 'fill_blank', question: 'The main library we use is called ________.', answer: 'core', points: 5 },
            ],
          },
          {
            name: 'Intermediate Concepts',
            questions: [
              { type: 'mcq', question: 'Which methodology guarantees standard security?', options: ['Authentication token validation', 'Bypassing credentials', 'Storing raw passwords', 'No security needed'], correctAnswer: 0, points: 15 },
              { type: 'matching', question: 'Match the modules with their respective goals.', pairs: [
                { left: 'Security', right: 'Hashing', correct: true },
                { left: 'Storage', right: 'Database', correct: true },
              ], points: 10 },
            ],
          },
        ],
      });
    });

    console.log('Inserting assessments...');
    await Assessment.create(assessmentData);
    console.log(`Successfully seeded ${assessmentData.length} assessments (pre-assessments & final exams) for existing courses! 🎉`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding assessments failed:', error);
    process.exit(1);
  }
}

seedAssessments();
