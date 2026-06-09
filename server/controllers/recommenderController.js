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

      const query = { status: { $in: ['active', 'published'] }, _id: { $ne: targetId } };
      if (category) {
        query.category = category;
      }
      let courses = await Course.find(query).limit(4);
      if (courses.length === 0) {
        // Fallback to any active/published courses if no other courses in same category
        courses = await Course.find({ status: { $in: ['active', 'published'] }, _id: { $ne: targetId } }).limit(4);
      }
      return res.status(200).json({ recommendations: courses });
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
      res.status(200).json({ recommendations: courses });
    } catch (dbError) {
      res.status(500).json({ message: "Failed to get recommendations", error: dbError.message });
    }
  }
};
