import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Enrollment from '../models/Enrollment.js';
import { recordLogin } from '../services/mlMetricsService.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'secret';

export const register = async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      photoURL,
    });

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Streak logic
    const now = new Date();
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    
    const todayStr = now.toISOString().split('T')[0];
    const lastLoginStr = lastLogin ? lastLogin.toISOString().split('T')[0] : '';

    if (todayStr !== lastLoginStr) {
      if (lastLoginStr) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastLoginStr === yesterdayStr) {
          user.streakDays = (user.streakDays || 0) + 1;
        } else {
          user.streakDays = 1;
        }
      } else {
        user.streakDays = 1; // First login ever
      }
      user.lastLogin = now;
      await user.save();
    }

    // Record login for ML dropout features (non-blocking)
    if (user.role === 'student') {
      Enrollment.find({ userId: user._id, status: 'active' })
        .then(enrollments => {
          const courseIds = enrollments.map(e => e.courseId);
          return recordLogin(user._id, courseIds);
        })
        .catch(err => console.error('ML metrics recordLogin error:', err));
    }

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
