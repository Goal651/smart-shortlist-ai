import mongoose, { Schema, Document } from 'mongoose';

// Candidate score entry for ranking
interface ICandidateScore {
  candidateId: mongoose.Types.ObjectId;
  email: string;
  name: string;
  score: number;
  summary: string;
  topSkills: string[];
  gaps: string[];
}

export interface IAnalysis extends Document {
  jobId: mongoose.Types.ObjectId;
  jobTitle: string;
  jobDescription: string;
  
  // Analysis metadata
  fileCount: number;
  candidateCount: number;
  screened: boolean;
  
  // Results
  results: ICandidateScore[];
  topScore: number;
  averageScore: number;
  
  // AI Analysis Summary
  summary?: string;
  insights?: string[];
  recommendations?: string[];
  
  // Timestamps
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateScoreSchema = new Schema<ICandidateScore>({
  candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
  email: { type: String, required: true, lowercase: true },
  name: { type: String, required: true },
  score: { type: Number, required: true },
  summary: { type: String, required: true },
  topSkills: { type: [String], default: [] },
  gaps: { type: [String], default: [] }
});

const AnalysisSchema: Schema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  jobTitle: { type: String, required: true },
  jobDescription: { type: String, required: true },
  
  // Analysis metadata
  fileCount: { type: Number, required: true },
  candidateCount: { type: Number, required: true },
  screened: { type: Boolean, default: false },
  
  // Results
  results: { type: [CandidateScoreSchema], default: [] },
  topScore: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  
  // AI Analysis Summary
  summary: { type: String },
  insights: { type: [String], default: [] },
  recommendations: { type: [String], default: [] },
  
  // Timestamps
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for efficient queries
AnalysisSchema.index({ jobId: 1 });
AnalysisSchema.index({ screened: 1 });
AnalysisSchema.index({ 'results.score': -1 });
AnalysisSchema.index({ createdAt: -1 });

export default mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
