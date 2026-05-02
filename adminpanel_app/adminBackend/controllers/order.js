import Order from '../models/Order.js';
import Stripe from 'stripe';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { sendEmailWithRetry } from '../utils/emailQueue.js';

const stripe = new Stripe(process.env.STRIPE_Secret_key);

export const getOrders = async (req, res) => {
    const { page = 1, limit = 10, userId } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    try {
        const query = userId ? { userId } : {};
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'name email phone')
            .populate('addressId');

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId; // From authMiddleware
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const orders = await Order.find({ userId: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('addressId');

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id)
            .populate('userId', 'name email phone')
            .populate('addressId');
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
            .populate('userId', 'name email phone')
            .populate('addressId');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createStripePaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'usd' } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
        });
        res.json({
            clientSecret: paymentIntent.client_secret,
            publishableKey: process.env.STRIPE_Publishable_key
        });
    } catch (error) {
        console.error('Error creating stripe payment intent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getStripeConfig = (req, res) => {
    res.json({ publishableKey: process.env.STRIPE_Publishable_key });
};

export const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, addressId, paymentMethod, paymentId } = req.body;

        const newOrder = new Order({
            userId: req.userId,
            items,
            totalAmount,
            addressId,
            paymentMethod,
            paymentId,
            status: 'pending'   // always starts pending so a driver can accept it
        });

        await newOrder.save();

        const user = await User.findById(req.userId);

        if (user && user.email) {
            const pdfDoc = new PDFDocument();
            let buffers = [];

            pdfDoc.on("data", buffers.push.bind(buffers));
            pdfDoc.on("end", async () => {
                try {
                    const pdfBuffer = Buffer.concat(buffers);

                    // Configure Nodemailer 
                    // Using shared transport from emailQueue.js

                    // Email HTML template
                    const htmlContent = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #4CAF50;">Order Confirmation</h2>
                            <p>Hi ${user.name || 'Customer'},</p>
                            <p>Thank you for your order! Your order has been successfully placed and is now <strong>${newOrder.status}</strong>.</p>
                            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                                <tr style="background-color: #f2f2f2;">
                                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Order ID</th>
                                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Total Amount</th>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">${newOrder._id}</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">Rs. ${totalAmount}</td>
                                </tr>
                            </table>
                            <br/>
                            <p>Please find attached your detailed invoice PDF.</p>
                            <p>Thank you for ordering with us!</p>
                        </div>
                    `;

                    await sendEmailWithRetry({
                        from: `${process.env.EMAIL_FROM_NAME || 'BiteHub'} <${process.env.EMAIL_USER}>`,
                        to: user.email,
                        subject: 'Your Food Delivery Order Invoice',
                        html: htmlContent,
                        attachments: [
                            {
                                filename: `Invoice_${newOrder._id}.pdf`,
                                content: pdfBuffer,
                                contentType: 'application/pdf'
                            }
                        ]
                    });
                    
                    console.log(`Invoice email sent to ${user.email} successfully.`);
                } catch (emailError) {
                    console.error('Error sending invoice email:', emailError);
                }
            });

            // Write PDF Document details
            pdfDoc.fontSize(22).text('ORDER INVOICE', { align: 'center' });
            pdfDoc.moveDown();
            pdfDoc.fontSize(14).text(`Order ID: ${newOrder._id}`);
            pdfDoc.text(`Date: ${new Date().toLocaleDateString()}`);
            pdfDoc.text(`Customer Name: ${user.name || 'Customer'}`);
            pdfDoc.text(`Customer Email: ${user.email}`);
            pdfDoc.text(`Payment Method: ${paymentMethod.toUpperCase()}`);
            pdfDoc.moveDown();
            
            // Draw Items
            pdfDoc.fontSize(16).text('Item Details:', { underline: true });
            pdfDoc.moveDown(0.5);
            if (items && items.length > 0) {
                items.forEach((item, index) => {
                    pdfDoc.fontSize(12).text(`${index + 1}. ${item.name} (x${item.quantity}) - Rs. ${item.price * item.quantity}`);
                });
            } else {
                pdfDoc.fontSize(12).text('No items found.');
            }
            
            pdfDoc.moveDown();
            pdfDoc.fontSize(16).text(`Total Amount: Rs. ${totalAmount}`, { bold: true });
            
            pdfDoc.end(); // Finalize PDF to trigger 'end' event
        }

        res.status(201).json(newOrder);

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
