import validate from '../middlewares/validation.js';
import upload from '../middlewares/upload.js';
import { createProduct, getProducts, getProduct, updateProduct, deleteProduct } from '../controllers/product.js';
import z from 'zod';
import express from 'express';

const router = express.Router();

const productSchema = z.object({
    categoryId: z.string(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    // FormData sends values as strings, convert to number
    price: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= 0, {
        message: 'Price must be a positive number'
    }),
});

const updateProductSchema = z.object({
    categoryId: z.string().optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= 0, {
        message: 'Price must be a positive number'
    }).optional(),
});

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', upload.single('image'), validate(productSchema), createProduct);
router.put('/:id', upload.single('image'), validate(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

export default router;