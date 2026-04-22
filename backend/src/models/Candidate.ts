import mongoose, { Schema, Document } from 'mongoose';

// Skill with proficiency level
interface ISkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
}

// Language proficiency
interface ILanguage {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

// Work experience
interface IExperience {
  company: string;
  role: string;
  startDate: string; // YYYY-MM
  endDate: string | 'Present'; // YYYY-MM or Present
  description: string;
  technologies: string[];
  isCurrent: boolean;
}

// Education
interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

// Certification
interface ICertification {
  name: string;
  issuer: string;
  issueDate: string; // YYYY-MM
}

// Project
interface IProject {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link?: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM
}

// Availability
interface IAvailability {
  status: 'Available' | 'Open to Opportunities' | 'Not Available';
  type: 'Full-time' | 'Part-time' | 'Contract';
  startDate?: string; // YYYY-MM-DD
}

// Social Links
interface ISocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  [key: string]: string | undefined;
}

// Talent Profile with AI Analysis
export interface ICandidate extends Document {
  jobId?: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
  
  // Skills & Languages
  skills: ISkill[];
  languages: ILanguage[];
  
  // Experience
  experience: IExperience[];
  
  // Education
  education: IEducation[];
  
  // Certifications
  certifications: ICertification[];
  
  // Projects
  projects: IProject[];
  
  // Availability
  availability: IAvailability;
  
  // Social Links
  socialLinks?: ISocialLinks;
  
  // AI Analysis Results
  aiAnalysis?: {
    score: number;
    summary: string;
    topSkills: string[];
    gaps: string[];
    reasoning?: string;
    recommendations?: string[];
  };
  
  // Screening Status
  status: 'Applied' | 'Screening' | 'Shortlisted' | 'Rejected';
  
  // Metadata
  extractedText: string;
  screenedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], required: true },
  yearsOfExperience: { type: Number, required: true }
});

const LanguageSchema = new Schema<ILanguage>({
  name: { type: String, required: true },
  proficiency: { type: String, enum: ['Basic', 'Conversational', 'Fluent', 'Native'], required: true }
});

const ExperienceSchema = new Schema<IExperience>({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: String, required: true }, // YYYY-MM
  endDate: { type: String, required: true }, // YYYY-MM or Present
  description: { type: String, required: true },
  technologies: { type: [String], default: [] },
  isCurrent: { type: Boolean, default: false }
});

const EducationSchema = new Schema<IEducation>({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true }
});

const CertificationSchema = new Schema<ICertification>({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: String, required: true } // YYYY-MM
});

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  technologies: { type: [String], default: [] },
  role: { type: String, required: true },
  link: { type: String },
  startDate: { type: String, required: true }, // YYYY-MM
  endDate: { type: String }
});

const AvailabilitySchema = new Schema<IAvailability>({
  status: { type: String, enum: ['Available', 'Open to Opportunities', 'Not Available'], default: 'Available' },
  type: { type: String, enum: ['Full-time', 'Part-time', 'Contract'], required: true },
  startDate: { type: String } // YYYY-MM-DD
});

const SocialLinksSchema = new Schema({
  linkedin: { type: String },
  github: { type: String },
  portfolio: { type: String }
}, { strict: false });

const AIAnalysisSchema = new Schema({
  score: { type: Number, required: true },
  summary: { type: String, required: true },
  topSkills: { type: [String], default: [] },
  gaps: { type: [String], default: [] },
  reasoning: { type: String },
  recommendations: { type: [String], default: [] }
});

const CandidateSchema: Schema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
  applicationId: { type: Schema.Types.ObjectId, ref: 'Application' },
  
  // Basic Information
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  headline: { type: String, required: true },
  bio: { type: String },
  location: { type: String, required: true },
  
  // Skills & Languages
  skills: { type: [SkillSchema], default: [] },
  languages: { type: [LanguageSchema], default: [] },
  
  // Experience
  experience: { type: [ExperienceSchema], default: [] },
  
  // Education
  education: { type: [EducationSchema], default: [] },
  
  // Certifications
  certifications: { type: [CertificationSchema], default: [] },
  
  // Projects
  projects: { type: [ProjectSchema], default: [] },
  
  // Availability
  availability: { type: AvailabilitySchema, required: true },
  
  // Social Links
  socialLinks: { type: SocialLinksSchema },
  
  // AI Analysis Results
  aiAnalysis: { type: AIAnalysisSchema },
  
  // Screening Status
  status: {
    type: String,
    enum: ['Applied', 'Screening', 'Shortlisted', 'Rejected'],
    default: 'Applied'
  },
  
  // Metadata
  extractedText: { type: String },
  screenedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
CandidateSchema.index({ email: 1 });
CandidateSchema.index({ jobId: 1 });
CandidateSchema.index({ status: 1 });
CandidateSchema.index({ 'aiAnalysis.score': -1 });

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
