import axios from 'axios';
import Course from '../models/Course.js';

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const pythonServiceUrl = process.env.RECOMMENDER_SERVICE_URL || 'http://localhost:8000';
    // Call Python microservice
    const response = await axios.get(`${pythonServiceUrl}/api/recommendations/${userId}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.warn("Python service unreachable, falling back to database query recommendation...");
    try {
      const { category, courseId } = req.query;
      
      const query = { status: { $in: ['active', 'published'] } };
      if (category) {
        query.category = category;
      }
      if (courseId) {
        query._id = { $ne: courseId };
      }
      
      const courses = await Course.find(query).limit(4);
      res.status(200).json({ recommendations: courses });
    } catch (dbError) {
      res.status(500).json({ message: "Failed to get recommendations", error: dbError.message });
    }
  }
};
