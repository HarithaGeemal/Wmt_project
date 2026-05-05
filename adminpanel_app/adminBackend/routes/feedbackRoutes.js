import express from 'express';
import {
    // Public endpoints
    getProductFeedback,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    getUserFeedbacks,
    // Helpful votes
    markHelpful,
    markUnhelpful,
    // Search
    searchFeedbacks,
    // Admin endpoints
    getAllFeedback,
    moderateFeedback,
    respondToFeedback,
    // Analytics
    getProductAnalytics,
    getGlobalAnalytics,
} from '../controllers/feedback.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ========== PUBLIC ENDPOINTS ==========
// Get feedbacks for a product with filtering and pagination
router.get('/product/:productId', getProductFeedback);

// Search feedbacks
router.get('/search', searchFeedbacks);

// Get all feedbacks from a specific user
router.get('/user/:userId', getUserFeedbacks);

// Create feedback (auth required)
router.post('/', verifyToken, createFeedback);

// Update own feedback (auth required)
router.put('/:id', verifyToken, updateFeedback);

// Delete own feedback (auth required)
router.delete('/:id', verifyToken, deleteFeedback);

// ========== HELPFUL VOTES ==========
// Mark feedback as helpful (auth required)
router.post('/:id/helpful', verifyToken, markHelpful);

// Mark feedback as unhelpful (auth required)
router.post('/:id/unhelpful', verifyToken, markUnhelpful);

// ========== ANALYTICS ==========
// Get analytics for a specific product
router.get('/analytics/product/:productId', getProductAnalytics);

// Get global analytics (admin)
router.get('/analytics/global', getGlobalAnalytics);

// ========== ADMIN ENDPOINTS ==========
// Get all feedbacks with pagination and filtering (admin)
router.get('/all', getAllFeedback);

// Moderate feedback - approve/reject (admin)
router.put('/:id/moderate', verifyToken, moderateFeedback);

// Respond to feedback (admin)
router.post('/:id/respond', verifyToken, respondToFeedback);

export default router;
