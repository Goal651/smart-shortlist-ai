import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMININI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface ScreeningResult {
  name: string;
  score: number;
  summary: string;
  top_skills: string[];
  gaps: string[];
  status: 'Shortlisted' | 'Review' | 'Rejected';
}

export class GeminiService {
  /**
   * Screens a batch of resumes against a job description.
   * @param jobDescription The JD text.
   * @param resumes Array of extracted resume texts.
   * @returns Array of screening results.
   */
  static async screenResumes(jobDescription: string, resumes: string[]): Promise<ScreeningResult[]> {
    const prompt = `
      You are an Expert Technical Recruiter at Umurava, specializing in the Rwandan and African tech market.
      Your task is to screen the following resumes against the Job Description (JD) provided.

      ### JOB DESCRIPTION:
      ${jobDescription}

      ### RESUMES TO SCREEN:
      ${resumes.map((text, i) => `--- RESUME ${i + 1} ---\n${text}`).join('\n\n')}

      ### INSTRUCTIONS:
      1. Analyze each resume carefully.
      2. Provide a score based on these weights:
         - Technical Skills (50%)
         - Project Evidence (30%)
         - Experience Relevance (20%)
      3. For the "Rwandan Context", prioritize candidates with experience in local tech ecosystems, regional projects, or education from institutions like CMU-Africa or ALU if present.
      4. Return a JSON array where each object corresponds to a resume in order.
      5. The response must follow this JSON schema strictly:
      [
        {
          "name": "Full Name",
          "score": 85,
          "summary": "2-sentence justification string.",
          "top_skills": ["Skill1", "Skill2"],
          "gaps": ["Gap1", "Gap2"],
          "status": "Shortlisted | Review | Rejected"
        }
      ]
      
      Status criteria:
      - Shortlisted: Score >= 80
      - Review: 60 <= Score < 80
      - Rejected: Score < 60

      ONLY return the JSON array. No preamble or markdown formatting.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Remove any potential markdown formatting that Gemini might add
      const cleanJson = text.replace(/```json|```/g, '').trim();
      
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('AI Screening failed');
    }
  }
}
