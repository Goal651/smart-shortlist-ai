import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  requirements: {
    skills: string[];      // ["React", "Node.js", "TypeScript"]
    minExperience: number; // e.g., 3 (years)
    education: string;     // "Bachelor's in CS"
  };
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  owner: string;           // Owner user ID
  isActive: boolean;       // Public visibility
  createdAt: Date;
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, default: "Remote" },
  type: { 
    type: String, 
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote'], 
    default: 'Full-time' 
  },
  requirements: {
    skills: { type: [String], default: [] },
    minExperience: { type: Number, default: 0 },
    education: { type: String, default: "" }
  },
  salaryRange: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: "RWF" }
  },
  owner: { type: String }, // Owner user ID
  isActive: { type: Boolean, default: true }, // Public visibility
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IJob>('Job', JobSchema);
