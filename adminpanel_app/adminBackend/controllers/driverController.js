import Order from '../models/Order.js';
import logger from '../utils/logger.js';

/**
 * GET /api/v1/driver/available
 * Returns all pending orders that have not been claimed by any driver yet.
 */
export const getAvailableOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'ready' })
            .sort({ createdAt: -1 })
            .populate('userId', 'name email phone')
            .populate('addressId');

        res.status(200).json(orders);
    } catch (error) {
        logger.error('Error fetching available orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * PUT /api/v1/driver/accept/:id
 * Atomically claims an order for this driver.
 * Returns 409 if another driver already accepted it.
 */
export const acceptOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const driverId = req.userId;

        // Atomic update — only succeeds if the order is still 'ready' and unclaimed
        const order = await Order.findOneAndUpdate(
            { _id: id, status: 'ready', driverId: null },
            { driverId, status: 'accepted' },
            { new: true }
        )
            .populate('userId', 'name email phone')
            .populate('addressId');

        if (!order) {
            // Either order doesn't exist or was already claimed
            return res.status(409).json({
                error: 'Order is no longer available. It may have already been accepted by another driver.'
            });
        }

        res.status(200).json(order);
    } catch (error) {
        logger.error('Error accepting order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * GET /api/v1/driver/my-deliveries
 * Returns all orders assigned to this driver, sorted newest first.
 */
export const getMyDeliveries = async (req, res) => {
    try {
        const driverId = req.userId;

        const orders = await Order.find({ driverId })
            .sort({ updatedAt: -1 })
            .populate('userId', 'name email phone')
            .populate('addressId');

        res.status(200).json(orders);
    } catch (error) {
        logger.error('Error fetching driver deliveries:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * PUT /api/v1/driver/start/:id
 * Driver marks an accepted order as currently being delivered.
 */
export const startDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const driverId = req.userId;

        const order = await Order.findOneAndUpdate(
            { _id: id, driverId, status: 'accepted' },
            { status: 'delivering' },
            { new: true }
        )
            .populate('userId', 'name email phone')
            .populate('addressId');

        if (!order) {
            return res.status(400).json({
                error: 'Order could not be started. It may not be in accepted status or does not belong to you.'
            });
        }

        res.status(200).json(order);
    } catch (error) {
        logger.error('Error starting delivery:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * PUT /api/v1/driver/complete/:id
 * Driver marks an order they are currently delivering as completed.
 * Only succeeds if the order status is 'delivering' and belongs to this driver.
 */
export const markDelivered = async (req, res) => {
    try {
        const { id } = req.params;
        const driverId = req.userId;

        const order = await Order.findOneAndUpdate(
            { _id: id, driverId, status: 'delivering' },
            { status: 'completed' },
            { new: true }
        )
            .populate('userId', 'name email phone')
            .populate('addressId');

        if (!order) {
            return res.status(400).json({
                error: 'Order could not be completed. It may not be in delivering status or does not belong to you.'
            });
        }

        res.status(200).json(order);
    } catch (error) {
        logger.error('Error completing order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
