const express = require('express');
const bcrypt = require('bcrypt'); // For password hashing
const User = require('../models/User'); // Import the User model
const router = express.Router();

// Route for user registration
router.post('/', async (req, res) => {
  // Extracting data from the request body
  const {
    firstName,
    lastName,
    streetAddress,
    town,
    state,
    pincode,
    phone,
    email,
    nomineeName,
    sponsorId,
    vigilanceOfficer,
    accountUsername,
    password,
  } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      streetAddress,
      town,
      state,
      pincode,
      phone,
      email,
      nomineeName,
      sponsorId,
      vigilanceOfficer,
      accountUsername,
      password: hashedPassword, // Save the hashed password
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('Error registering user:', err.message);
    res.status(500).json({ message: 'Server error while registering user' });
  }
});

module.exports = router;
