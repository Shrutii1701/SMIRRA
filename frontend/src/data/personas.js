import { HeartHandshake, Gavel, Briefcase, GraduationCap } from 'lucide-react';

/**
 * Interviewer personas shown on the setup screen. The `id` is sent to the
 * backend, which maps it to a prompt-voice for question generation and feedback.
 * Scoring stays identical across personas — only tone changes.
 */
export const PERSONAS = [
  {
    id: 'mentor',
    label: 'Friendly Mentor',
    icon: HeartHandshake,
    desc: 'Warm and encouraging. Supportive questions and motivating feedback.',
  },
  {
    id: 'strict',
    label: 'Strict Senior Engineer',
    icon: Gavel,
    desc: 'High standards, blunt and direct. Probing questions, no hand-holding.',
  },
  {
    id: 'recruiter',
    label: 'Rapid-Fire Recruiter',
    icon: Briefcase,
    desc: 'Fast and practical. Real-world questions with crisp, hireability-focused notes.',
  },
  {
    id: 'professor',
    label: 'Socratic Professor',
    icon: GraduationCap,
    desc: 'Deep and conceptual. "Why" and "how" questions with teaching-oriented feedback.',
  },
];

export const DEFAULT_PERSONA = 'mentor';

export function getPersona(id) {
  return PERSONAS.find((p) => p.id === id) || PERSONAS[0];
}
