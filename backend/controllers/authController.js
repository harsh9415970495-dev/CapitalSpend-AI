const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validateEmail, validatePassword } = require('../utils/validators');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Signup
exports.signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: '❌ All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: '❌ Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: '❌ Password must be at least 6 characters' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: '❌ Passwords do not match' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: '❌ User already exists' });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: '✅ User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: '❌ Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '❌ Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '❌ Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: '✅ Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        monthlyBudget: user.monthlyBudget,
        theme: user.theme,
      },
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, monthlyBudget, theme } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, monthlyBudget, theme },
      { new: true }
    ).select('-password');

    res.json({ message: '✅ Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};