import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * requireDriver — must be used AFTER verifyToken.
 * Fetches the user from DB and checks role === 'driver'.
 */
export const requireDriver = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        if (user.role !== 'driver') {
            return res.status(403).json({ error: 'Access denied: driver role required' });
        }
        req.userRole = user.role;
        next();
    } catch (error) {
        logger.error('Error in requireDriver middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
