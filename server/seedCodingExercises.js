import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import CourseContent from './models/CourseContent.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stride';

async function seedCodingExercises() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Python course
    const course = await Course.findOne({ title: 'Python Basics for Data Science' });
    if (!course) {
      console.error('Course "Python Basics for Data Science" not found. Please seed courses first.');
      process.exit(1);
    }

    // Find or create course content
    let contentDoc = await CourseContent.findOne({ courseId: course._id });
    if (!contentDoc) {
      console.log('No content document found for this course, creating new content...');
      contentDoc = new CourseContent({ courseId: course._id, sections: [] });
    }

    // Define three python problems
    const pythonLessons = [
      {
        id: `coding-${course._id}-1`,
        title: 'Exercise: Sum of Two Numbers',
        type: 'coding',
        xp: 25,
        exercise: {
          description: 'Write a Python function `add(a, b)` that takes two numbers and returns their sum.',
          starterCode: 'def add(a, b):\n    # Write your code here\n    pass\n',
          language: 'python',
          testCases: [
            { input: '2\n3', expectedOutput: '5', isHidden: false },
            { input: '-1\n5', expectedOutput: '4', isHidden: false },
            { input: '100\n200', expectedOutput: '300', isHidden: true }
          ]
        }
      },
      {
        id: `coding-${course._id}-2`,
        title: 'Exercise: Factorial of a Number',
        type: 'coding',
        xp: 35,
        exercise: {
          description: 'Write a Python function `factorial(n)` that returns the factorial of a non-negative integer `n`. (e.g., factorial of 5 is 5 * 4 * 3 * 2 * 1 = 120)',
          starterCode: 'def factorial(n):\n    # Write your code here\n    pass\n',
          language: 'python',
          testCases: [
            { input: '5', expectedOutput: '120', isHidden: false },
            { input: '0', expectedOutput: '1', isHidden: false },
            { input: '3', expectedOutput: '6', isHidden: true }
          ]
        }
      },
      {
        id: `coding-${course._id}-3`,
        title: 'Exercise: Is Palindrome String',
        type: 'coding',
        xp: 40,
        exercise: {
          description: 'Write a Python function `is_palindrome(s)` that returns `True` if the string `s` is a palindrome (reads the same forward and backward), and `False` otherwise.',
          starterCode: 'def is_palindrome(s):\n    # Write your code here\n    pass\n',
          language: 'python',
          testCases: [
            { input: 'racecar', expectedOutput: 'True', isHidden: false },
            { input: 'hello', expectedOutput: 'False', isHidden: false },
            { input: 'radar', expectedOutput: 'True', isHidden: true }
          ]
        }
      }
    ];

    // Seed content structure
    contentDoc.sections = [
      {
        title: 'Introduction to Python',
        lessons: [
          { id: `video-${course._id}-1`, title: 'Welcome to Python Basics', type: 'video', content: 'https://example.com/video1.mp4', xp: 10 },
          { id: `article-${course._id}-2`, title: 'Python syntax overview', type: 'article', content: 'Python Basics\n\nPython is known for clean readability.', xp: 5 },
          pythonLessons[0] // Add Sum of Two Numbers here
        ]
      },
      {
        title: 'Control Flow and Math',
        lessons: [
          { id: `video-${course._id}-4`, title: 'Loops and recursion in Python', type: 'video', content: 'https://example.com/video2.mp4', xp: 15 },
          pythonLessons[1] // Add Factorial here
        ]
      },
      {
        title: 'Data Structures and Strings',
        lessons: [
          { id: `article-${course._id}-7`, title: 'Working with Python strings', type: 'article', content: 'Strings\n\nStrings are immutable sequences in Python.', xp: 15 },
          pythonLessons[2] // Add Is Palindrome here
        ]
      }
    ];

    await contentDoc.save();
    console.log('✓ Successfully seeded Python coding exercises and test cases for "Python Basics for Data Science"');
    
    mongoose.disconnect();
  } catch (err) {
    console.error('Seeding coding exercises failed:', err);
    process.exit(1);
  }
}

seedCodingExercises();
