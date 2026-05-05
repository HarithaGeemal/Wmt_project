import Feedback from '../models/Feedback.js';
import logger from '../utils/logger.js';

// ========== PUBLIC ENDPOINTS ==========

// GET /feedbacks/product/:productId — public with filtering
export async function getProductFeedback(req, res) {
    try {
        const { productId } = req.params;
        const { minRating, maxRating, category, sortBy = 'newest', limit = 20, page = 1 } = req.query;

        const skip = (page - 1) * limit;
        const query = { productId, status: 'approved' };

        if (minRating || maxRating) {
            query.rating = {};
            if (minRating) query.rating.$gte = parseInt(minRating);
            if (maxRating) query.rating.$lte = parseInt(maxRating);
        }
        if (category) {
            query.categories = category;
        }

        const sortOptions = {};
        switch (sortBy) {
            case 'newest': sortOptions.createdAt = -1; break;
            case 'oldest': sortOptions.createdAt = 1; break;
            case 'highest': sortOptions.rating = -1; break;
            case 'lowest': sortOptions.rating = 1; break;
            case 'helpful': sortOptions['votes.helpful'] = -1; break;
            default: sortOptions.createdAt = -1;
        }

        const feedbacks = await Feedback.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name email');

        const total = await Feedback.countDocuments(query);

        res.json({
            feedbacks,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        logger.error('Error fetching product feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /feedbacks — auth required, create feedback
export async function createFeedback(req, res) {
    try {
        const { productId, rating, comment, categories = [] } = req.body;

        if (!productId || !rating) {
            return res.status(400).json({ error: 'productId and rating are required' });
        }

        // Check if user already reviewed this product
        const existing = await Feedback.findOne({ userId: req.userId, productId });
        if (existing) {
            return res.status(409).json({ error: 'You have already reviewed this product. Please edit your existing review.' });
        }

        const feedback = await Feedback.create({
            userId: req.userId,
            productId,
            rating: parseInt(rating),
            comment: comment || '',
            categories: categories.filter(c => ['quality', 'delivery', 'service', 'packaging', 'other'].includes(c)),
        });

        const populated = await feedback.populate('userId', 'name email');
        res.status(201).json(populated);
    } catch (error) {
        logger.error('Error creating feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// PUT /feedbacks/:id — auth required, owner only
export async function updateFeedback(req, res) {
    try {
        const { id } = req.params;
        const { rating, comment, categories } = req.body;

        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        if (feedback.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'You can only edit your own feedback' });
        }

        if (rating !== undefined) feedback.rating = parseInt(rating);
        if (comment !== undefined) feedback.comment = comment;
        if (categories !== undefined) {
            feedback.categories = categories.filter(c => ['quality', 'delivery', 'service', 'packaging', 'other'].includes(c));
        }
        await feedback.save();

        const populated = await feedback.populate('userId', 'name email');
        res.json(populated);
    } catch (error) {
        logger.error('Error updating feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// DELETE /feedbacks/:id — auth required, owner only
export async function deleteFeedback(req, res) {
    try {
        const { id } = req.params;

        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        if (feedback.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'You can only delete your own feedback' });
        }

        await Feedback.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ========== HELPFUL VOTES ==========

// POST /feedbacks/:id/helpful — auth required, mark as helpful
export async function markHelpful(req, res) {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        const userIdStr = req.userId.toString();
        const alreadyHelpful = feedback.votes.helpfulUsers.some(uid => uid.toString() === userIdStr);
        const alreadyUnhelpful = feedback.votes.unhelpfulUsers.some(uid => uid.toString() === userIdStr);

        if (alreadyHelpful) {
            feedback.votes.helpful -= 1;
            feedback.votes.helpfulUsers = feedback.votes.helpfulUsers.filter(uid => uid.toString() !== userIdStr);
        } else {
            feedback.votes.helpful += 1;
            feedback.votes.helpfulUsers.push(req.userId);

            // Remove from unhelpful if previously marked
            if (alreadyUnhelpful) {
                feedback.votes.unhelpful -= 1;
                feedback.votes.unhelpfulUsers = feedback.votes.unhelpfulUsers.filter(uid => uid.toString() !== userIdStr);
            }
        }

        await feedback.save();
        res.json({ helpful: feedback.votes.helpful, unhelpful: feedback.votes.unhelpful });
    } catch (error) {
        logger.error('Error marking feedback as helpful:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /feedbacks/:id/unhelpful — auth required, mark as unhelpful
export async function markUnhelpful(req, res) {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        const userIdStr = req.userId.toString();
        const alreadyUnhelpful = feedback.votes.unhelpfulUsers.some(uid => uid.toString() === userIdStr);
        const alreadyHelpful = feedback.votes.helpfulUsers.some(uid => uid.toString() === userIdStr);

        if (alreadyUnhelpful) {
            feedback.votes.unhelpful -= 1;
            feedback.votes.unhelpfulUsers = feedback.votes.unhelpfulUsers.filter(uid => uid.toString() !== userIdStr);
        } else {
            feedback.votes.unhelpful += 1;
            feedback.votes.unhelpfulUsers.push(req.userId);

            // Remove from helpful if previously marked
            if (alreadyHelpful) {
                feedback.votes.helpful -= 1;
                feedback.votes.helpfulUsers = feedback.votes.helpfulUsers.filter(uid => uid.toString() !== userIdStr);
            }
        }

        await feedback.save();
        res.json({ helpful: feedback.votes.helpful, unhelpful: feedback.votes.unhelpful });
    } catch (error) {
        logger.error('Error marking feedback as unhelpful:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ========== USER HISTORY ==========

// GET /feedbacks/user/:userId — get all feedbacks from a specific user
export async function getUserFeedbacks(req, res) {
    try {
        const { userId } = req.params;
        const { limit = 20, page = 1 } = req.query;

        const skip = (page - 1) * limit;

        const feedbacks = await Feedback.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('productId', 'name imageUrl price');

        const total = await Feedback.countDocuments({ userId });

        res.json({
            feedbacks,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        logger.error('Error fetching user feedbacks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ========== ADMIN ENDPOINTS ==========

// GET /feedbacks/all — admin with pagination and filtering
export async function getAllFeedback(req, res) {
    try {
        const { status = 'pending', limit = 20, page = 1, sortBy = 'newest' } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status) query.status = status;

        const sortOptions = {};
        switch (sortBy) {
            case 'newest': sortOptions.createdAt = -1; break;
            case 'oldest': sortOptions.createdAt = 1; break;
            case 'helpful': sortOptions['votes.helpful'] = -1; break;
            default: sortOptions.createdAt = -1;
        }

        const feedbacks = await Feedback.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name email')
            .populate('productId', 'name imageUrl price')
            .populate('reviewedBy', 'name email')
            .populate('adminResponses.respondedBy', 'name email');

        const total = await Feedback.countDocuments(query);

        res.json({
            feedbacks,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        logger.error('Error fetching all feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// PUT /feedbacks/:id/moderate — admin, approve/reject feedback
export async function moderateFeedback(req, res) {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be approved or rejected' });
        }

        const feedback = await Feedback.findByIdAndUpdate(
            id,
            {
                status,
                adminNotes: adminNotes || '',
                reviewedBy: req.userId,
                reviewedAt: new Date(),
            },
            { new: true }
        )
            .populate('userId', 'name email')
            .populate('productId', 'name imageUrl price')
            .populate('reviewedBy', 'name email');

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        res.json(feedback);
    } catch (error) {
        logger.error('Error moderating feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /feedbacks/:id/respond — admin, add response to feedback
export async function respondToFeedback(req, res) {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        feedback.adminResponses.push({
            respondedBy: req.userId,
            message: message.trim(),
            respondedAt: new Date(),
        });

        await feedback.save();

        const populated = await feedback
            .populate('userId', 'name email')
            .populate('adminResponses.respondedBy', 'name email');

        res.json(populated);
    } catch (error) {
        logger.error('Error responding to feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ========== ANALYTICS ==========

// GET /feedbacks/analytics/product/:productId — analytics for a product
export async function getProductAnalytics(req, res) {
    try {
        const { productId } = req.params;

        const feedbacks = await Feedback.find({ productId, status: 'approved' });

        if (feedbacks.length === 0) {
            return res.json({
                totalFeedbacks: 0,
                averageRating: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                totalHelpfulVotes: 0,
                categoryBreakdown: {},
            });
        }

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const categoryBreakdown = {};
        let totalRating = 0;
        let totalHelpful = 0;

        feedbacks.forEach((fb) => {
            ratingDistribution[fb.rating]++;
            totalRating += fb.rating;
            totalHelpful += fb.votes.helpful;

            fb.categories.forEach((cat) => {
                categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
            });
        });

        const averageRating = (totalRating / feedbacks.length).toFixed(2);

        res.json({
            totalFeedbacks: feedbacks.length,
            averageRating: parseFloat(averageRating),
            ratingDistribution,
            totalHelpfulVotes: totalHelpful,
            categoryBreakdown,
        });
    } catch (error) {
        logger.error('Error fetching product analytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /feedbacks/analytics/global — admin, global analytics
export async function getGlobalAnalytics(req, res) {
    try {
        const feedbacks = await Feedback.find({ status: 'approved' });

        if (feedbacks.length === 0) {
            return res.json({
                totalFeedbacks: 0,
                averageRating: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                totalHelpfulVotes: 0,
                totalResponses: 0,
                categoryBreakdown: {},
            });
        }

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const categoryBreakdown = {};
        let totalRating = 0;
        let totalHelpful = 0;
        let totalResponses = 0;

        feedbacks.forEach((fb) => {
            ratingDistribution[fb.rating]++;
            totalRating += fb.rating;
            totalHelpful += fb.votes.helpful;
            totalResponses += fb.adminResponses.length;

            fb.categories.forEach((cat) => {
                categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
            });
        });

        const averageRating = (totalRating / feedbacks.length).toFixed(2);

        res.json({
            totalFeedbacks: feedbacks.length,
            averageRating: parseFloat(averageRating),
            ratingDistribution,
            totalHelpfulVotes: totalHelpful,
            totalResponses,
            categoryBreakdown,
        });
    } catch (error) {
        logger.error('Error fetching global analytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ========== SEARCH ==========

// GET /feedbacks/search — search feedbacks by comment or product
export async function searchFeedbacks(req, res) {
    try {
        const { q, limit = 20, page = 1, status = 'approved' } = req.query;

        if (!q || q.trim() === '') {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const skip = (page - 1) * limit;
        const query = {
            status,
            $or: [
                { comment: { $regex: q, $options: 'i' } },
            ],
        };

        const feedbacks = await Feedback.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name email')
            .populate('productId', 'name imageUrl price');

        const total = await Feedback.countDocuments(query);

        res.json({
            feedbacks,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        logger.error('Error searching feedbacks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
