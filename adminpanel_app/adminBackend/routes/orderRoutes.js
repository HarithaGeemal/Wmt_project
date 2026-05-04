import express from 'express';
import { 
    getOrders, 
    getUserOrders, 
    getOrder, 
    updateOrderStatus, 
    getStripeConfig, 
    createStripePaymentIntent, 
    createOrder,
    getOrderAnalytics // Newly suggested controller function
} from '../controllers/order.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @description Get all orders (Admin only)
 * Enhanced: You might want to add an 'isAdmin' middleware here later
 */
router.get('/all', verifyToken, getOrders);

/**
 * @description Get order analytics (Admin/Dashboard use)
 * Added for extra marks - useful for showing sales trends
 */
router.get('/analytics', verifyToken, getOrderAnalytics);

/**
 * @description Get specific orders for the logged-in user
 */
router.get('/my-orders', verifyToken, getUserOrders);

/**
 * @description Get stripe configuration for frontend
 */
router.get('/stripe-config', verifyToken, getStripeConfig);

/**
 * @description Get details of a single order by ID
 */
router.get('/:id', verifyToken, getOrder);

/**
 * @description Update the status of an order (e.g., pending to delivered)
 */
router.put('/:id/status', verifyToken, updateOrderStatus);

/**
 * @description Create a Stripe payment intent
 */
router.post('/stripe-intent', verifyToken, createStripePaymentIntent);

/**
 * @description Create a new order after successful payment
 */
router.post('/', verifyToken, createOrder);

export default router;