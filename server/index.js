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
import dropoutRoutes from "./routes/dropoutRoutes.js";
import timeTrackingRoutes from "./routes/timeTrackingRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { verifyToken } from "./middleware/auth.js";
import { evaluateCodeSubmission } from "./controllers/codeEvaluationController.js";
import { executeCodeLocally } from "./services/localRunner.js";

// Controllers (for some top-level routes)
import { getMyEnrollments } from "./controllers/enrollmentController.js";
import { registerUser } from "./controllers/userController.js";

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

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

// === MongoDB Connection Middleware for Serverless ===
const connectDB = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/stride", {
      serverSelectionTimeoutMS: 5000
    });
    console.log("Connected to MongoDB Atlas");
    next();
  } catch (err) {
    console.error("Database connection error in middleware:", err);
    res.status(500).json({ message: "Database connection failed", error: err.message });
  }
};

// === LOG MIDDLEWARE ===
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(connectDB);

app.use(cors({
  origin: (origin, callback) => {
    // Allow local development and vercel deployments
    if (!origin || origin.startsWith('http://localhost:') || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Stride API is running',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      courses: '/api/courses',
      auth: '/api/auth',
      enrollments: '/api/enrollments',
      metrics: '/api/metrics'
    }
  });
});
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
app.use("/api/dropout", dropoutRoutes);
app.use("/api/time-tracking", timeTrackingRoutes);
app.use("/api/upload", uploadRoutes);

// Compatibility with frontend services
app.post("/api/register-user", registerUser);
app.get("/api/my-enrollments", verifyToken, getMyEnrollments);

// In-memory rate limiter: ~10 requests per minute per user/IP
const rateLimitWindowMs = 60 * 1000;
const rateLimitMaxRequests = 10;
const requestCounts = new Map();

const codeExecutionLimiter = (req, res, next) => {
  const userId = req.user?.id || req.ip;
  const now = Date.now();

  if (!requestCounts.has(userId)) {
    requestCounts.set(userId, []);
  }

  const timestamps = requestCounts.get(userId);
  const activeTimestamps = timestamps.filter(t => now - t < rateLimitWindowMs);

  if (activeTimestamps.length >= rateLimitMaxRequests) {
    return res.status(429).json({
      message: "Too many code execution requests. Please try again in a minute."
    });
  }

  activeTimestamps.push(now);
  requestCounts.set(userId, activeTimestamps);
  next();
};

// === Code Execution Route ===
// Uses @vercel/sandbox on Vercel, local subprocess in dev, Piston as last fallback
app.post("/api/execute", verifyToken, codeExecutionLimiter, async (req, res) => {
  const { code, language, version } = req.body;

  const allowedLanguages = ['javascript', 'python3', 'java', 'cpp', 'sqlite3'];
  if (!language || !allowedLanguages.includes(language)) {
    return res.status(400).json({ error: "Unsupported or invalid language." });
  }
  if (!version || typeof version !== 'string' || version.trim() === '') {
    return res.status(400).json({ error: "Invalid language version." });
  }
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: "Code content is required." });
  }

  try {
    // Primary: use @vercel/sandbox (production) or local subprocess (dev)
    const result = await executeCodeLocally(language, code, '');
    res.json(result);
  } catch (primaryError) {
    console.warn("Primary execution failed, falling back to Piston API:", primaryError.message);

    // Fallback: try the public Piston API
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
      res.json(response.data);
    } catch (pistonError) {
      console.error("Piston API also failed:", pistonError.response?.data || pistonError.message);
      res.status(500).json({ error: "All execution engines failed. Please try again later." });
    }
  }
});

// === JUDGE0: Code Evaluation against Test Cases ===
app.post("/api/execute-tests", verifyToken, codeExecutionLimiter, evaluateCodeSubmission);

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
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT} 🚀`));
}

export default app;