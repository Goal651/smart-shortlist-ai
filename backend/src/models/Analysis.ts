import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalysis extends Document {
  jobId?: mongoose.Types.ObjectId;
  jobTitle: string;
  fileCount: number;
  candidateCount: number;
  topScore: number;
  createdAt: Date;
}

const AnalysisSchema: Schema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: false },
  jobTitle: { type: String, required: true },
  fileCount: { type: Number, required: true },
  candidateCount: { type: Number, required: true },
  topScore: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
