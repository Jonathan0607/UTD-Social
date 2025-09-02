import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (with pagination and search)
// @access  Private
router.get('/', protect, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const major = req.query.major as string;
    const interests = req.query.interests as string;

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: any = {};
    
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
      const interestArray = interests.split(',').map((interest: string) => interest.trim());
      searchQuery.interests = { $in: interestArray };
    }

    // Exclude current user from results
    searchQuery._id = { $ne: req.user._id };

    const users = await User.find(searchQuery)
      .select('username firstName lastName major graduationYear interests profilePicture bio followerCount followingCount')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(searchQuery);

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

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, async (req: any, res: express.Response): Promise<express.Response | void> => {
  try {
    const user = await User.findById(req.params.id)
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

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', protect, async (req: any, res: express.Response): Promise<express.Response | void> => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User to follow not found'
      });
    }

    const currentUser = await User.findById(req.user._id);

    // Check if already following
    if (currentUser!.following.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Add to following list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { following: req.params.id }
    });

    // Add to user's followers list
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user._id }
    });

    res.json({
      success: true,
      message: 'User followed successfully'
    });

  } catch (error) {
    console.error('Follow user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while following user'
    });
  }
});

// @route   DELETE /api/users/:id/follow
// @desc    Unfollow a user
// @access  Private
router.delete('/:id/follow', protect, async (req: any, res: express.Response): Promise<express.Response | void> => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot unfollow yourself'
      });
    }

    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User to unfollow not found'
      });
    }

    const currentUser = await User.findById(req.user._id);

    // Check if not following
    if (!currentUser!.following.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    // Remove from following list
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: req.params.id }
    });

    // Remove from user's followers list
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user._id }
    });

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });

  } catch (error) {
    console.error('Unfollow user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while unfollowing user'
    });
  }
});

// @route   GET /api/users/:id/followers
// @desc    Get user's followers
// @access  Private
router.get('/:id/followers', protect, async (req: any, res: express.Response): Promise<express.Response | void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id)
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

  } catch (error) {
    console.error('Get followers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching followers'
    });
  }
});

// @route   GET /api/users/:id/following
// @desc    Get user's following list
// @access  Private
router.get('/:id/following', protect, async (req: any, res: express.Response): Promise<express.Response | void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id)
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

  } catch (error) {
    console.error('Get following error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching following list'
    });
  }
});

export default router; 