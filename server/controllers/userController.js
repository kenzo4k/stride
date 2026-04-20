import User from '../models/User.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, photoURL, role } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (user) {
      // Update existing user's lastLogin and other info if needed
      user.lastLogin = new Date();
      if (name) user.name = name;
      if (photoURL) user.photoURL = photoURL;
      // We don't necessarily want to override the role if it's already set, 
      // unless it's a new user or specifically requested.
      await user.save();
      return res.json({ message: "User updated successfully", user });
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
    // In a real app, we'd get the user ID from the auth token
    // For now, let's assume we have it or use email from body if provided
    const user = await User.findOneAndUpdate(
      { email: req.body.email }, // This is a simplification
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
