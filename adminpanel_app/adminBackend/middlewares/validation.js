import logger from '../utils/logger.js';

function validate(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            // Zod v4 uses error.issues; Zod v3 used error.errors — support both
            const issues = error.issues || error.errors || [];
            const message = issues.map(e => e.message).join(', ');
            logger.warn(`Validation failed: ${message} | body: ${JSON.stringify(req.body)}`);
            res.status(400).json({ error: message });
        }
    };
}

export default validate;