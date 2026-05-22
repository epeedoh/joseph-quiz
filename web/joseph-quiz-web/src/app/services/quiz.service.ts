import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { environment } from '../../environments/environment';
import {
  AdaptiveRecommendation,
  AnswerRecord,
  PendingSyncItem,
  ProfileSummary,
  Question,
  QuizMode,
  QuizResult,
  QuizSelection
} from '../core/models/quiz.models';
import { OfflineCacheService } from './offline-cache.service';
import { ProgressService } from './progress.service';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);
  private readonly offlineCache = inject(OfflineCacheService);
  private readonly progressService = inject(ProgressService);

  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly questions = signal<Question[]>([]);
  readonly currentIndex = signal(0);
  readonly answers = signal<Record<string, AnswerRecord>>({});
  readonly selection = signal<QuizSelection | null>(null);
  readonly mode = signal<QuizMode>('revision');
  readonly result = signal<QuizResult | null>(null);

  readonly currentQuestion = computed(() => this.questions()[this.currentIndex()] ?? null);
  readonly answeredCount = computed(() => Object.keys(this.answers()).length);
  readonly correctCount = computed(() => {
    const questions = this.questions();
    const answers = this.answers();

    return questions.reduce((count, question) => {
      const answer = answers[question.id];
      return count + (answer?.selectedOption === question.correctOption ? 1 : 0);
    }, 0);
  });
  readonly liveScore = computed(() => {
    const selection = this.selection();
    const questions = this.questions();
    const answers = this.answers();

    if (!selection || !questions.length) {
      return 0;
    }

    let correctAnswers = 0;
    let fastAnswers = 0;
    let maxCombo = 0;
    let currentCombo = 0;

    for (const question of questions) {
      const answer = answers[question.id];
      if (!answer) {
        continue;
      }

      const isCorrect = answer.selectedOption === question.correctOption;
      if (isCorrect) {
        correctAnswers += 1;
        currentCombo += 1;
        maxCombo = Math.max(maxCombo, currentCombo);

        if (answer.responseTimeMs <= Math.min(7_000, (selection.timerSeconds * 1_000) / 2)) {
          fastAnswers += 1;
        }
      } else {
        currentCombo = 0;
      }
    }

    return (correctAnswers * 100) + (fastAnswers * 25) + (maxCombo >= 2 ? maxCombo * 10 : 0);
  });
  readonly progressPercent = computed(() => {
    const total = this.questions().length;
    if (!total) {
      return 0;
    }

    return Math.round(((this.currentIndex() + 1) / total) * 100);
  });

  readonly feedback = computed(() => {
    const question = this.currentQuestion();
    if (!question) {
      return null;
    }

    const answer = this.answers()[question.id];
    if (!answer) {
      return null;
    }

    const answeredQuestions = this.questions()
      .slice(0, this.currentIndex() + 1)
      .map((item) => ({
        question: item,
        answer: this.answers()[item.id]
      }))
      .filter((item) => !!item.answer);

    let comboBeforeCurrent = 0;
    for (let index = 0; index < answeredQuestions.length - 1; index += 1) {
      const item = answeredQuestions[index];
      if (item.answer!.selectedOption === item.question.correctOption) {
        comboBeforeCurrent += 1;
      } else {
        comboBeforeCurrent = 0;
      }
    }

    const isCorrect = answer.selectedOption === question.correctOption;
    const fastThreshold = Math.min(7_000, ((this.selection()?.timerSeconds ?? 15) * 1_000) / 2);
    const isFast = isCorrect && answer.responseTimeMs <= fastThreshold;
    const comboAfterAnswer = isCorrect ? comboBeforeCurrent + 1 : 0;
    const comboBonus = comboAfterAnswer >= 2 ? comboAfterAnswer * 10 : 0;
    const scoreEarned = isCorrect ? 100 + (isFast ? 25 : 0) + comboBonus : 0;
    const xpEarned = isCorrect ? 10 + (isFast ? 5 : 0) + (comboAfterAnswer >= 3 ? comboAfterAnswer * 3 : 0) : 0;

    return {
      isCorrect,
      isFast,
      comboAfterAnswer,
      scoreEarned,
      xpEarned,
      correctOption: question.correctOption,
      verseReference: question.verseReference,
      verseText: question.verseText,
      explanation: question.explanation
    };
  });

  constructor() {
    window.addEventListener('online', () => void this.syncPendingSubmissions());
  }

  async start(selection: QuizSelection): Promise<boolean> {
    this.loading.set(true);
    this.selection.set(selection);
    this.mode.set(selection.mode);
    this.currentIndex.set(0);
    this.answers.set({});
    this.result.set(null);

    const cacheKey = this.buildCacheKey(selection);

    try {
      const questions = await this.http
        .post<Question[]>(`${environment.apiBaseUrl}/quiz/custom`, selection)
        .toPromise();

      this.questions.set(this.shuffleQuestions(questions ?? []));
      await this.offlineCache.write(cacheKey, this.questions());
    } catch {
      const cachedQuestions = (await this.offlineCache.read<Question[]>(cacheKey)) ?? [];
      this.questions.set(this.shuffleQuestions(cachedQuestions));
    } finally {
      this.loading.set(false);
    }

    return this.questions().length > 0;
  }

  answerCurrentQuestion(selectedOption: string, responseTimeMs: number): void {
    const question = this.currentQuestion();
    if (!question || this.answers()[question.id]) {
      return;
    }

    this.answers.update((current) => ({
      ...current,
      [question.id]: {
        questionId: question.id,
        selectedOption,
        responseTimeMs
      }
    }));
  }

  nextQuestion(): void {
    if (this.currentIndex() >= this.questions().length - 1) {
      void this.finish();
      return;
    }

    this.currentIndex.update((value) => value + 1);
  }

  reset(): void {
    this.questions.set([]);
    this.currentIndex.set(0);
    this.answers.set({});
    this.selection.set(null);
    this.result.set(null);
  }

  async finish(): Promise<void> {
    if (!this.selection()) {
      return;
    }

    this.submitting.set(true);

    const payload = this.buildSubmissionPayload();
    const endpoint = this.mode() === 'competition' ? 'submit-competitive-score' : 'submit-score';

    try {
      const result = await this.http
        .post<QuizResult>(`${environment.apiBaseUrl}/${endpoint}`, payload)
        .toPromise();

      if (result) {
        this.result.set(result);
        await this.progressService.loadProfile();
      }
    } catch {
      await this.offlineCache.enqueue({ endpoint, payload });
      const offlineResult = this.buildOfflineResult();
      this.result.set({ ...offlineResult, pendingSync: true });
      await this.progressService.applyOptimisticResult({ ...offlineResult, pendingSync: true });
    } finally {
      this.submitting.set(false);
    }
  }

  async syncPendingSubmissions(): Promise<void> {
    await this.offlineCache.drain(async (item: PendingSyncItem) => {
      await this.http.post(`${environment.apiBaseUrl}/${item.endpoint}`, item.payload).toPromise();
    });

    await this.progressService.loadProfile();
  }

  buildRecommendationSelection(recommendation: AdaptiveRecommendation): QuizSelection | null {
    const currentSelection = this.selection();
    const pseudo = this.progressService.pseudo();
    if (!pseudo) {
      return null;
    }

    return {
      pseudo,
      zone: recommendation.zone,
      chapter: null,
      chapterStart: recommendation.chapterStart,
      chapterEnd: recommendation.chapterEnd,
      includeErrors: recommendation.focus === 'Mémorisation des détails',
      includeUnplayed: false,
      limit: currentSelection?.limit ?? 10,
      timerSeconds: currentSelection?.timerSeconds ?? 15,
      mode: 'revision'
    };
  }

  private buildSubmissionPayload() {
    const selection = this.selection()!;
    const orderedAnswers = this.questions().map((question) => this.answers()[question.id] ?? {
      questionId: question.id,
      selectedOption: '',
      responseTimeMs: selection.timerSeconds * 1_000
    });
    const chapterStart = selection.chapter ?? selection.chapterStart ?? Math.min(...this.questions().map((question) => question.chapter));
    const chapterEnd = selection.chapter ?? selection.chapterEnd ?? Math.max(...this.questions().map((question) => question.chapter));

    if (selection.mode === 'competition') {
      return {
        pseudo: selection.pseudo,
        zone: selection.zone,
        chapterStart,
        chapterEnd,
        timerSeconds: selection.timerSeconds,
        answers: orderedAnswers
      };
    }

    return {
      pseudo: selection.pseudo,
      zone: selection.zone,
      chapterStart,
      chapterEnd,
      answers: orderedAnswers
    };
  }

  private buildOfflineResult(): QuizResult {
    const selection = this.selection()!;
    let correctAnswers = 0;
    let maxCombo = 0;
    let currentCombo = 0;
    let fastAnswers = 0;
    let totalResponseTimeMs = 0;

    for (const question of this.questions()) {
      const answer = this.answers()[question.id];
      const isCorrect = answer?.selectedOption === question.correctOption;

      if (isCorrect) {
        correctAnswers += 1;
        currentCombo += 1;
        maxCombo = Math.max(maxCombo, currentCombo);
      } else {
        currentCombo = 0;
      }

      if (isCorrect && (answer?.responseTimeMs ?? 99_999) <= Math.min(7_000, (selection.timerSeconds * 1_000) / 2)) {
        fastAnswers += 1;
      }

      totalResponseTimeMs += answer?.responseTimeMs ?? selection.timerSeconds * 1_000;
    }

    const chapterSet = new Set(this.questions().map((question) => question.chapter));
    const chapterBonus = chapterSet.size === 1 ? 1 : 0;
    const xpEarned = (correctAnswers * 10) + (fastAnswers * 5) + (chapterBonus * 50) + (maxCombo >= 3 ? maxCombo * 3 : 0);
    const score = (correctAnswers * 100) + (fastAnswers * 25) + (chapterBonus * 150) + (maxCombo >= 2 ? maxCombo * 10 : 0);
    const accuracy = this.questions().length ? correctAnswers / this.questions().length : 0;
    const pseudoProfile = this.progressService.profile();
    const totalXp = (pseudoProfile?.totalXp ?? 0) + xpEarned;
    const { badge, title } = this.resolveLevel(totalXp);

    return {
      score,
      xpEarned,
      correctAnswers,
      totalQuestions: this.questions().length,
      maxCombo,
      fastAnswers,
      accuracy,
      levelTitle: title,
      badge,
      recommendations: this.buildFallbackRecommendations(totalResponseTimeMs / Math.max(1, this.questions().length))
    };
  }

  private buildFallbackRecommendations(averageResponseTimeMs: number): AdaptiveRecommendation[] {
    const weakestZones = [...this.questions()]
      .sort((left, right) => left.zone - right.zone)
      .slice(0, 2)
      .map((question) => question.zone);

    return [
      {
        title: 'Réviser les zones clés',
        description: 'Un passage ciblé sur tes chapitres récents t’aidera à consolider les détails.',
        zone: weakestZones[0] ?? null,
        chapterStart: null,
        chapterEnd: null,
        focus: 'Renforcement intelligent'
      },
      {
        title: 'Travailler la vitesse',
        description: averageResponseTimeMs > 8_000
          ? 'Tes temps de réponse sont un peu longs: teste un mini mode compétition.'
          : 'Tu peux passer sur un format chrono pour progresser encore.',
        zone: null,
        chapterStart: null,
        chapterEnd: null,
        focus: 'Réflexes'
      }
    ];
  }

  private resolveLevel(xp: number): { title: string; badge: string } {
    if (xp <= 100) {
      return { title: 'Rêveur Novice', badge: '🥉 Rêveur' };
    }

    if (xp <= 300) {
      return { title: 'Intendant', badge: '🥈 Intendant' };
    }

    if (xp <= 600) {
      return { title: 'Gouverneur', badge: '🥇 Gouverneur' };
    }

    return { title: 'Patriarche', badge: '🏆 Patriarche' };
  }

  private buildCacheKey(selection: QuizSelection): string {
    return `jq:quiz:${JSON.stringify({
      zone: selection.zone,
      chapter: selection.chapter,
      chapterStart: selection.chapterStart,
      chapterEnd: selection.chapterEnd,
      includeErrors: selection.includeErrors,
      includeUnplayed: selection.includeUnplayed,
      limit: selection.limit
    })}`;
  }

  private shuffleQuestions(questions: Question[]): Question[] {
    const items = [...questions];

    for (let index = items.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    }

    return items;
  }
}
