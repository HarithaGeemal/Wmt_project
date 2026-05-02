import Address from '../models/Address.js';
import logger from '../utils/logger.js';

export async function getAddresses(req, res) {
    try {
        const addresses = await Address.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(addresses);
    } catch (error) {
        logger.error('Error fetching addresses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function addAddress(req, res) {
    try {
        const { type, name, mobile, address: addressText, city, province, zipCode, isDefault } = req.body;
        
        // If this is set as default, unset others first
        if (isDefault) {
             await Address.updateMany({ userId: req.userId }, { isDefault: false });
        }

        const address = await Address.create({
            userId: req.userId,
            type,
            name,
            mobile,
            address: addressText,
            city,
            province,
            zipCode,
            isDefault
        });

        // If it's the first address, auto-set as default
        const count = await Address.countDocuments({ userId: req.userId });
        if (count === 1 && !isDefault) {
            address.isDefault = true;
            await address.save();
        }

        res.status(201).json(address);
    } catch (error) {
        logger.error('Error adding address:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateAddress(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.isDefault) {
            await Address.updateMany({ userId: req.userId }, { isDefault: false });
        }

        const address = await Address.findOneAndUpdate(
            { _id: id, userId: req.userId },
            updateData,
            { new: true }
        );

        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }

        res.json(address);
    } catch (error) {
        logger.error('Error updating address:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteAddress(req, res) {
    try {
        const { id } = req.params;
        const address = await Address.findOneAndDelete({ _id: id, userId: req.userId });
        if (!address) {
             return res.status(404).json({ error: 'Address not found' });
        }
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        logger.error('Error deleting address:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
