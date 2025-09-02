"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const major = req.query.major;
        const interests = req.query.interests;
        const skip = (page - 1) * limit;
        const searchQuery = {};
        if (search) {
            searchQuery.$or = [
                { username: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { major: { $regex: search, $options: 'i' } }
            ];
        }
        if (major) {
            searchQuery.major = { $regex: major, $options: 'i' };
        }
        if (interests) {
            const interestArray = interests.split(',').map((interest) => interest.trim());
            searchQuery.interests = { $in: interestArray };
        }
        searchQuery._id = { $ne: req.user._id };
        const users = await User_1.User.find(searchQuery)
            .select('username firstName lastName major graduationYear interests profilePicture bio followerCount followingCount')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await User_1.User.countDocuments(searchQuery);
        res.json({
            success: true,
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
});
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id)
            .select('-password')
            .populate('followers', 'username firstName lastName profilePicture')
            .populate('following', 'username firstName lastName profilePicture');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            user
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching user'
        });
    }
});
router.post('/:id/follow', auth_1.protect, async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot follow yourself'
            });
        }
        const userToFollow = await User_1.User.findById(req.params.id);
        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: 'User to follow not found'
            });
        }
        const currentUser = await User_1.User.findById(req.user._id);
        if (currentUser.following.includes(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'You are already following this user'
            });
        }
        await User_1.User.findByIdAndUpdate(req.user._id, {
            $push: { following: req.params.id }
        });
        await User_1.User.findByIdAndUpdate(req.params.id, {
            $push: { followers: req.user._id }
        });
        res.json({
            success: true,
            message: 'User followed successfully'
        });
    }
    catch (error) {
        console.error('Follow user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while following user'
        });
    }
});
router.delete('/:id/follow', auth_1.protect, async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot unfollow yourself'
            });
        }
        const userToUnfollow = await User_1.User.findById(req.params.id);
        if (!userToUnfollow) {
            return res.status(404).json({
                success: false,
                message: 'User to unfollow not found'
            });
        }
        const currentUser = await User_1.User.findById(req.user._id);
        if (!currentUser.following.includes(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'You are not following this user'
            });
        }
        await User_1.User.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.params.id }
        });
        await User_1.User.findByIdAndUpdate(req.params.id, {
            $pull: { followers: req.user._id }
        });
        res.json({
            success: true,
            message: 'User unfollowed successfully'
        });
    }
    catch (error) {
        console.error('Unfollow user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while unfollowing user'
        });
    }
});
router.get('/:id/followers', auth_1.protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const user = await User_1.User.findById(req.params.id)
            .populate({
            path: 'followers',
            select: 'username firstName lastName profilePicture bio major graduationYear',
            options: { skip, limit, sort: { createdAt: -1 } }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const total = user.followers.length;
        res.json({
            success: true,
            followers: user.followers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalFollowers: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });
    }
    catch (error) {
        console.error('Get followers error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching followers'
        });
    }
});
router.get('/:id/following', auth_1.protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const user = await User_1.User.findById(req.params.id)
            .populate({
            path: 'following',
            select: 'username firstName lastName profilePicture bio major graduationYear',
            options: { skip, limit, sort: { createdAt: -1 } }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const total = user.following.length;
        res.json({
            success: true,
            following: user.following,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalFollowing: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });
    }
    catch (error) {
        console.error('Get following error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching following list'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map