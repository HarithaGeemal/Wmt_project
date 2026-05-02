
import User from "../models/User.js";
import logger from "../utils/logger.js";
import { sendEmailWithRetry } from "../utils/emailQueue.js";

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
async function signUp(req, res) {
    try {
        const { email, password, password_confirm, phone } = req.body;
        if (password !== password_confirm) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            phone,
            password: hashedPassword
        });

        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Welcome to BiteHub 🎉',
            html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <h2>Welcome to BiteHub 🍔🚀</h2>

                                <p>Hi there,</p>

                                <p>
                                    We’re excited to have you on board! You can now explore delicious meals,
                                    place orders easily, and enjoy fast delivery right to your doorstep.
                                </p>

                                <p>
                                    If you ever need help, our support team is always here for you.
                                </p>

                                <p><b>Happy ordering!</b></p>

                                <br/>

                                <p>Best regards,<br/>
                                <b>The BiteHub Team</b></p>
                            </div>
                        `
        };

        sendEmailWithRetry(mailOptions).catch(error => {
            logger.error('Error sending Welcome email:', error);
        })

        res.status(201).json({ user, accessToken });
    } catch (error) {
        logger.error('Error signing up:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ user, accessToken });
    } catch (error) {
        logger.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export async function getMe(req, res) {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        logger.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getUsers(req, res) {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        logger.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { role, isActive } = req.body;
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (role !== undefined) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();
        res.json(user);
    } catch (error) {
        logger.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export { signUp, login };
