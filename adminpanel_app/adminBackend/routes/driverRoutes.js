import express from 'express';
import { getAvailableOrders, acceptOrder, getMyDeliveries, startDelivery, markDelivered } from '../controllers/driverController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireDriver } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All driver routes require a valid token AND driver role
router.use(verifyToken, requireDriver);

// Get all available (pending, unclaimed) orders
router.get('/available', getAvailableOrders);

// Accept an order (atomic claim)
router.put('/accept/:id', acceptOrder);

router.get('/my-deliveries', getMyDeliveries);

// Start delivery (transition from accepted to delivering)
router.put('/start/:id', startDelivery);

// Mark an active delivery as completed
router.put('/complete/:id', markDelivered);

export default router;
