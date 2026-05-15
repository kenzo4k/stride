import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  photoURL: {
    type: String,
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student',
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  bio: {
    type: String,
  },
  title: {
    type: String,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'banned', 'suspended'],
    default: 'active',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  streakDays: {
    type: Number,
    default: 0,
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
