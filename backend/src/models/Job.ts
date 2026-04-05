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
    skills: [{ type: String }],
    minExperience: { type: Number, default: 0 },
    education: { type: String }
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: "RWF" }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IJob>('Job', JobSchema);
