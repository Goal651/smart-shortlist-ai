import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/login', AuthController.login);
router.get('/me', authenticateToken, AuthController.getMe);
router.post('/seed-owner', AuthController.seedOwner);

export default router;
