import Category from '../models/Category.js';
import Product from '../models/Product.js';
import logger from '../utils/logger.js';
import { uploadBuffer } from '../utils/cloudinary.js';
async function getCategories(req, res) {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const categories = await Category.find()
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        // Emulate Prisma's `include: { products: true }`
        const categoriesWithProducts = await Promise.all(
            categories.map(async (cat) => {
                const products = await Product.find({ categoryId: cat._id });
                return { ...cat.toJSON(), products };
            })
        );
        res.json(categoriesWithProducts);
    } catch (error) {
        logger.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getProductsByCategory(req, res) {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const products = await Product.find({ categoryId: id })
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));
        res.status(201).json(products);
    } catch (error) {
        logger.error('Error fetching products by category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function createCategory(req, res) {
    try {
        const { name } = req.body;
        logger.info(`Creating category: name="${name}"`);

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        // Upload image to Cloudinary if a file was attached
        let imageUrl = '';
        if (req.file) {
            logger.info(`Uploading image to Cloudinary for category "${name}"`);
            imageUrl = await uploadBuffer(req.file.buffer, 'food_delivery/categories');
            logger.info(`Image uploaded: ${imageUrl}`);
        }

        const category = await Category.create({ name, imageUrl });

        logger.info(`Category created successfully: id=${category.id}, name="${category.name}"`);
        res.status(201).json(category);
    } catch (error) {
        logger.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // If a new image file was provided, upload it; otherwise keep existing
        let updateData = { name };
        if (req.file) {
            const imageUrl = await uploadBuffer(req.file.buffer, 'food_delivery/categories');
            updateData.imageUrl = imageUrl;
        }

        const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
        res.json(category);
    } catch (error) {
        logger.error('Error updating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        await Product.deleteMany({ categoryId: id });
        await Category.findByIdAndDelete(id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        logger.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export { getCategories, getProductsByCategory, createCategory, updateCategory, deleteCategory };