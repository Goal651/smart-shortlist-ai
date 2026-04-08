import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  resumeFile: {
    filename: string;
    originalName: string;
    buffer: Buffer;
    mimeType: string;
    size: number;
  };
  status: 'Applied' | 'Screening' | 'Shortlisted' | 'Rejected';
  submittedAt: Date;
  // These fields populated after screening
  candidateId?: mongoose.Types.ObjectId;
  score?: number;
  summary?: string;
  topSkills?: string[];
  gaps?: string[];
  extractedText?: string;
  screenedAt?: Date;
  emailSent?: boolean;
  emailSentAt?: Date;
}

const ApplicationSchema: Schema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  resumeFile: {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    buffer: { type: Buffer, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }
  },
  status: { 
    type: String, 
    enum: ['Applied', 'Screening', 'Shortlisted', 'Rejected'], 
    default: 'Applied' 
  },
  submittedAt: { type: Date, default: Date.now },
  // Screening results
  candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate' },
  score: { type: Number },
  summary: { type: String },
  topSkills: { type: [String] },
  gaps: { type: [String] },
  extractedText: { type: String },
  screenedAt: { type: Date },
  // Email tracking
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for better query performance
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ email: 1 });
ApplicationSchema.index({ submittedAt: -1 });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
