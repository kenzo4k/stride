import User from '../models/User.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, photoURL, role } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({ name, email, photoURL, role: role || 'student', lastLogin: new Date() });
    const saved = await user.save();
    res.json({ message: "User registered successfully", user: saved });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, photoURL, bio, title } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, photoURL, bio, title },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { isPublic } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { isPublic } },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getPublicInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' }).select('name email bio title photoURL');
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
