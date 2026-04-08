import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/umurava-ai';

async function seedOwner() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if owner already exists
    const existingOwner = await User.findOne({ role: 'owner' });
    if (existingOwner) {
      console.log('Owner user already exists:', existingOwner.email);
      await mongoose.disconnect();
      return;
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
    console.log('Password:', ownerPassword);
    console.log('Name:', ownerName);
    console.log('Role: owner');

  } catch (error) {
    console.error('Error seeding owner:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seeder
if (require.main === module) {
  seedOwner();
}

export default seedOwner;
