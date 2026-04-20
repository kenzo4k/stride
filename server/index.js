/* global process */
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Stripe from "stripe";
import dotenv from "dotenv";
import axios from "axios";
import jwt from "jsonwebtoken";

// Routes
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Controllers (for some top-level routes)
import { getMyEnrollments } from "./controllers/enrollmentController.js";
import { registerUser } from "./controllers/userController.js";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    process.env.MONGODB_URI || "mongodb+srv://karimsh:123@cluster0.str1gjq.mongodb.net/registrationDB"
  )
  .then(() => console.log("MongoDB connected ✔️"))
  .catch((err) => console.error("MongoDB connection error ❌:", err));

// === API Routes ===
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);

// Compatibility with frontend services
app.post("/api/register-user", registerUser);
app.get("/api/my-enrollments", getMyEnrollments);

// JWT endpoint
app.post("/api/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || 'secret', {
    expiresIn: "1h",
  });
  res.send({ token });
});

// === PISTON: Code Execution Route ===
app.post("/api/execute", async (req, res) => {
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
app.post("/api/create-payment-intent", async (req, res) => {
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
