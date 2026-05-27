/* global process */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Import models
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';
import StudentMetric from './models/StudentMetric.js';
import MLFeature from './models/MLFeature.js';
import Assessment from './models/Assessment.js';
import CourseContent from './models/CourseContent.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stride';

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
      MLFeature.deleteMany({}),
      Assessment.deleteMany({}),
      CourseContent.deleteMany({}),
    ]);
    console.log('All collections cleared');

    // === CREATE TEST ACCOUNTS ===
    console.log('Creating test accounts...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Admin account
    const _admin = await User.create({
      name: 'Platform Admin',
      email: 'admin@stride.com',
      password: hashedPassword,
      role: 'admin',
      xp: 5000,
      level: 10,
    });
    console.log('✓ Admin account: admin@stride.com');

    // Instructor account
    const instructor = await User.create({
      name: 'Sarah Johnson',
      email: 'instructor@stride.com',
      password: hashedPassword,
      role: 'instructor',
      xp: 3500,
      level: 8,
      bio: 'Full-stack developer with 10+ years of experience teaching programming.',
      title: 'Senior Software Engineer',
    });
    console.log('✓ Instructor account: instructor@stride.com');

    // Student account
    const student = await User.create({
      name: 'Student User',
      email: 'student@stride.com',
      password: hashedPassword,
      role: 'student',
      xp: 500,
      level: 3,
      bio: 'Eager to learn new technologies.',
    });
    console.log('✓ Student account: student@stride.com');

    // Additional instructor
    const instructor2 = await User.create({
      name: 'Michael Chen',
      email: 'michael@stride.com',
      password: hashedPassword,
      role: 'instructor',
      xp: 2800,
      level: 7,
      bio: 'Data scientist and ML expert with a passion for teaching.',
      title: 'ML Engineer',
    });

    // Additional students for variety
    const additionalStudentsData = [
      {
        name: 'Alice Williams',
        email: 'alice@student.com',
        password: hashedPassword,
        role: 'student',
        xp: 4500,
        level: 12,
        bio: 'Computer Science major, always eager to learn new technologies.',
      },
      {
        name: 'Bob Martinez',
        email: 'bob@student.com',
        password: hashedPassword,
        role: 'student',
        xp: 3200,
        level: 9,
        bio: 'Working professional transitioning to tech.',
      },
      {
        name: 'Carol Davis',
        email: 'carol@student.com',
        password: hashedPassword,
        role: 'student',
        xp: 2800,
        level: 8,
        bio: 'Recent grad exploring web development.',
      },
      {
        name: 'David Brown',
        email: 'david@student.com',
        password: hashedPassword,
        role: 'student',
        xp: 1500,
        level: 5,
        bio: 'Learning to code in my spare time.',
      },
      {
        name: 'Emma Wilson',
        email: 'emma@student.com',
        password: hashedPassword,
        role: 'student',
        xp: 1200,
        level: 4,
        bio: 'Curious about data science.',
      },
      {
        name: 'Frank Lee',
        email: 'frank@student.com',
        password: hashedPassword,
        role: 'student',
        xp: 200,
        level: 2,
        bio: 'New to programming, finding it challenging.',
      },
      {
        name: 'Grace Taylor',
        email: 'grace@student.com',
        password: hashedPassword,
        role: 'student',
        xp: 150,
        level: 1,
        bio: 'Just started my coding journey.',
      },
      {
        name: 'Henry Anderson',
        email: 'henry@student.com',
        password: hashedPassword,
        role: 'student',
        xp: 100,
        level: 1,
        bio: 'Balancing work and studies.',
      },
    ];
    const additionalStudents = await User.create(additionalStudentsData);

    const allStudents = [student, ...additionalStudents];

    console.log(`Created ${1 + 2 + additionalStudents.length + 1} total users`);

    // === CREATE COURSES ===
    console.log('Creating courses...');
    
    const courses = await Course.create([
      // === Front End Path ===
      {
        title: 'HTML & CSS Foundations',
        short_description: 'Master the building blocks of the web: HTML5, CSS3, and responsive design.',
        detailed_description: 'Start your frontend developer journey here. Learn semantic HTML, styling, layout techniques (Flexbox and Grid), media queries, and responsive web design best practices.',
        price: 2999,
        instructor: instructor._id,
        category: 'Front End',
        image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713',
        seats: 100,
        level: 'Beginner',
        language: 'English',
        duration: '15 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Build structured web pages using HTML5', 'Style pages using modern CSS3 techniques', 'Create responsive layouts for all devices'],
        tags: ['HTML', 'CSS', 'Frontend', 'Responsive'],
        status: 'active',
      },
      {
        title: 'Modern JavaScript & DOM',
        short_description: 'Deep dive into modern JavaScript programming, async actions, and DOM manipulation.',
        detailed_description: 'Learn variables, functions, closures, promises, async/await, DOM events, and how to build interactive elements for web applications.',
        price: 3999,
        instructor: instructor._id,
        category: 'Front End',
        image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a',
        seats: 80,
        level: 'Beginner',
        language: 'English',
        duration: '20 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Understand core JavaScript concepts and ES6+ features', 'Manipulate the DOM to build interactive UIs', 'Fetch data from REST APIs using async/await'],
        tags: ['JavaScript', 'DOM', 'ES6', 'Frontend'],
        status: 'active',
      },
      {
        title: 'React.js Development',
        short_description: 'Master components, state, hooks, and React Router to build scalable client-side SPAs.',
        detailed_description: 'Learn React fundamentals, component lifecycle, state management, custom hooks, and routing to develop high-performance single-page web applications.',
        price: 4999,
        instructor: instructor._id,
        category: 'Front End',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
        seats: 60,
        level: 'Intermediate',
        language: 'English',
        duration: '25 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Build modular and reusable React components', 'Manage application state using Hooks', 'Implement routing with React Router'],
        tags: ['React', 'JavaScript', 'Frontend', 'SPA'],
        status: 'active',
      },
      {
        title: 'Next.js Production Apps',
        short_description: 'Learn Server-Side Rendering, Static Site Generation, API routes, and deployment with Next.js.',
        detailed_description: 'Build enterprise-grade applications with Next.js. Master the App Router, data fetching strategies, server actions, dynamic routing, and optimizations.',
        price: 5999,
        instructor: instructor._id,
        category: 'Front End',
        image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec',
        seats: 50,
        level: 'Advanced',
        language: 'English',
        duration: '30 hours',
        featured: false,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Optimize pages with SSR and SSG', 'Build API routes inside Next.js', 'Deploy Next.js apps to production with Vercel'],
        tags: ['Next.js', 'React', 'Frontend', 'SSR'],
        status: 'active',
      },

      // === Back End Path ===
      {
        title: 'Introduction to Node.js & Express',
        short_description: 'Build fast, scalable server-side applications and RESTful APIs using Node.js and Express.',
        detailed_description: 'Learn node runtime, npm, event loop, file system operations, routing, middleware patterns, and how to structure REST APIs.',
        price: 3999,
        instructor: instructor._id,
        category: 'Back End',
        image: 'https://images.unsplash.com/photo-1547658719-da2b51169166',
        seats: 90,
        level: 'Beginner',
        language: 'English',
        duration: '18 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Create robust HTTP servers in Node.js', 'Write Express middleware for routing and validation', 'Handle errors and request inputs securely'],
        tags: ['Node.js', 'Express', 'Backend', 'JavaScript'],
        status: 'active',
      },
      {
        title: 'SQL & NoSQL Databases',
        short_description: 'Master MongoDB and PostgreSQL, database design, query optimization, and schema mapping.',
        detailed_description: 'Understand relational vs document databases. Learn mongoose, pg-promise, indexes, aggregations, database transactions, and security practices.',
        price: 4999,
        instructor: instructor._id,
        category: 'Back End',
        image: 'https://images.unsplash.com/photo-1544383023-53fafa435504',
        seats: 70,
        level: 'Intermediate',
        language: 'English',
        duration: '22 hours',
        featured: false,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Model data for SQL and NoSQL databases', 'Write complex aggregation pipelines and JOIN queries', 'Connect Express apps to PostgreSQL and MongoDB'],
        tags: ['MongoDB', 'PostgreSQL', 'SQL', 'Database'],
        status: 'active',
      },
      {
        title: 'Production Backend & APIs',
        short_description: 'Scale your server apps with caching, authentication, validation, and real-time sockets.',
        detailed_description: 'Deep dive into backend services. Implement Redis caching, JWT authentication, rate limiting, file uploads, and Socket.io integrations.',
        price: 5999,
        instructor: instructor._id,
        category: 'Back End',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
        seats: 60,
        level: 'Intermediate',
        language: 'English',
        duration: '28 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Secure backends with JWT and session auth', 'Optimize response times with Redis caching', 'Implement real-time features using WebSockets'],
        tags: ['Backend', 'APIs', 'JWT', 'Redis'],
        status: 'active',
      },
      {
        title: 'System Design & Microservices',
        short_description: 'Design distributed architectures, message queues, containerization, and gateways.',
        detailed_description: 'Learn microservices design, Docker containers, RabbitMQ/Kafka brokers, API gateways, load balancing, and high-availability setups.',
        price: 7999,
        instructor: instructor._id,
        category: 'Back End',
        image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f',
        seats: 40,
        level: 'Advanced',
        language: 'English',
        duration: '35 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Break monolithic apps into dockerized microservices', 'Implement asynchronous messaging using RabbitMQ', 'Design for high traffic and system fault-tolerance'],
        tags: ['Microservices', 'System Design', 'Docker', 'Backend'],
        status: 'active',
      },

      // === AI & Machine Learning Path ===
      {
        title: 'Python Basics for Data Science',
        short_description: 'Learn Python programming, data analysis with Pandas, and data plotting with Matplotlib.',
        detailed_description: 'Start your AI journey. Learn Python variables, loops, lists, dictionaries, Pandas DataFrames, NumPy arrays, and visualization libraries.',
        price: 2999,
        instructor: instructor2._id,
        category: 'AI & Machine Learning',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
        seats: 100,
        level: 'Beginner',
        language: 'English',
        duration: '15 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Write efficient scripts in Python', 'Clean and analyze datasets using Pandas', 'Create interactive plots and charts'],
        tags: ['Python', 'Pandas', 'Data Science', 'AI'],
        status: 'active',
      },
      {
        title: 'Introduction to Machine Learning',
        short_description: 'Learn foundational ML concepts, regression, classification, and scikit-learn models.',
        detailed_description: 'Dive into supervised and unsupervised learning. Train linear regressions, decision trees, random forests, and SVMs using python libraries.',
        price: 5999,
        instructor: instructor2._id,
        category: 'AI & Machine Learning',
        image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
        seats: 80,
        level: 'Intermediate',
        language: 'English',
        duration: '25 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Explain key ML concepts and math fundamentals', 'Train and evaluate classification/regression models', 'Feature engineer data for scikit-learn algorithms'],
        tags: ['Machine Learning', 'AI', 'Scikit-Learn', 'Python'],
        status: 'active',
      },
      {
        title: 'Deep Learning & Neural Networks',
        short_description: 'Build, train, and deploy artificial neural networks using TensorFlow and PyTorch.',
        detailed_description: 'Learn deep neural networks (DNNs), convolutional neural networks (CNNs), recurrent neural networks (RNNs), model tuning, and optimization.',
        price: 7999,
        instructor: instructor2._id,
        category: 'AI & Machine Learning',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
        seats: 50,
        level: 'Advanced',
        language: 'English',
        duration: '32 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Implement multi-layer neural networks from scratch', 'Build CNNs for image classification tasks', 'Optimize weights using PyTorch / TensorFlow'],
        tags: ['Deep Learning', 'Neural Networks', 'TensorFlow', 'AI'],
        status: 'active',
      },
      {
        title: 'Natural Language Processing & LLMs',
        short_description: 'Learn tokenization, transformers, BERT, GPT models, and prompt engineering.',
        detailed_description: 'Understand language architectures. Build text classification, sentiment analysis, custom transformers, and interface with LLMs via API calls.',
        price: 8999,
        instructor: instructor2._id,
        category: 'AI & Machine Learning',
        image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb',
        seats: 40,
        level: 'Advanced',
        language: 'English',
        duration: '35 hours',
        featured: false,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Perform NLP processing and tokenization', 'Fine-tune BERT models for text classification', 'Deploy transformer architectures for chatbots'],
        tags: ['NLP', 'Transformers', 'LLM', 'AI'],
        status: 'active',
      },

      // === Mobile Applications Path ===
      {
        title: 'Mobile App Fundamentals with Flutter',
        short_description: 'Create native Android and iOS mobile applications using Dart and Flutter framework.',
        detailed_description: 'Learn Dart programming, widgets layout, state management (Provider/Bloc), local storage, and integrating backend REST APIs.',
        price: 4999,
        instructor: instructor2._id,
        category: 'Mobile Applications',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c',
        seats: 80,
        level: 'Beginner',
        language: 'English',
        duration: '22 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Write applications in Dart language', 'Design fluid interfaces using Flutter widgets', 'Build cross-platform applications from single codebase'],
        tags: ['Flutter', 'Dart', 'Mobile', 'Cross-Platform'],
        status: 'active',
      },
      {
        title: 'React Native Fundamentals',
        short_description: 'Develop iOS and Android mobile apps leveraging your React skills.',
        detailed_description: 'Learn React Native layout, JSX elements, native modules, device API integration, navigation libraries, and build deployment pipelines.',
        price: 5999,
        instructor: instructor._id,
        category: 'Mobile Applications',
        image: 'https://images.unsplash.com/photo-1555066931-dfdd70a7e120',
        seats: 60,
        level: 'Intermediate',
        language: 'English',
        duration: '24 hours',
        featured: false,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Translate web React skills into mobile app structures', 'Style native mobile layouts using Flexbox', 'Use device APIs like location and camera'],
        tags: ['React Native', 'Mobile', 'React', 'JavaScript'],
        status: 'active',
      },
      {
        title: 'iOS Swift Programming',
        short_description: 'Master iOS development, Swift language, Storyboards, and SwiftUI layouts.',
        detailed_description: 'Learn Apple Xcode environment, Swift foundations, UI design with SwiftUI, local storage with CoreData, and App Store guidelines.',
        price: 6999,
        instructor: instructor._id,
        category: 'Mobile Applications',
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f',
        seats: 50,
        level: 'Intermediate',
        language: 'English',
        duration: '30 hours',
        featured: true,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Write Swift code and structure iOS applications', 'Create user interfaces using SwiftUI', 'Store database inputs using CoreData'],
        tags: ['Swift', 'SwiftUI', 'iOS', 'Mobile'],
        status: 'active',
      },
      {
        title: 'Android Kotlin Programming',
        short_description: 'Learn native Android mobile app development using Jetpack Compose and Kotlin.',
        detailed_description: 'Master Android Studio, Kotlin programming, layouts with Jetpack Compose, background services, Room DB, and Play Store publishing.',
        price: 6999,
        instructor: instructor2._id,
        category: 'Mobile Applications',
        image: 'https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6',
        seats: 50,
        level: 'Intermediate',
        language: 'English',
        duration: '30 hours',
        featured: false,
        completion_certificate: true,
        prerequisites: [],
        learning_outcomes: ['Write Kotlin scripts for Android app triggers', 'Develop responsive views with Jetpack Compose', 'Interact with SQLite database using Room persistence'],
        tags: ['Kotlin', 'Android', 'Jetpack Compose', 'Mobile'],
        status: 'active',
      },
    ]);

    // Update prerequisites with actual ObjectIds
    await Course.findByIdAndUpdate(courses[1]._id, { prerequisites: [courses[0]._id] }); // Modern JS -> HTML/CSS
    await Course.findByIdAndUpdate(courses[2]._id, { prerequisites: [courses[1]._id] }); // React -> Modern JS
    await Course.findByIdAndUpdate(courses[3]._id, { prerequisites: [courses[2]._id] }); // Next.js -> React
    await Course.findByIdAndUpdate(courses[5]._id, { prerequisites: [courses[4]._id] }); // SQL/NoSQL -> Node.js
    await Course.findByIdAndUpdate(courses[6]._id, { prerequisites: [courses[5]._id] }); // Prod Backend -> SQL/NoSQL
    await Course.findByIdAndUpdate(courses[7]._id, { prerequisites: [courses[6]._id] }); // System Design -> Prod Backend
    await Course.findByIdAndUpdate(courses[9]._id, { prerequisites: [courses[8]._id] }); // ML -> Python Basics
    await Course.findByIdAndUpdate(courses[10]._id, { prerequisites: [courses[9]._id] }); // Deep Learning -> ML
    await Course.findByIdAndUpdate(courses[11]._id, { prerequisites: [courses[9]._id] }); // NLP -> ML
    await Course.findByIdAndUpdate(courses[13]._id, { prerequisites: [courses[2]._id] }); // React Native -> React

    console.log(`Created ${courses.length} courses`);

    // === CREATE ENROLLMENTS ===
    console.log('Creating enrollments...');
    
    const enrollmentData = [];
    
    // Maps student index (in allStudents array) to their course index enrollments and progress levels
    // allStudents = [student, alice, bob, carol, david, emma, frank, grace, henry]
    const personaEnrollments = [
      // 0. Student User (General Explorer): HTML/CSS, Python Basics
      { studentIndex: 0, enrolls: [{ courseIdx: 0, progress: 100, grade: 80 }, { courseIdx: 8, progress: 30, grade: 0 }] },
      // 1. Alice Williams (Frontend Specialist): HTML/CSS, Modern JS, React.js
      { studentIndex: 1, enrolls: [{ courseIdx: 0, progress: 100, grade: 95 }, { courseIdx: 1, progress: 85, grade: 88 }, { courseIdx: 2, progress: 40, grade: 0 }] },
      // 2. Bob Martinez (Backend Specialist): Node.js, SQL/NoSQL
      { studentIndex: 2, enrolls: [{ courseIdx: 4, progress: 100, grade: 82 }, { courseIdx: 5, progress: 50, grade: 75 }] },
      // 3. Carol Davis (AI Enthusiast): Python Basics, Machine Learning
      { studentIndex: 3, enrolls: [{ courseIdx: 8, progress: 100, grade: 96 }, { courseIdx: 9, progress: 70, grade: 88 }] },
      // 4. David Brown (Mobile Developer): Flutter, iOS Swift
      { studentIndex: 4, enrolls: [{ courseIdx: 12, progress: 90, grade: 85 }, { courseIdx: 14, progress: 30, grade: 0 }] },
      // 5. Emma Wilson (AI Enthusiast): Python Basics
      { studentIndex: 5, enrolls: [{ courseIdx: 8, progress: 60, grade: 72 }] },
      // 6. Frank Lee (Mobile Developer): React.js, React Native
      { studentIndex: 6, enrolls: [{ courseIdx: 2, progress: 100, grade: 78 }, { courseIdx: 13, progress: 45, grade: 60 }] },
      // 7. Grace Taylor (Frontend Specialist): HTML/CSS, Modern JS
      { studentIndex: 7, enrolls: [{ courseIdx: 0, progress: 100, grade: 90 }, { courseIdx: 1, progress: 50, grade: 70 }] },
      // 8. Henry Anderson (Backend Specialist): Node.js, SQL/NoSQL, Production Backend
      { studentIndex: 8, enrolls: [{ courseIdx: 4, progress: 100, grade: 92 }, { courseIdx: 5, progress: 80, grade: 85 }, { courseIdx: 6, progress: 20, grade: 0 }] }
    ];

    for (const persona of personaEnrollments) {
      const s = allStudents[persona.studentIndex];
      for (const eInfo of persona.enrolls) {
        enrollmentData.push({
          userId: s._id,
          courseId: courses[eInfo.courseIdx]._id,
          progress: eInfo.progress,
          grade: eInfo.grade,
          status: 'active',
        });
      }
    }

    const enrollments = await Enrollment.create(enrollmentData);
    console.log(`Created ${enrollments.length} enrollments`);

    // === UPDATE COURSE ENROLLMENT COUNTS ===
    console.log('Updating course enrollment counts...');
    for (const course of courses) {
      const count = enrollments.filter(e => e.courseId.toString() === course._id.toString()).length;
      await Course.findByIdAndUpdate(course._id, { enrollmentCount: count });
    }
    console.log('✓ Course enrollmentCount updated');

    // === UPDATE USER ENROLLED COURSES ===
    console.log('Updating user enrolledCourses...');
    for (const s of allStudents) {
      const courseIds = enrollments
        .filter(e => e.userId.toString() === s._id.toString())
        .map(e => e.courseId);
      await User.findByIdAndUpdate(s._id, { enrolledCourses: courseIds });
    }
    console.log('✓ User enrolledCourses updated');

    // === CREATE COURSE CONTENT ===
    console.log('Creating course content...');
    
    const courseContentData = courses.map((course, index) => ({
      courseId: course._id,
      sections: [
        {
          title: 'Introduction',
          lessons: [
            { id: `video-${course._id}-1`, title: `Welcome to ${course.title}`, type: 'video', content: 'https://example.com/video1.mp4', xp: 10 },
            { id: `article-${course._id}-2`, title: 'Course overview & syllabus', type: 'article', content: `<h1>Overview</h1><p>Welcome to ${course.title}. In this module, we will explore key concepts.</p>`, xp: 5 },
            { id: `article-${course._id}-3`, title: 'Setting up your dev tools', type: 'article', content: '<h1>Environment Setup</h1><p>Download your editor and configure variables.</p>', xp: 10 },
          ],
        },
        {
          title: 'Core Concepts',
          lessons: [
            { id: `video-${course._id}-4`, title: 'Understanding the fundamentals', type: 'video', content: 'https://example.com/video2.mp4', xp: 15 },
            { id: `quiz-${course._id}-5`, title: 'Module assessment quiz', type: 'quiz', content: '', xp: 20 },
            { id: `coding-${course._id}-6`, title: 'Interactive coding lab', type: 'coding', content: '// Solve the coding challenge', xp: 25 },
          ],
        },
        {
          title: 'Advanced Modules',
          lessons: [
            { id: `article-${course._id}-7`, title: 'Deep dive details', type: 'article', content: '<h1>Advanced Topics</h1><p>Let us master standard libraries and scalability.</p>', xp: 15 },
            { id: `coding-${course._id}-8`, title: 'Final project execution', type: 'coding', content: '// Build your final solution', xp: 50 },
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
    }));

    await Assessment.create(assessmentData);
    console.log(`Created ${courses.length} assessments`);

    // === CREATE STUDENT METRICS & ML FEATURES ===
    console.log('Creating student metrics & ML features...');
    
    const totalLessonsPerCourse = 8; // Match the 8 lessons defined in course contents above
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setDate(now.getDate() - 7);
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(now);
    windowEnd.setHours(23, 59, 59, 999);

    const metricsData = [];
    const mlFeaturesData = [];

    // performancePatterns based on risk levels
    const performancePatterns = {
      low: { loginRange: [40, 60], sessionRange: [120, 240], lessonsRange: [7, 8], quizRange: [85, 98], risk: 'low', dropout: false },
      medium: { loginRange: [15, 30], sessionRange: [45, 90], lessonsRange: [4, 6], quizRange: [60, 80], risk: 'medium', dropout: false },
      high: { loginRange: [3, 10], sessionRange: [10, 40], lessonsRange: [1, 3], quizRange: [25, 55], risk: 'high', dropout: true }
    };

    for (let i = 0; i < allStudents.length; i++) {
      const s = allStudents[i];
      const studentEnrollments = enrollments.filter(e => e.userId.toString() === s._id.toString());
      
      // Assign performance risk level to students to create dropout risk diversity
      // Frontend/Backend/AI leaders will be low risk, struggling will be high risk
      let riskLevel = 'low';
      if (i === 6 || i === 7) riskLevel = 'medium'; // Frank, Grace
      if (i === 4 || i === 5) riskLevel = 'high';   // David, Emma
      
      const pattern = performancePatterns[riskLevel];

      for (const enrollment of studentEnrollments) {
        const quizAvgScore = enrollment.grade > 0 ? enrollment.grade : randomBetween(pattern.quizRange[0], pattern.quizRange[1]);
        const assignmentAvgScore = Math.max(0, quizAvgScore - randomBetween(2, 10));

        const loginCount = randomBetween(pattern.loginRange[0], pattern.loginRange[1]);
        const sessionTimeAvg = randomBetween(pattern.sessionRange[0], pattern.sessionRange[1]);
        const lessonsCompleted = Math.min(totalLessonsPerCourse, Math.round((enrollment.progress / 100) * totalLessonsPerCourse));
        
        const videoWatchTime = Math.round(lessonsCompleted * randomFloat(15, 30));
        const articlesRead = Math.max(0, lessonsCompleted - 1);
        const codingExercisesCompleted = Math.max(0, Math.floor(lessonsCompleted / 2));

        // Calculate engagement score
        const lessonScore = (lessonsCompleted / totalLessonsPerCourse) * 30;
        const quizScoreContribution = quizAvgScore * 0.25;
        const assignmentScoreContribution = assignmentAvgScore * 0.25;
        const activityScore = Math.min(loginCount / 10, 1) * 20;
        const engagementScore = Math.min(100, Math.round(lessonScore + quizScoreContribution + assignmentScoreContribution + activityScore));

        // Calculate streak and active days
        const totalDaysActive = randomBetween(Math.floor(loginCount / 3), Math.min(7, loginCount));
        const streakDays = pattern.risk === 'high' ? randomBetween(0, 2) : randomBetween(4, 12);
        const lastActiveDaysAgo = pattern.risk === 'high' ? randomBetween(8, 25) : randomBetween(0, 2);

        // 1. StudentMetric Record
        metricsData.push({
          studentId: s._id,
          courseId: enrollment.courseId,
          window_start: windowStart,
          dropout_next_7_days: pattern.dropout,
          login_count: loginCount,
          session_time_avg: sessionTimeAvg,
          lessons_completed: lessonsCompleted,
          total_lessons: totalLessonsPerCourse,
          quiz_avg_score: quizAvgScore,
          assignment_avg_score: assignmentAvgScore,
          video_watch_time: videoWatchTime,
          articles_read: articlesRead,
          coding_exercises_completed: codingExercisesCompleted,
          last_active_days_ago: lastActiveDaysAgo,
          streak_days: streakDays,
          total_days_active: totalDaysActive,
          engagement_score: engagementScore,
          risk_flag: pattern.risk,
        });

        // 2. MLFeature Record (for new model compatibility & Python predictions)
        const totalSessionTime = loginCount * sessionTimeAvg;
        const sessions = Array.from({ length: loginCount }, () => randomBetween(Math.max(5, sessionTimeAvg - 10), sessionTimeAvg + 10));
        
        mlFeaturesData.push({
          studentId: s._id,
          courseId: enrollment.courseId,
          window_start: windowStart,
          window_end: windowEnd,
          login_count: loginCount,
          days_active: totalDaysActive,
          total_session_time_minutes: totalSessionTime,
          avg_session_time_minutes: sessionTimeAvg,
          median_session_time_minutes: sessionTimeAvg,
          lessons_started: lessonsCompleted + randomBetween(0, 2),
          lessons_completed: lessonsCompleted,
          assessments_attempted: enrollment.grade > 0 ? 1 : 0,
          avg_assessment_score: quizAvgScore,
          num_failed_attempts: pattern.risk === 'high' ? 1 : 0,
          num_repeated_attempts: pattern.risk === 'high' ? 1 : 0,
          no_improvement_attempts: pattern.risk === 'high' ? 1 : 0,
          _session_durations: sessions,
          _assessment_scores: enrollment.grade > 0 ? [quizAvgScore] : [],
          _active_dates: Array.from({ length: totalDaysActive }, (_, dIdx) => {
             const d = new Date(now);
             d.setDate(now.getDate() - dIdx);
             return d.toISOString().split('T')[0];
          }),
          dropout_risk_score: pattern.risk === 'high' ? randomFloat(0.75, 0.95) : (pattern.risk === 'medium' ? randomFloat(0.35, 0.6) : randomFloat(0.05, 0.2)),
          dropout_prediction: pattern.dropout,
          risk_level: pattern.risk,
          last_prediction_at: now
        });
      }
    }

    const studentMetrics = await StudentMetric.create(metricsData);
    console.log(`Created ${studentMetrics.length} student metric records`);

    const mlFeatures = await MLFeature.create(mlFeaturesData);
    console.log(`Created ${mlFeatures.length} MLFeature records`);

    // === SUMMARY ===
    console.log('\n========== SEED SUMMARY ==========');
    console.log('📋 Test Accounts:');
    console.log('   • Admin:     admin@stride.com');
    console.log('   • Instructor: instructor@stride.com');
    console.log('   • Student:   student@stride.com');
    console.log(`\n👥 Users: 1 Admin, 2 Instructors, ${allStudents.length} Students`);
    console.log(`📚 Courses: ${courses.length}`);
    console.log(`📝 Enrollments: ${enrollments.length}`);
    console.log(`📊 Student Metrics (StudentMetric): ${studentMetrics.length}`);
    console.log(`📊 ML Features (MLFeature): ${mlFeatures.length}`);
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