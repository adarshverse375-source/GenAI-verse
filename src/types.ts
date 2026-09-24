export type ThemeType = 'learning' | 'midnight';

export type SubjectType = 'Mathematics' | 'Science' | 'Social Science' | 'English Literature';

export interface Question {
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CustomQuestion extends Question {
  id: string;
  chapterId: string;
  createdAt: number;
  author?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  extraInfo?: string;
}

export interface Chapter {
  id: string;
  name: string;
  subject: SubjectType;
  keySummary: string[];
  formulasOrFacts: string[];
  flashcards: Flashcard[];
  highYieldQuestions: Question[];
}

export interface UserProgress {
  theme: ThemeType;
  points: number;
  streak: number;
  lastActiveDate: string | null;
  quizScores: { [chapterId: string]: number }; // High score percentage
  quizAttempts: { [chapterId: string]: number }; // Total quiz attempts
  completedFlashcards: string[]; // Set of flashcard IDs flipped/learnt
  unlockedBadges: string[]; // Badge IDs
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAtPoints: number;
}

export const BADGES: Badge[] = [
  { id: 'novice', title: 'Curious Mind', description: 'Unlock by earning your first 50 points', iconName: 'Compass', unlockedAtPoints: 50 },
  { id: 'scholar', title: 'CBSE Scholar', description: 'Earn 150 points through quizzes and studying', iconName: 'GraduationCap', unlockedAtPoints: 150 },
  { id: 'conqueror', title: 'Syllabus Conqueror', description: 'Earn 350 points to master Class 10 CBSE topics', iconName: 'Trophy', unlockedAtPoints: 350 },
  { id: 'legend', title: 'Topper Board-Ready', description: 'Cross 500 points to become fully Board-Exam Ready', iconName: 'Flame', unlockedAtPoints: 500 },
];
