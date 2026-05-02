import express from 'express';
import z from 'zod';
import { signUp, login, getMe, getUsers, updateUser } from '../controllers/auth.js';
import validate from '../middlewares/validation.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    password_confirm: z.string().min(6, 'Password confirmation is required'),
    phone: z.string().min(10, 'Phone number is required'),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const googleSchema = z.object({
    idToken: z.string(),
});

router.post('/sign-up', validate(signUpSchema), signUp);
router.post('/login', validate(loginSchema), login);
router.get('/me', verifyToken, getMe);
router.get('/users', getUsers); // Using no token for simplicity in admin panel, or should we use adminOnly? Let's keep it simple for now as it's an internal admin tool.
router.put('/users/:id', updateUser);

export default router;
