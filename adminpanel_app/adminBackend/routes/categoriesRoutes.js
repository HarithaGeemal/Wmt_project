import express from 'express';
import validate from '../middlewares/validation.js';
import upload from '../middlewares/upload.js';
import z from 'zod';
import { getCategories, getProductsByCategory, createCategory, updateCategory, deleteCategory } from '../controllers/categories.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Log every incoming request to this router
router.use((req, res, next) => {
    logger.info(`[Categories Router] ${req.method} ${req.url}`);
    next();
});

const categorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

router.get('/', getCategories);
router.get('/:id/products', getProductsByCategory);
// upload.single('image') parses the multipart form, then validate checks body fields
router.post('/', upload.single('image'), validate(categorySchema), createCategory);
router.put('/:id', upload.single('image'), validate(categorySchema), updateCategory);
router.delete('/:id', deleteCategory);

export default router;

