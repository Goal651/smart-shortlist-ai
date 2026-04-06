import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
  jobId: mongoose.Types.ObjectId;
  analysisId?: mongoose.Types.ObjectId;
  name: string;
  score: number;
  summary: string;
  top_skills: string[];
  gaps: string[];
  status: 'Shortlisted' | 'Review' | 'Rejected';
  email?: string;
  linkedin?: string;
  extractedText: string;
  createdAt: Date;
}

const CandidateSchema: Schema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  analysisId: { type: Schema.Types.ObjectId, ref: 'Analysis', required: false },
  name: { type: String, required: true },
  score: { type: Number, required: true },
  summary: { type: String, required: true },
  top_skills: { type: [String], default: [] },
  gaps: { type: [String], default: [] },
  status: { 
    type: String, 
    enum: ['Shortlisted', 'Review', 'Rejected'], 
    default: 'Review' 
  },
  email: { type: String },
  linkedin: { type: String },
  extractedText: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
