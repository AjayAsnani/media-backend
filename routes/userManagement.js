const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model

// Route to fetch all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.status(200).json(users); // Send the user data as a response
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

module.exports = router;