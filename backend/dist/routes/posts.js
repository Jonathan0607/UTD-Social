"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Post_1 = require("../models/Post");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.protect, [
    (0, express_validator_1.body)('content')
        .isLength({ min: 1, max: 2000 })
        .withMessage('Post content must be between 1 and 2000 characters'),
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(['general', 'academic', 'social', 'event', 'question'])
        .withMessage('Invalid category'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    (0, express_validator_1.body)('location.coordinates')
        .optional()
        .isArray({ min: 2, max: 2 })
        .withMessage('Location coordinates must be an array of 2 numbers'),
    (0, express_validator_1.body)('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { content, media, location, tags, isPublic, category, expiresAt } = req.body;
        const post = await Post_1.Post.create({
            author: req.user._id,
            content,
            media: media || [],
            location,
            tags: tags || [],
            isPublic: isPublic !== undefined ? isPublic : true,
            category: category || 'general',
            expiresAt
        });
        await post.populate('author', 'username firstName lastName profilePicture');
        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post
        });
    }
    catch (error) {
        console.error('Create post error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while creating post'
        });
    }
});
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const category = req.query.category;
        const author = req.query.author;
        const tags = req.query.tags;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';
        const skip = (page - 1) * limit;
        const query = { isPublic: true };
        if (search) {
            query.$or = [
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        if (category) {
            query.category = category;
        }
        if (author) {
            query.author = author;
        }
        if (tags) {
            const tagArray = tags.split(',').map((tag) => tag.trim());
            query.tags = { $in: tagArray };
        }
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const posts = await Post_1.Post.find(query)
            .populate('author', 'username firstName lastName profilePicture')
            .populate('likes', 'username firstName lastName profilePicture')
            .skip(skip)
            .limit(limit)
            .sort(sortOptions);
        const total = await Post_1.Post.countDocuments(query);
        res.json({
            success: true,
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPosts: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });
    }
    catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching posts'
        });
    }
});
router.get('/feed', auth_1.protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const currentUser = await User_1.User.findById(req.user._id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const followingIds = currentUser.following;
        const query = {
            $or: [
                { author: { $in: followingIds } },
                { isPublic: true }
            ]
        };
        const posts = await Post_1.Post.find(query)
            .populate('author', 'username firstName lastName profilePicture')
            .populate('likes', 'username firstName lastName profilePicture')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await Post_1.Post.countDocuments(query);
        res.json({
            success: true,
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPosts: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });
    }
    catch (error) {
        console.error('Get feed error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching feed'
        });
    }
});
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const post = await Post_1.Post.findById(req.params.id)
            .populate('author', 'username firstName lastName profilePicture')
            .populate('likes', 'username firstName lastName profilePicture');
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        if (!post.isPublic && post.author._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this post'
            });
        }
        res.json({
            success: true,
            post
        });
    }
    catch (error) {
        console.error('Get post error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching post'
        });
    }
});
router.put('/:id', auth_1.protect, [
    (0, express_validator_1.body)('content')
        .optional()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Post content must be between 1 and 2000 characters'),
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(['general', 'academic', 'social', 'event', 'question'])
        .withMessage('Invalid category'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    (0, express_validator_1.body)('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const post = await Post_1.Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own posts'
            });
        }
        const updateFields = req.body;
        delete updateFields.author;
        const updatedPost = await Post_1.Post.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true, runValidators: true }).populate('author', 'username firstName lastName profilePicture');
        res.json({
            success: true,
            message: 'Post updated successfully',
            post: updatedPost
        });
    }
    catch (error) {
        console.error('Update post error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating post'
        });
    }
});
router.delete('/:id', auth_1.protect, async (req, res) => {
    try {
        const post = await Post_1.Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own posts'
            });
        }
        await Post_1.Post.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete post error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while deleting post'
        });
    }
});
router.post('/:id/like', auth_1.protect, async (req, res) => {
    try {
        const post = await Post_1.Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        const isLiked = post.likes.includes(req.user._id);
        if (isLiked) {
            await Post_1.Post.findByIdAndUpdate(req.params.id, {
                $pull: { likes: req.user._id }
            });
            res.json({
                success: true,
                message: 'Post unliked successfully',
                liked: false
            });
        }
        else {
            await Post_1.Post.findByIdAndUpdate(req.params.id, {
                $push: { likes: req.user._id }
            });
            res.json({
                success: true,
                message: 'Post liked successfully',
                liked: true
            });
        }
    }
    catch (error) {
        console.error('Like post error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while liking/unliking post'
        });
    }
});
exports.default = router;
//# sourceMappingURL=posts.js.map