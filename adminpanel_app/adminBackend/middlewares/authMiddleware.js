import jwt from 'jsonwebtoken';
import logger from "../utils/logger.js";

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
            next();
        } catch (error) {
            logger.error('Token verification failed:', error.message);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    } catch (error) {
        logger.error('Error in auth middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
