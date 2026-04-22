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
  model: 'gemini-1.5-flash'
});

export interface ScreeningResult {
  name: string;
  email?: string;
  linkedin?: string;
  score: number;
  summary: string;
  top_skills: string[];
  gaps: string[];
  status: 'Shortlisted' | 'Review' | 'Rejected';
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
You are a professional Human Resources (HR) specialist.

Your role is to screen job applicants for ANY industry.

The job could be:

- Technology
- Finance
- Sales
- Marketing
- Administration
- Customer Service
- Healthcare
- Logistics
- Education
- Hospitality
- Construction
- Management
- Operations
- Any profession

You must evaluate candidates fairly based ONLY on the job description provided.

Do NOT prioritize any specific:

- country
- university
- region
- technology
- background

Evaluate candidates using general HR best practices.

------------------------------------------------

JOB DESCRIPTION:

${jobDescription}

------------------------------------------------

RESUMES:

${resumes.map((r, i) =>
  `--- RESUME ${i + 1} ---\n${r}`
).join('\n\n')}

------------------------------------------------

SCORING FRAMEWORK:

Score candidates using:

1) Relevant Skills — 40%
2) Work Experience — 30%
3) Education / Certifications — 15%
4) Communication / Professionalism — 10%
5) Cultural / Role Fit — 5%

------------------------------------------------

STATUS RULES:

Score >= 80 → Shortlisted

Score 60–79 → Review

Score < 60 → Rejected

------------------------------------------------

Return ONLY valid JSON.

Each object MUST follow:

[
  {
    "name": "Full Name",
    "email": "email@example.com",
    "linkedin": "https://linkedin.com/in/user",
    "score": 85,
    "summary": "Short explanation of suitability",
    "top_skills": ["Skill1", "Skill2"],
    "gaps": ["Gap1", "Gap2"],
    "status": "Shortlisted"
  }
]

IMPORTANT:

- Return results in the SAME ORDER as resumes
- Do NOT include explanations outside JSON
- Do NOT include markdown
- Do NOT include extra text
`;

    try {
      console.log(
        '🤖 Screening',
        resumes.length,
        'resumes'
      );

      if (!resumes || resumes.length === 0) {
        return [];
      }

      const result =
        await model.generateContent(prompt);

      const response =
        await result.response;

      const text =
        response.text().trim();

      console.log(
        '📄 Gemini response:',
        text.substring(0, 400)
      );

      const parsed =
        this.extractJSON(text);

      console.log(
        '✅ Parsed',
        parsed.length,
        'results'
      );

      return parsed;

    } catch (error: any) {

      if (
        error?.status === 429 &&
        retryCount < 3
      ) {
        const delay =
          Math.pow(2, retryCount) * 2000;

        console.warn(
          `⏳ Rate limit. Retrying in ${delay}ms`
        );

        await new Promise(res =>
          setTimeout(res, delay)
        );

        return this.screenResumes(
          jobDescription,
          resumes,
          retryCount + 1
        );
      }

      console.error(
        '❌ Gemini API Error:',
        error
      );

      throw new Error(
        'AI screening failed'
      );
    }
  }

  /**
   * Safe JSON extraction
   */
  private static extractJSON(
    text: string
  ): ScreeningResult[] {

    try {

      const arrayMatch =
        text.match(/\[[\s\S]*\]/);

      if (arrayMatch) {
        return JSON.parse(
          arrayMatch[0]
        );
      }

      const objectMatch =
        text.match(/\{[\s\S]*\}/);

      if (objectMatch) {
        return [
          JSON.parse(
            objectMatch[0]
          )
        ];
      }

      throw new Error(
        'No valid JSON found'
      );

    } catch (err) {

      console.error(
        '❌ JSON parse failed'
      );

      console.error(text);

      throw err;
    }
  }
}