"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};
router.post('/register', [
    (0, express_validator_1.body)('username')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('firstName')
        .notEmpty()
        .withMessage('First name is required'),
    (0, express_validator_1.body)('lastName')
        .notEmpty()
        .withMessage('Last name is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { username, email, password, firstName, lastName, major, graduationYear, interests } = req.body;
        const existingUser = await User_1.User.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
            });
        }
        const user = await User_1.User.create({
            username,
            email,
            password,
            firstName,
            lastName,
            major,
            graduationYear,
            interests: interests || []
        });
        const token = generateToken(user._id.toString());
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                major: user.major,
                graduationYear: user.graduationYear,
                interests: user.interests,
                profilePicture: user.profilePicture,
                bio: user.bio
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});
router.post('/login', [
    (0, express_validator_1.body)('identifier')
        .notEmpty()
        .withMessage('Username or email is required'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { identifier, password } = req.body;
        const user = await User_1.User.findOne({
            $or: [
                { username: identifier },
                { email: identifier }
            ]
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        user.lastActive = new Date();
        await user.save();
        const token = generateToken(user._id.toString());
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                major: user.major,
                graduationYear: user.graduationYear,
                interests: user.interests,
                profilePicture: user.profilePicture,
                bio: user.bio,
                followerCount: user.followerCount,
                followingCount: user.followingCount
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});
router.get('/me', auth_1.protect, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user._id)
            .select('-password')
            .populate('followers', 'username firstName lastName profilePicture')
            .populate('following', 'username firstName lastName profilePicture');
        res.json({
            success: true,
            user
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
});
router.put('/profile', auth_1.protect, [
    (0, express_validator_1.body)('firstName')
        .optional()
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    (0, express_validator_1.body)('bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),
    (0, express_validator_1.body)('major')
        .optional()
        .trim(),
    (0, express_validator_1.body)('graduationYear')
        .optional()
        .isInt({ min: 2020, max: 2030 })
        .withMessage('Graduation year must be between 2020 and 2030'),
    (0, express_validator_1.body)('interests')
        .optional()
        .isArray()
        .withMessage('Interests must be an array')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const updateFields = req.body;
        delete updateFields.password;
        delete updateFields.email;
        delete updateFields.username;
        const user = await User_1.User.findByIdAndUpdate(req.user._id, { $set: updateFields }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    }
    catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map