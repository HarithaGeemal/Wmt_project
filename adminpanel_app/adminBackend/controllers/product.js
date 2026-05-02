import Product from '../models/Product.js';
import Category from '../models/Category.js';
import logger from '../utils/logger.js';
import { uploadBuffer } from '../utils/cloudinary.js';

async function getProducts(req, res) {
    try {
        const { categoryId, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const where = categoryId ? { categoryId: categoryId } : {};
        const products = await Product.find(where)
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));
        res.json(products);
    } catch (error) {
        logger.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getProduct(req, res) {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        logger.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function createProduct(req, res) {
    try {
        const { name, description, price, categoryId } = req.body;
        
        let imageUrl = '';
        if (req.file) {
            imageUrl = await uploadBuffer(req.file.buffer, 'food_delivery/products');
        }

        const product = await Product.create({
            name,
            description,
            price: parseFloat(price) || 0,
            imageUrl,
            categoryId
        });
        res.status(201).json(product);
    } catch (error) {
        logger.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const { name, description, price, categoryId } = req.body;
        
        let updateData = { name, description, price: parseFloat(price) };
        if (categoryId) {
            updateData.categoryId = categoryId;
        }
        if (req.file) {
            updateData.imageUrl = await uploadBuffer(req.file.buffer, 'food_delivery/products');
        }

        const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
        res.json(product);
    } catch (error) {
        logger.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export{ getProducts, getProduct, createProduct, updateProduct, deleteProduct };
