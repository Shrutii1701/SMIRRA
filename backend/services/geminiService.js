import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('WARNING: GEMINI_API_KEY environment variable is not defined in backend/.env. Live AI endpoints will fail.');
}

/**
 * Interviewer personas. Each injects a distinct voice into the question and
 * feedback prompts. The scoring metrics and JSON schema stay identical across
 * personas — only tone and emphasis change.
 */
const PERSONA_STYLES = {
  mentor:
    'Adopt the persona of a warm, encouraging senior mentor. Frame questions supportively and keep feedback constructive and motivating, always highlighting strengths before gaps.',
  strict:
    'Adopt the persona of a strict, no-nonsense senior engineer with very high standards. Ask precise, probing questions and keep feedback blunt, direct, and demanding, without sugar-coating weaknesses.',
  recruiter:
    'Adopt the persona of a fast-paced technical recruiter. Favor concise, practical, real-world questions and give crisp, industry-focused feedback about hireability.',
  professor:
    'Adopt the persona of a Socratic computer-science professor. Ask conceptually deep "why" and "how" questions and give thoughtful, teaching-oriented feedback that builds understanding.',
};

const DEFAULT_STYLE =
  'Adopt the persona of a professional, balanced technical interviewer with a neutral, fair tone.';

function personaStyle(persona) {
  return PERSONA_STYLES[persona] || DEFAULT_STYLE;
}

// Helper to get active model
function getModel() {
  if (!genAI) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your backend/.env file.');
  }
  return genAI.getGenerativeModel({
    model: 'gemini-flash-lite-latest',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });
}

/**
 * Generates one dynamic question based on topic, difficulty, format, and past questions.
 */
export async function generateQuestion(topic, difficulty, questionType, previousQuestions = [], persona) {
  const model = getModel();

  const prompt = `
    You are an expert technical interviewer conducting a mock interview.
    ${personaStyle(persona)}
    Generate exactly ONE interview question.

    Topic: ${topic}
    Difficulty level: ${difficulty}
    Question style/format: ${questionType}

    CRITICAL: Avoid repeating, duplicating, or heavily overlapping with these previously asked questions:
    ${previousQuestions.length > 0 ? previousQuestions.map((q, idx) => `[${idx + 1}] ${q}`).join('\n') : 'None'}
    
    Respond in JSON format with the following schema:
    {
      "text": "The content of the interview question"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    
    if (!parsed.text) {
      throw new Error('Invalid response schema from Gemini API');
    }
    
    return parsed.text;
  } catch (error) {
    console.error('Error generating question from Gemini API:', error);
    throw error;
  }
}

/**
 * Evaluates the user's answer to a question across multiple dimensions.
 */
export async function evaluateAnswer(question, answer, topic, difficulty, persona) {
  const model = getModel();

  const prompt = `
    You are an expert technical interviewer. Evaluate the user's response to the given interview question.
    ${personaStyle(persona)}
    Keep your numeric scoring fair and objective regardless of persona; only the wording of "feedback" should reflect the persona's tone.

    Context:
    Topic: ${topic}
    Expected Difficulty: ${difficulty}
    
    Question Asked: "${question}"
    User's Answer: "${answer || '(No answer provided)'}"
    
    Evaluate the response across the following metrics. Give an integer score between 0 and 100 for each:
    1. technicalAccuracy: How technically correct and free of errors is the explanation or code?
    2. completeness: Did the user fully address all parts of the question?
    3. clarity: Is the explanation easy to follow and logically structured?
    4. relevance: Did the user stay on topic, or did they talk about unrelated things?
    5. communication: Tone, professional vocabulary, and confidence of expression.
    
    Additionally:
    - overallScore: Calculate an average/weighted score (0-100) reflecting their overall mastery.
    - feedback: Provide 3-4 sentences of direct, encouraging feedback, explaining strengths and key areas for development.
    - missingConcepts: A list of 2-4 key concepts, design patterns, keywords, or theories the user failed to mention or explain.
    
    Respond in JSON format with the following schema:
    {
      "technicalAccuracy": number,
      "completeness": number,
      "clarity": number,
      "relevance": number,
      "communication": number,
      "overallScore": number,
      "feedback": "string",
      "missingConcepts": ["string"]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    
    // Validate schema
    const requiredKeys = ['technicalAccuracy', 'completeness', 'clarity', 'relevance', 'communication', 'overallScore', 'feedback', 'missingConcepts'];
    for (const key of requiredKeys) {
      if (!(key in parsed)) {
        throw new Error(`Missing expected grading property: ${key}`);
      }
    }
    
    return parsed;
  } catch (error) {
    console.error('Error evaluating answer from Gemini API:', error);
    throw error;
  }
}
