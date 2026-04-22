import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  candidateId?: mongoose.Types.ObjectId;
  
  // Applicant basic info from form
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  
  // Resume file storage
  resumeFile: {
    filename: string;
    originalName: string;
    buffer: Buffer;
    mimeType: string;
    size: number;
  };
  
  // Application status
  status: 'Applied' | 'Screening' | 'Shortlisted' | 'Rejected';
  
  // Screening results (populated after AI analysis)
  screeningResult?: {
    score: number;
    summary: string;
    topSkills: string[];
    gaps: string[];
    reasoning?: string;
  };
  
  // Raw extracted text from resume
  extractedText: string;
  
  // Email communication tracking
  emailSent: boolean;
  emailSentAt?: Date;
  
  // Timestamps
  submittedAt: Date;
  screenedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScreeningResultSchema = new Schema({
  score: { type: Number, required: true },
  summary: { type: String, required: true },
  topSkills: { type: [String], default: [] },
  gaps: { type: [String], default: [] },
  reasoning: { type: String }
});

const ApplicationSchema: Schema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate' },
  
  // Applicant basic info from form
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  
  // Resume file storage
  resumeFile: {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    buffer: { type: Buffer, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }
  },
  
  // Application status
  status: { 
    type: String, 
    enum: ['Applied', 'Screening', 'Shortlisted', 'Rejected'], 
    default: 'Applied' 
  },
  
  // Screening results (populated after AI analysis)
  screeningResult: { type: ScreeningResultSchema },
  
  // Raw extracted text from resume
  extractedText: { type: String, required: true },
  
  // Email communication tracking
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date },
  
  // Timestamps
  submittedAt: { type: Date, default: Date.now },
  screenedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for better query performance
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ email: 1 });
ApplicationSchema.index({ candidateId: 1 });
ApplicationSchema.index({ submittedAt: -1 });
ApplicationSchema.index({ 'screeningResult.score': -1 });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
