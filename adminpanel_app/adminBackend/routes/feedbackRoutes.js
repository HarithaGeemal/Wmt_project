import express from 'express';
import { getProductFeedback, createFeedback, updateFeedback, deleteFeedback, getAllFeedback } from '../controllers/feedback.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Admin: get all feedbacks
router.get('/all', getAllFeedback);

// Public: get feedbacks for a product
router.get('/product/:productId', getProductFeedback);

// Auth required: CRUD own feedback
router.post('/', verifyToken, createFeedback);
router.put('/:id', verifyToken, updateFeedback);
router.delete('/:id', verifyToken, deleteFeedback);

export default router;
