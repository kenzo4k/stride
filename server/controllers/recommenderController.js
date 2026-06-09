import axios from 'axios';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

export const getRecommendations = async (req, res) => {
  const { category, courseId } = req.query;

  // If courseId is provided, we are fetching similar courses for a course detail page.
  // We want to return courses in the same category rather than user-based personalized recommendations.
  if (courseId) {
    try {
      const targetId = mongoose.Types.ObjectId.isValid(courseId)
        ? new mongoose.Types.ObjectId(courseId)
        : courseId;

      const targetCourse = await Course.findById(targetId);
      if (!targetCourse) {
        return res.status(404).json({ message: "Course not found" });
      }

      const category = targetCourse.category;
      const tags = targetCourse.tags || [];

      // Query similar courses by matching category (case-insensitive) OR sharing any tags
      const query = {
        status: { $in: ['active', 'published'] },
        _id: { $ne: targetId },
        $or: []
      };

      if (category) {
        query.$or.push({ category: { $regex: category, $options: 'i' } });
      }
      if (tags.length > 0) {
        query.$or.push({ tags: { $in: tags } });
      }

      if (query.$or.length === 0) {
        delete query.$or;
      }

      let courses = await Course.find(query).limit(4);
      if (courses.length === 0) {
        // Fallback to popular and fresh courses if no matching similarity exists
        courses = await Course.find({ 
          status: { $in: ['active', 'published'] }, 
          _id: { $ne: targetId } 
        })
        .sort({ enrollmentCount: -1, createdAt: -1 })
        .limit(4);
      }
      const recommendations = courses.map(c => {
        let reason = "Related course";
        if (category && c.category === category) {
          reason = `Similar course in ${category}`;
        } else if (tags.some(t => c.tags && c.tags.includes(t))) {
          reason = "Related by tags";
        }
        return {
          ...c.toObject(),
          reason
        };
      });
      return res.status(200).json({ recommendations });
    } catch (dbError) {
      return res.status(500).json({ message: "Failed to get similar courses", error: dbError.message });
    }
  }

  // Otherwise, fetch user-based personalized recommendations from Python microservice
  try {
    const userId = req.user.id;
    const pythonServiceUrl = process.env.RECOMMENDER_SERVICE_URL || 'http://localhost:8000';
    // Call Python microservice
    const response = await axios.get(`${pythonServiceUrl}/api/recommendations/${userId}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.warn("Python service unreachable, falling back to database query recommendation...");
    try {
      const query = { status: { $in: ['active', 'published'] } };
      if (category) {
        query.category = category;
      }
      const courses = await Course.find(query).limit(4);
      const recommendations = courses.map(c => ({
        ...c.toObject(),
        reason: category ? `Popular in ${category}` : "Trending introductory course"
      }));
      res.status(200).json({ recommendations });
    } catch (dbError) {
      res.status(500).json({ message: "Failed to get recommendations", error: dbError.message });
    }
  }
};
