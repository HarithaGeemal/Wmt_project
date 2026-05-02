import express from 'express';
import { getOrders, getUserOrders, getOrder, updateOrderStatus, getStripeConfig, createStripePaymentIntent, createOrder } from '../controllers/order.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all orders (for admin)
router.get('/all', getOrders);

// User specific orders
router.get('/', verifyToken, getUserOrders);

// Get stripe config
router.get('/stripe-config', getStripeConfig);

// Get single order
router.get('/:id', verifyToken, getOrder);

// Update order status
router.put('/:id/status', updateOrderStatus);

// Create stripe intent
router.post('/stripe-intent', verifyToken, createStripePaymentIntent);

// Create new order
router.post('/', verifyToken, createOrder);

export default router;
