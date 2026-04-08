import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Find user and verify they exist and are active
    const user = await User.findOne({ _id: decoded.userId, isActive: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Owner access required' });
  }

  next();
};

export const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '24h' });
};
