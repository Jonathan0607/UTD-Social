import express from 'express';
import { body, validationResult } from 'express-validator';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'academic', 'social', 'event', 'question'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array of 2 numbers'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
], async (req: any, res: express.Response): Promise<express.Response | void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { content, media, location, tags, isPublic, category, expiresAt } = req.body;

    const post = await Post.create({
      author: req.user._id,
      content,
      media: media || [],
      location,
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      category: category || 'general',
      expiresAt
    });

    // Populate author information
    await post.populate('author', 'username firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
});

// @route   GET /api/posts
// @desc    Get all posts (with pagination, filtering, and search)
// @access  Private
router.get('/', protect, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const author = req.query.author as string;
    const tags = req.query.tags as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { isPublic: true };

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
      const tagArray = tags.split(',').map((tag: string) => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const posts = await Post.find(query)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('likes', 'username firstName lastName profilePicture')
      .skip(skip)
      .limit(limit)
      .sort(sortOptions);

    const total = await Post.countDocuments(query);

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

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
});

// @route   GET /api/posts/feed
// @desc    Get personalized feed for current user
// @access  Private
router.get('/feed', protect, async (req: any, res: express.Response): Promise<express.Response | void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get posts from followed users and public posts
    const followingIds = currentUser.following;
    const query = {
      $or: [
        { author: { $in: followingIds } },
        { isPublic: true }
      ]
    };

    const posts = await Post.find(query)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('likes', 'username firstName lastName profilePicture')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Post.countDocuments(query);

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

  } catch (error) {
    console.error('Get feed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching feed'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get post by ID
// @access  Private
router.get('/:id', protect, async (req: any, res: express.Response): Promise<express.Response | void> => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('likes', 'username firstName lastName profilePicture');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user can view the post
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

  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching post'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (post author only)
router.put('/:id', protect, [
  body('content')
    .optional()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'academic', 'social', 'event', 'question'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
], async (req: any, res: express.Response): Promise<express.Response | void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts'
      });
    }

    const updateFields = req.body;
    delete updateFields.author; // Don't allow changing the author

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    });

  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating post'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (post author only)
router.delete('/:id', protect, async (req: any, res: express.Response): Promise<express.Response | void> => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting post'
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', protect, async (req: any, res: express.Response): Promise<express.Response | void> => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      await Post.findByIdAndUpdate(req.params.id, {
        $pull: { likes: req.user._id }
      });
      
      res.json({
        success: true,
        message: 'Post unliked successfully',
        liked: false
      });
    } else {
      // Like
      await Post.findByIdAndUpdate(req.params.id, {
        $push: { likes: req.user._id }
      });
      
      res.json({
        success: true,
        message: 'Post liked successfully',
        liked: true
      });
    }

  } catch (error) {
    console.error('Like post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while liking/unliking post'
    });
  }
});

export default router; 