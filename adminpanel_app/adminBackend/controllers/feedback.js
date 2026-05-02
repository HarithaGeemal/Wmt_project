import Feedback from '../models/Feedback.js';
import logger from '../utils/logger.js';

// GET /feedbacks/product/:productId — public
export async function getProductFeedback(req, res) {
    try {
        const { productId } = req.params;
        const feedbacks = await Feedback.find({ productId })
            .sort({ createdAt: -1 })
            .populate('userId', 'name email');
        res.json(feedbacks);
    } catch (error) {
        logger.error('Error fetching product feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST /feedbacks — auth required
export async function createFeedback(req, res) {
    try {
        const { productId, rating, comment } = req.body;

        // Check if user already reviewed this product
        const existing = await Feedback.findOne({ userId: req.userId, productId });
        if (existing) {
            return res.status(409).json({ error: 'You have already reviewed this product. Please edit your existing review.' });
        }

        const feedback = await Feedback.create({
            userId: req.userId,
            productId,
            rating,
            comment: comment || '',
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
        const { rating, comment } = req.body;

        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        if (feedback.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'You can only edit your own feedback' });
        }

        if (rating !== undefined) feedback.rating = rating;
        if (comment !== undefined) feedback.comment = comment;
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

// GET /feedbacks/all — admin, returns all feedbacks
export async function getAllFeedback(req, res) {
    try {
        const feedbacks = await Feedback.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .populate('productId', 'name imageUrl price');
        res.json(feedbacks);
    } catch (error) {
        logger.error('Error fetching all feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
