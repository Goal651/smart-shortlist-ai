import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GEMININI_API_KEY ||
  '';

if (!apiKey) {
  console.warn('⚠️ Gemini API key not found');
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
  }
});

export interface ScreeningResult {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
  skills: { name: string; level: string; yearsOfExperience: number }[];
  languages: { name: string; proficiency: string }[];
  experience: { 
    company: string; 
    role: string; 
    startDate: string; 
    endDate: string; 
    description: string; 
    technologies: string[]; 
    isCurrent: boolean;
  }[];
  education: { 
    institution: string; 
    degree: string; 
    fieldOfStudy: string; 
    startYear: number; 
    endYear: number;
  }[];
  availability: { 
    status: string; 
    type: string;
  };
  socialLinks: { 
    linkedin?: string; 
    github?: string; 
    portfolio?: string;
  };
  aiAnalysis: {
    score: number;
    summary: string;
    topSkills: string[];
    gaps: string[];
    reasoning: string;
    recommendations: string[];
  };
  status: 'Shortlisted' | 'Screening' | 'Rejected';
}

export class GeminiService {

  /**
   * GENERAL HR SCREENING
   * Works for ANY job role or industry
   */
  static async screenResumes(
    jobDescription: string,
    resumes: string[],
    retryCount = 0
  ): Promise<ScreeningResult[]> {

    const prompt = `
Evaluate the following resumes against the job description.
Return a JSON array of objects, one for each resume, in the same order.

JOB DESCRIPTION:
${jobDescription}

RESUMES:
${resumes.map((r, i) => `--- RESUME ${i + 1} ---\n${r}`).join('\n\n')}

For each candidate, provide:
1. firstName, lastName (extracted from resume)
2. email, headline (professional title), bio (summary), location
3. skills: array of {name, level, yearsOfExperience} where level is ONE OF: "Beginner", "Intermediate", "Advanced", "Expert"
4. languages: array of {name, proficiency} where proficiency is ONE OF: "Basic", "Conversational", "Fluent", "Native"
5. experience: array of {company, role, startDate (YYYY-MM), endDate (YYYY-MM or "Present"), description, technologies, isCurrent}
6. education: array of {institution, degree, fieldOfStudy, startYear (number), endYear (number)}
7. availability: {status, type} where status is ONE OF: "Available", "Open to Opportunities", "Not Available" and type is ONE OF: "Full-time", "Part-time", "Contract"
8. socialLinks: {linkedin, github, portfolio}
9. aiAnalysis: {score (0-100), summary, topSkills (array of strings), gaps (array of strings), reasoning, recommendations (array of strings)}
10. status: "Shortlisted" (score >= 80), "Screening" (60-79), or "Rejected" (< 60)

CRITICAL: 
- Use EXACTLY the enum values specified above.
- Ensure all fields are present even if empty (use [] for arrays, "Unknown" for strings).
- For experience and education, ensure all sub-fields like description or startYear are provided.
- Return ONLY the JSON array.
`;

    try {
      console.log('🤖 Screening', resumes.length, 'resumes');
      if (!resumes || resumes.length === 0) return [];

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      console.log('📄 Gemini response (truncated):', text.substring(0, 200));

      const parsed = this.extractJSON(text);
      
      // Ensure we return an array of the correct length
      if (parsed.length !== resumes.length) {
        console.warn(`⚠️ Expected ${resumes.length} results, but got ${parsed.length}. Padding or truncating.`);
      }

      return parsed;
    } catch (error: any) {
      if (error?.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 2000;
        console.warn(`⏳ Rate limit. Retrying in ${delay}ms`);
        await new Promise(res => setTimeout(res, delay));
        return this.screenResumes(jobDescription, resumes, retryCount + 1);
      }
      console.error('❌ Gemini API Error:', error);
      throw new Error('AI screening failed');
    }
  }

  /**
   * Safe JSON extraction
   */
  private static extractJSON(text: string): ScreeningResult[] {
    try {
      // First try direct parse (for JSON mode)
      return JSON.parse(text);
    } catch (err) {
      try {
        // Fallback to regex if there's extra text or markdown
        const arrayMatch = text.match(/\[[\s\S]*\]/);
        if (arrayMatch) return JSON.parse(arrayMatch[0]);

        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) return [JSON.parse(objectMatch[0])];

        throw new Error('No valid JSON found');
      } catch (innerErr) {
        console.error('❌ JSON parse failed');
        console.error(text);
        throw innerErr;
      }
    }
  }
}