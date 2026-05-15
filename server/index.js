/* global process */
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Stripe from "stripe";
import dotenv from "dotenv";
import axios from "axios";

// Routes
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import metricRoutes from "./routes/metricRoutes.js";
import recommenderRoutes from "./routes/recommenderRoutes.js";
import { verifyToken } from "./middleware/auth.js";

// Controllers (for some top-level routes)
import { getMyEnrollments } from "./controllers/enrollmentController.js";
import { registerUser } from "./controllers/userController.js";

dotenv.config();

const app = express();

// Stripe with fallback for missing key
let stripe;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey);
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY not found. Payment features will return mock responses.');
  stripe = {
    paymentIntents: {
      create: async () => ({
        client_secret: 'mock_client_secret_' + Date.now(),
        id: 'mock_pi_' + Date.now(),
      }),
    },
  };
}

// === LOG MIDDLEWARE ===
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// === MongoDB Connect ===
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/stride"
  )
  .then(() => console.log("MongoDB connected ✔️"))
  .catch((err) => console.error("MongoDB connection error ❌:", err));

// === API Routes ===
app.use("/api/users", userRoutes);
app.use("/api/courses", contentRoutes);    // /api/courses/:id/content
app.use("/api/courses", assessmentRoutes); // /api/courses/:id/assessment
app.use("/api/courses", courseRoutes);      // /api/courses (CRUD)
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", gamificationRoutes);        // /api/leaderboard, /api/student/badges, /api/users/award-xp
app.use("/api/metrics", metricRoutes);      // /api/metrics/*
app.use("/api/recommendations", recommenderRoutes);

// Compatibility with frontend services
app.post("/api/register-user", registerUser);
app.get("/api/my-enrollments", verifyToken, getMyEnrollments);

// === PISTON: Code Execution Route ===
app.post("/api/execute", verifyToken, async (req, res) => {
  const { code, language, version } = req.body;
  const executionData = {
    language: language,
    version: version,
    files: [{ content: code }],
  };

  try {
    const response = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      executionData
    );
    res.json(response.data.run);
  } catch (error) {
    console.error("Piston API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Execution engine failed. Please try again." });
  }
});

// === STRIPE: Create Payment Intent ===
app.post("/api/create-payment-intent", verifyToken, async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 4900,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT} 🚀`));