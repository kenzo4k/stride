import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import CourseContent from './models/CourseContent.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stride';

async function inspect() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB.");

    // Find course with title containing 'test' (case-insensitive)
    const courses = await Course.find({ title: /test/i });
    console.log(`Found ${courses.length} matching courses.`);

    for (const course of courses) {
      console.log(`\n==========================================`);
      console.log(`Course Title: "${course.title}"`);
      console.log(`Course ID: ${course._id}`);
      
      const content = await CourseContent.findOne({ courseId: course._id });
      if (!content) {
        console.log(`No course content found for this course.`);
        continue;
      }

      content.sections.forEach((section, i) => {
        console.log(`  Section #${i+1}: "${section.title}"`);
        section.lessons.forEach((lesson, j) => {
          console.log(`    Lesson #${j+1}: "${lesson.title}" | Type: ${lesson.type}`);
          console.log(`      Content/URL: ${lesson.content}`);
          console.log(`      Full details:`, JSON.stringify(lesson, null, 2));
        });
      });
    }

    process.exit(0);
  } catch (err) {
    console.error("Error inspecting:", err);
    process.exit(1);
  }
}

inspect();
