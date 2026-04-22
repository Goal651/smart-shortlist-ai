import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken } from '../middleware/auth';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(user._id.toString());

      // Return user info and token
      res.json({
        message: "Login successful",
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          company: user.company,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Login failed" });
    }
  }

  static async getMe(req: Request, res: Response) {
    const user = (req as any).user;
    res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  }

  static async seedOwner(req: Request, res: Response) {
    try {
      // Check if owner already exists
      const existingOwner = await User.findOne({ role: 'owner' });
      if (existingOwner) {
        return res.status(400).json({ 
          error: "Owner user already exists",
          owner: {
            email: existingOwner.email,
            name: existingOwner.name,
            role: existingOwner.role
          }
        });
      }

      // Create owner user
      const ownerEmail = process.env.OWNER_EMAIL || 'owner@umurava.ai';
      const ownerPassword = process.env.OWNER_PASSWORD || 'Umurava2024!';
      const ownerName = process.env.OWNER_NAME || 'Umurava Owner';

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(ownerPassword, saltRounds);

      // Create owner
      const owner = new User({
        email: ownerEmail,
        password: hashedPassword,
        name: ownerName,
        role: 'owner',
        company: 'Umurava AI',
        isActive: true
      });

      await owner.save();
      
      console.log('Owner user created successfully!');
      console.log('Email:', ownerEmail);

      res.status(201).json({ 
        message: "Owner user created successfully",
        owner: {
          email: owner.email,
          name: owner.name,
          role: owner.role,
          company: owner.company
        }
      });

    } catch (error) {
      console.error('Error seeding owner:', error);
      res.status(500).json({ error: "Failed to create owner user" });
    }
  }
}
