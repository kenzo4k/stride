import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Stripe from "stripe";
import dotenv from "dotenv";
import axios from "axios";

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
    "mongodb+srv://karimsh:123@cluster0.str1gjq.mongodb.net/registrationDB"
  )
  .then(() => console.log("MongoDB connected ✔️"))
  .catch((err) => console.error("MongoDB connection error ❌:", err));

// === Models ===
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  photoURL: String,
  role: String,
});
const User = mongoose.model("User", userSchema);

const courseSchema = new mongoose.Schema({
  title: String,
  price: Number,
});
const Course = mongoose.model("Course", courseSchema);

// === PISTON: Code Execution Route ===
// This route replaces the Judge0 logic for a credit-card-free alternative.
app.post("/api/execute", async (req, res) => {
  const { code, language, version } = req.body;

  // Piston v2 Request Body Format
  const executionData = {
    language: language,
    version: version,
    files: [
      {
        content: code,
      },
    ],
  };

  try {
    const response = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      executionData
    );

    // Piston returns an object containing 'stdout', 'stderr', and 'output' (combined)
    // We send back the 'run' object which contains these fields.
    res.json(response.data.run);
  } catch (error) {
    console.error("Piston API Error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ error: "Execution engine failed. Please try again." });
  }
});

// === STRIPE: Create Payment Intent ===
app.post("/create-payment-intent", async (req, res) => {
  const { amount, courseId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 4900,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// === POST: Register User ===
app.post("/api/register-user", async (req, res) => {
  try {
    const { name, email, photoURL, role } = req.body;
    if (!name || !email || !photoURL || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newUser = new User({ name, email, photoURL, role });
    const saved = await newUser.save();
    res.json({ message: "User saved successfully", user: saved });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000 🚀"));
