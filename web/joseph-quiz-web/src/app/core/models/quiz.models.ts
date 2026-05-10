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

export const ZONE_CATALOG = [
  { id: 1, title: 'Zone 1', subtitle: 'Les rêves et la trahison', chapters: 'Genèse 37-38', icon: '🌙' },
  { id: 2, title: 'Zone 2', subtitle: 'Prison et élévation', chapters: 'Genèse 39-41', icon: '⛓️' },
  { id: 3, title: 'Zone 3', subtitle: 'Tests et réconciliation', chapters: 'Genèse 42-45', icon: '🍷' },
  { id: 4, title: 'Zone 4', subtitle: 'Héritage et fin de vie', chapters: 'Genèse 46-50', icon: '👑' }
] as const;

export const TEAM_SUGGESTIONS = ['Les Rêveurs', 'Les Intendants', 'Les Gouverneurs', 'Les Héritiers'];
