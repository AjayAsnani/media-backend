const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Create a new user (Registration)
exports.createUser = async (req, res) => {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, streetAddress, town, state, pincode, phone, email, nomineeName, sponsorId, vigilanceOfficer, accountUsername, password } = req.body;

    try {
        // Check if email or username already exists
        const existingUser = await User.findOne({ $or: [{ email }, { accountUsername }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
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
            password: hashedPassword,
            role: 'user', // Default role set to 'user'
        });

        // Save the user to the database
        const savedUser = await newUser.save();
        const userWithoutPassword = { ...savedUser._doc, password: undefined }; // Hide password
        res.status(201).json(userWithoutPassword);
    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' }); // Use 401 for unauthorized access
        }

        // Create a JWT payload
        const payload = {
            user: { id: user._id, role: user.role },
        };

        // Sign JWT token
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

