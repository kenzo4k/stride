import axios from 'axios';

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const pythonServiceUrl = process.env.RECOMMENDER_SERVICE_URL || 'http://localhost:8000';
    // Call Python microservice
    const response = await axios.get(`${pythonServiceUrl}/api/recommendations/${userId}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching recommendations from Python service:", error.message);
    res.status(500).json({ message: "Failed to get recommendations", error: error.message });
  }
};
