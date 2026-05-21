export type QuizMode = 'revision' | 'competition';

export interface QuestionOption {
  key: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctOption: string;
  verseReference: string;
  verseText: string;
  explanation: string;
  chapter: number;
  zone: number;
  difficulty: string;
}

export interface QuizSelection {
  pseudo: string;
  zone: number | null;
  chapter: number | null;
  chapterStart: number | null;
  chapterEnd: number | null;
  includeErrors: boolean;
  includeUnplayed: boolean;
  limit: number;
  timerSeconds: number;
  mode: QuizMode;
}

export interface AnswerRecord {
  questionId: string;
  selectedOption: string;
  responseTimeMs: number;
}

export interface AdaptiveRecommendation {
  title: string;
  description: string;
  zone: number | null;
  chapterStart: number | null;
  chapterEnd: number | null;
  focus: string;
}

export interface QuizResult {
  score: number;
  xpEarned: number;
  correctAnswers: number;
  totalQuestions: number;
  maxCombo: number;
  fastAnswers: number;
  accuracy: number;
  levelTitle: string;
  badge: string;
  recommendations: AdaptiveRecommendation[];
  pendingSync?: boolean;
}

export interface RecentScore {
  id: string;
  mode: string;
  zone: number | null;
  points: number;
  xpEarned: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAtUtc: string;
}

export interface ProfileSummary {
  pseudo: string;
  totalXp: number;
  totalScore: number;
  levelTitle: string;
  badge: string;
  accuracy: number;
  averageResponseTimeMs: number;
  bestCombo: number;
  teamName: string | null;
  recommendations: AdaptiveRecommendation[];
  recentScores: RecentScore[];
}

export interface LeaderboardEntry {
  rank: number;
  pseudo: string;
  teamName: string | null;
  totalScore: number;
  totalXp: number;
  accuracy: number;
  bestCombo: number;
}

export interface TeamLeaderboardEntry {
  rank: number;
  teamName: string;
  joinCode: string;
  totalScore: number;
  totalXp: number;
  memberCount: number;
}

export interface TeamSummary {
  id: string;
  name: string;
  joinCode: string;
  totalScore: number;
  totalXp: number;
  memberCount: number;
}

export interface PendingSyncItem {
  id: string;
  endpoint: 'submit-score' | 'submit-competitive-score';
  payload: unknown;
  createdAt: string;
}

export interface ChapterAssignment {
  member: string;
  chapters: string;
  chapterStart: number;
  chapterEnd: number;
  note?: string;
}

export const ZONE_CATALOG = [
  { id: 1, title: 'Zone 1', subtitle: 'Les reves et la trahison', chapters: 'Genese 37-38', icon: '🌙' },
  { id: 2, title: 'Zone 2', subtitle: 'Prison et elevation', chapters: 'Genese 39-41', icon: '⛓️' },
  { id: 3, title: 'Zone 3', subtitle: 'Tests et reconciliation', chapters: 'Genese 42-45', icon: '🍷' },
  { id: 4, title: 'Zone 4', subtitle: 'Heritage et fin de vie', chapters: 'Genese 46-50', icon: '👑' }
] as const;

export const TEAM_SUGGESTIONS = ['Les Reveurs', 'Les Intendants', 'Les Gouverneurs', 'Les Heritiers'];

export const CHAPTER_ASSIGNMENTS: ChapterAssignment[] = [
  { member: 'VN3 / Yx5', chapters: 'Chapitre 37', chapterStart: 37, chapterEnd: 37 },
  { member: 'VH Danilo', chapters: 'Chapitre 38', chapterStart: 38, chapterEnd: 38 },
  { member: 'Marie Aude 22', chapters: 'Chapitre 39', chapterStart: 39, chapterEnd: 39 },
  { member: 'Epe', chapters: 'Chapitre 40', chapterStart: 40, chapterEnd: 40, note: 'Ton chapitre attribue' },
  { member: 'Sarah Koffi', chapters: 'Chapitre 41', chapterStart: 41, chapterEnd: 41 },
  { member: 'Dora', chapters: 'Chapitre 42', chapterStart: 42, chapterEnd: 42 },
  { member: 'Isaiah', chapters: 'Chapitre 43', chapterStart: 43, chapterEnd: 43 },
  { member: 'Mains jointes', chapters: 'Chapitre 44', chapterStart: 44, chapterEnd: 44 },
  { member: 'Emma M', chapters: 'Chapitre 45', chapterStart: 45, chapterEnd: 45 },
  { member: '+225 0716650511', chapters: 'Chapitre 46', chapterStart: 46, chapterEnd: 46 },
  { member: 'Kouao Edwige', chapters: 'Chapitre 47', chapterStart: 47, chapterEnd: 47 },
  { member: '+225 0705452554', chapters: 'Chapitre 48', chapterStart: 48, chapterEnd: 48 },
  { member: 'Millogo Gloria', chapters: 'Chapitres 49 a 50', chapterStart: 49, chapterEnd: 50 },
  { member: 'Luxi', chapters: 'Chapitres 37 a 50', chapterStart: 37, chapterEnd: 50, note: 'Couverture complete' },
  { member: 'Laeticia Heimon', chapters: 'Chapitres 37 a 50', chapterStart: 37, chapterEnd: 50, note: 'Couverture complete' },
  { member: 'Daniel Heimon', chapters: 'Chapitres 37 a 50', chapterStart: 37, chapterEnd: 50, note: 'Couverture complete' }
];
