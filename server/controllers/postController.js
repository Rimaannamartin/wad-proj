const Post = require('../models/post');
const asyncHandler = require('express-async-handler');

// @desc    Create new post
// @route   POST /api/v1/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  console.log('Incoming createPost body:', req.body);
  const { title, content, tags, latitude, longitude } = req.body;

  let normalizedTags = [];
  if (Array.isArray(tags)) {
    normalizedTags = tags.map(tag => tag.trim()).filter(Boolean);
  } else if (typeof tags === 'string') {
    normalizedTags = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  // Basic validation
  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Title and content are required'
    });
  }

  // Create post
  const latNum = latitude !== undefined && latitude !== null ? parseFloat(latitude) : null;
  const lngNum = longitude !== undefined && longitude !== null ? parseFloat(longitude) : null;
  const hasValidLocation =
    Number.isFinite(latNum) && Number.isFinite(lngNum);

  const post = await Post.create({
    title,
    content,
    author: req.user._id,
    imageUrl: req.file ? `/uploads/images/${req.file.filename}` : null,
    tags: normalizedTags,
    location: hasValidLocation
      ? {
          type: 'Point',
          coordinates: [lngNum, latNum]
        }
      : undefined
  });

  // Populate author details
  await post.populate('author', 'username profilePicture firstName lastName');

  res.status(201).json({
    success: true,
    data: post,
    message: 'Post created successfully'
  });
});

// @desc    Get all posts for explore page with pagination
// @route   GET /api/v1/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query for filtering
  let query = {};
  
  // Filter by tags if provided
  if (req.query.tags) {
    const tags = req.query.tags.split(',').map(tag => tag.trim());
    query.tags = { $in: tags };
  }

  // Filter by author if provided
  if (req.query.author) {
    query.author = req.query.author;
  }

  // Search in title and content
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { content: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Get posts with pagination
  const posts = await Post.find(query)
    .populate('author', 'username profilePicture firstName lastName')
    .populate('likes', 'username profilePicture firstName lastName')
    .populate('comments.user', 'username profilePicture firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Post.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: posts,
    pagination: {
      current: page,
      total: totalPages,
      count: posts.length,
      totalItems: total
    }
  });
});

// @desc    Get single post by ID
// @route   GET /api/v1/posts/:id
// @access  Public
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username profilePicture firstName lastName')
    .populate('likes', 'username profilePicture firstName lastName')
    .populate('comments.user', 'username profilePicture firstName lastName');

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  res.json({
    success: true,
    data: post
  });
});

// @desc    Update post
// @route   PUT /api/v1/posts/:id
// @access  Private (Author only)
const updatePost = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id);

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
      message: 'Not authorized to update this post'
    });
  }

  const { title, content, tags } = req.body;

  // Update fields
  if (title) post.title = title;
  if (content) post.content = content;
  if (tags) post.tags = tags.split(',').map(tag => tag.trim());
  if (req.file) post.imageUrl = `/uploads/images/${req.file.filename}`;

  await post.save();

  // Populate author details
  await post.populate('author', 'username profilePicture firstName lastName');

  res.json({
    success: true,
    data: post,
    message: 'Post updated successfully'
  });
});

// @desc    Delete post
// @route   DELETE /api/v1/posts/:id
// @access  Private (Author only)
const deletePost = asyncHandler(async (req, res) => {
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
      message: 'Not authorized to delete this post'
    });
  }

  await Post.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Post deleted successfully'
  });
});

// @desc    Like/unlike post
// @route   POST /api/v1/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const userId = req.user._id;
  const hasLiked = post.likes.includes(userId);

  if (hasLiked) {
    // Unlike the post
    post.likes = post.likes.filter(like => like.toString() !== userId.toString());
    await post.save();
    
    res.json({
      success: true,
      data: { liked: false, likeCount: post.likes.length },
      message: 'Post unliked successfully'
    });
  } else {
    // Like the post
    post.likes.push(userId);
    await post.save();
    
    res.json({
      success: true,
      data: { liked: true, likeCount: post.likes.length },
      message: 'Post liked successfully'
    });
  }
});

// @desc    Add comment to post
// @route   POST /api/v1/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      message: 'Comment content is required'
    });
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Add comment
  post.comments.push({
    user: req.user._id,
    content
  });

  await post.save();

  // Populate the new comment's user details
  await post.populate('comments.user', 'username profilePicture firstName lastName');

  const newComment = post.comments[post.comments.length - 1];

  res.status(201).json({
    success: true,
    data: newComment,
    message: 'Comment added successfully'
  });
});

// @desc    Delete comment
// @route   DELETE /api/v1/posts/:postId/comments/:commentId
// @access  Private (Comment author or post author)
const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const comment = post.comments.id(commentId);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  // Check if user is comment author or post author
  const isCommentAuthor = comment.user.toString() === req.user._id.toString();
  const isPostAuthor = post.author.toString() === req.user._id.toString();

  if (!isCommentAuthor && !isPostAuthor) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this comment'
    });
  }

  // Remove comment
  post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);
  await post.save();

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
});

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment
};