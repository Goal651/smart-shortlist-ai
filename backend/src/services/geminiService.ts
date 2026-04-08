import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMININI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

export interface ScreeningResult {
  name: string;
  score: number;
  summary: string;
  top_skills: string[];
  gaps: string[];
  status: 'Shortlisted' | 'Review' | 'Rejected';
  email?: string;
  linkedin?: string;
}

async function listModels() {
  try {
    // This fetches the models metadata from the API
    const request = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await request.json();
    
    console.log("--- Available Models for your Key ---");
    data.models.forEach((m: any) => {
      console.log(`Name: ${m.name} | Methods: ${m.supportedGenerationMethods}`);
    });
  } catch (error) {
    console.error("Could not list models:", error);
  }
}

export class GeminiService {
  /**
   * Screens a batch of resumes against a job description.
   * @param jobDescription The JD text.
   * @param resumes Array of extracted resume texts.
   * @param retryCount Number of retries for rate limits.
   * @returns Array of screening results.
   */
  static async screenResumes(
    jobDescription: string, 
    resumes: string[], 
    retryCount = 0
  ): Promise<ScreeningResult[]> {
  
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
      4. Extract the "email" and "linkedin" URL if available.
      5. Return a JSON array where each object corresponds to a resume in order.
      6. The response must follow this JSON schema strictly:
      [
        {
          "name": "Full Name",
          "email": "email@example.com",
          "linkedin": "https://linkedin.com/in/username",
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
      console.log(result)
      const response = await result.response;
      console.log(response)
      const text = response.text().trim();
      
      // Robust JSON extraction
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in Gemini response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      // Handle Rate Limits (429)
      if (error?.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 2000;
        console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        return this.screenResumes(jobDescription, resumes, retryCount + 1);
      }

      console.error('Gemini API Error:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      if (error.response) {
        console.error('Error response:', error.response);
      }
      throw new Error('AI Screening failed');
    }
  }
}
