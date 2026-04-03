import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
  jobId: mongoose.Types.ObjectId;
  name: string;
  score: number;
  summary: string;
  top_skills: string[];
  gaps: string[];
  status: 'Shortlisted' | 'Review' | 'Rejected';
  extractedText: string;
  createdAt: Date;
}

const CandidateSchema: Schema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
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
  extractedText: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
