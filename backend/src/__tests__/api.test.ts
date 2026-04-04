import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import Job from '../models/Job';
import Candidate from '../models/Candidate';

// To avoid spamming MongoDB or the actual Gemini API during tests, we'll mock the Mongoose models and Gemini API.
jest.mock('../models/Job');
jest.mock('../models/Candidate');
jest.mock('../services/geminiService', () => ({
  GeminiService: {
    screenResumes: jest.fn(),
  },
}));
jest.mock('../services/processingService', () => ({
  ProcessingService: {
    extractText: jest.fn().mockResolvedValue('Mock extracted text from PDF'),
  },
}));

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: 'Vetter API Online',
        system: 'TypeScript + Node.js',
        model: 'Gemini 1.5 Flash',
      });
    });
  });

  describe('POST /api/jobs', () => {
    it('should fail if title or description is missing', async () => {
      const res = await request(app).post('/api/jobs').send({
        title: 'Backend Dev',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Job title and description/);
    });

    it('should fail if description is less than 100 characters', async () => {
      const res = await request(app).post('/api/jobs').send({
        title: 'Backend Dev',
        description: 'Too short',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/min 100 chars/);
    });

    it('should create a job successfully', async () => {
      // Mocking the Job constructor and save behavior
      const mockJob = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Backend Dev',
        description: 'A'.repeat(100),
      };
      (Job.prototype.save as unknown as jest.Mock).mockResolvedValue(mockJob);
      Job.prototype._id = mockJob._id;
      Job.prototype.title = mockJob.title;
      Job.prototype.description = mockJob.description;
      
      // Need a clean way to mock new Job() instance - since we're using prototype, let's just assert status
      const res = await request(app).post('/api/jobs').send({
        title: 'Backend Dev',
        description: 'A'.repeat(100),
      });

      expect(res.status).toBe(201);
      expect(Job.prototype.save).toHaveBeenCalled();
    });
  });

  describe('GET /api/jobs', () => {
    it('should return a list of jobs', async () => {
      const mockJobs = [{ title: 'Job 1' }, { title: 'Job 2' }];
      (Job.find as unknown as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockJobs),
      });

      const res = await request(app).get('/api/jobs');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockJobs);
    });
  });

  describe('GET /api/candidates/:id', () => {
    it('should return 404 for missing candidate', async () => {
      (Candidate.findById as unknown as jest.Mock).mockResolvedValue(null);
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/candidates/${fakeId}`);
      expect(res.status).toBe(404);
    });

    it('should return a candidate', async () => {
      const fakeCandidate = { name: 'Alice' };
      (Candidate.findById as unknown as jest.Mock).mockResolvedValue(fakeCandidate);
      const fakeId = new mongoose.Types.ObjectId().toString();
      
      const res = await request(app).get(`/api/candidates/${fakeId}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeCandidate);
    });
  });
});
