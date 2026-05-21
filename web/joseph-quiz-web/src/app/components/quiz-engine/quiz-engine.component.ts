import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ProgressService } from '../../services/progress.service';
import { QuizService } from '../../services/quiz.service';
import { TimerComponent } from '../timer/timer.component';

@Component({
  selector: 'app-quiz-engine',
  standalone: true,
  imports: [CommonModule, RouterLink, TimerComponent],
  template: `
    @if (quizService.loading()) {
      <section class="glass-card flex min-h-[420px] items-center justify-center p-10 text-center">
        <div>
          <div class="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-gold/30 border-t-royal"></div>
          <p class="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-royal">Chargement des questions...</p>
        </div>
      </section>
    } @else if (quizService.result()) {
      <section class="glass-card space-y-6 p-6 sm:p-8">
        <p class="gold-chip">{{ quizService.result()?.pendingSync ? 'Sauvegarde locale' : 'Session terminée' }}</p>
        <h1 class="section-title">Résultat du quiz</h1>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-[24px] bg-royal p-5 text-white">
            <p class="text-xs uppercase tracking-[0.18em] text-white/70">Score</p>
            <p class="mt-2 text-3xl font-extrabold">{{ quizService.result()?.score }}</p>
          </div>
          <div class="rounded-[24px] bg-gold/15 p-5">
            <p class="text-xs uppercase tracking-[0.18em] text-ink/55">XP gagnés</p>
            <p class="mt-2 text-3xl font-extrabold text-gold">+{{ quizService.result()?.xpEarned }}</p>
          </div>
          <div class="rounded-[24px] bg-ink/5 p-5">
            <p class="text-xs uppercase tracking-[0.18em] text-ink/55">Précision</p>
            <p class="mt-2 text-3xl font-extrabold text-ink">{{ ((quizService.result()?.accuracy ?? 0) * 100) | number:'1.0-0' }}%</p>
          </div>
          <div class="rounded-[24px] bg-wine/10 p-5">
            <p class="text-xs uppercase tracking-[0.18em] text-ink/55">Combo max</p>
            <p class="mt-2 text-3xl font-extrabold text-wine">{{ quizService.result()?.maxCombo }}</p>
          </div>
        </div>

        <div class="rounded-[28px] bg-hero-glow p-6 text-white">
          <p class="text-xs uppercase tracking-[0.24em] text-gold">Niveau atteint</p>
          <h2 class="mt-2 font-display text-3xl">{{ quizService.result()?.levelTitle }}</h2>
          <p class="mt-3 text-lg">{{ quizService.result()?.badge }}</p>
          @if (quizService.result()?.pendingSync) {
            <p class="mt-4 text-sm text-white/75">
              Aucun réseau au moment de l'envoi: le score sera synchronisé automatiquement dès le retour en ligne.
            </p>
          }
        </div>

        <div class="space-y-4">
          <h3 class="font-display text-2xl text-royal">Prochaines recommandations</h3>
          @for (recommendation of quizService.result()?.recommendations ?? []; track recommendation.title) {
            <button type="button" (click)="retryRecommendation(recommendation)" class="block w-full rounded-[26px] border border-ink/10 bg-white/70 p-5 text-left transition hover:border-royal/20 hover:bg-white">
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-gold">{{ recommendation.focus }}</p>
              <h4 class="mt-2 font-display text-xl text-royal">{{ recommendation.title }}</h4>
              <p class="mt-2 text-sm text-ink/70">{{ recommendation.description }}</p>
            </button>
          }
        </div>

        <div class="flex flex-wrap gap-3">
          <button type="button" (click)="resetAndGoHome()" class="rounded-full bg-royal px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white">Retour au tableau de bord</button>
          <a routerLink="/leaderboard" class="rounded-full border border-ink/10 px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-ink">Voir les classements</a>
        </div>
      </section>
    } @else if (quizService.questions().length === 0) {
      <section class="glass-card space-y-6 p-8 text-center">
        <p class="gold-chip">Aucun quiz actif</p>
        <h1 class="section-title">Prépare une session depuis le tableau de bord</h1>
        <p class="text-sm text-ink/70">Choisis ton pseudo, ta zone et ton mode de jeu pour lancer le quiz.</p>
        <a routerLink="/" class="mx-auto inline-flex rounded-full bg-royal px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white">Retour</a>
      </section>
    } @else {
      <section class="grid gap-6 xl:grid-cols-[0.74fr_0.26fr]">
        <article class="glass-card overflow-hidden p-6 sm:p-8">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="gold-chip">{{ quizService.mode() === 'competition' ? 'Mode compétition' : 'Mode révision' }}</p>
              <h1 class="mt-4 font-display text-3xl text-royal">
                Question {{ quizService.currentIndex() + 1 }} / {{ quizService.questions().length }}
              </h1>
            </div>
            <div class="min-w-[220px]">
              <div class="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-ink/55">
                <span>Progression</span>
                <span>{{ quizService.progressPercent() }}%</span>
              </div>
              <div class="h-4 overflow-hidden rounded-full bg-ink/10">
                <div class="tunique-bar h-full animate-shimmer rounded-full" [style.width.%]="quizService.progressPercent()"></div>
              </div>
            </div>
          </div>

          @if (quizService.currentQuestion(); as question) {
            <div class="mt-8 rounded-[32px] bg-gradient-to-br from-white to-gold/10 p-6">
              <div class="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-ink/55">
                <span class="rounded-full bg-royal/10 px-3 py-1 text-royal">Chapitre {{ question.chapter }}</span>
                <span class="rounded-full bg-gold/15 px-3 py-1 text-gold">{{ question.difficulty }}</span>
                <span class="rounded-full bg-teal/10 px-3 py-1 text-teal">Zone {{ question.zone }}</span>
              </div>
              <h2 class="mt-5 text-2xl font-display leading-snug text-ink sm:text-3xl">{{ question.text }}</h2>

              <div class="mt-6 grid gap-3">
                @for (option of question.options; track option.key) {
                  <button
                    type="button"
                    [disabled]="!!quizService.feedback()"
                    (click)="selectOption(option.key)"
                    class="rounded-[24px] border px-5 py-4 text-left text-sm font-semibold transition sm:text-base"
                    [ngClass]="optionClass(option.key)">
                    <span class="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-xs font-extrabold text-royal">
                      {{ option.key }}
                    </span>
                    {{ option.text }}
                  </button>
                }
              </div>
            </div>
          }

          @if (quizService.feedback(); as feedback) {
            <div class="mt-6 rounded-[28px] border p-6" [class.border-emerald-200]="feedback.isCorrect" [class.bg-emerald-50]="feedback.isCorrect" [class.border-rose-200]="!feedback.isCorrect" [class.bg-rose-50]="!feedback.isCorrect">
              <p class="text-xs font-bold uppercase tracking-[0.18em]" [class.text-emerald-700]="feedback.isCorrect" [class.text-rose-700]="!feedback.isCorrect">
                {{ feedback.isCorrect ? 'Bonne réponse' : 'À renforcer' }}
              </p>
              <p class="mt-3 text-sm font-semibold text-ink">
                Verset clé: {{ feedback.verseReference }}
              </p>
              <p class="mt-2 text-sm leading-7 text-ink/75">{{ feedback.verseText }}</p>
              <p class="mt-4 rounded-2xl bg-white/75 p-4 text-sm text-ink/80">{{ feedback.explanation }}</p>

              <div class="mt-5 flex flex-wrap gap-3">
                <button type="button" (click)="nextQuestion()" class="rounded-full bg-royal px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white">
                  {{ quizService.currentIndex() === quizService.questions().length - 1 ? 'Voir le résultat' : 'Question suivante' }}
                </button>
              </div>
            </div>
          }
        </article>

        <aside class="space-y-4">
          <div class="rounded-[30px] bg-hero-glow p-5 text-white shadow-card">
            <p class="text-xs uppercase tracking-[0.18em] text-gold">Joueur</p>
            <h3 class="mt-3 font-display text-2xl">{{ progressService.pseudo() || 'Invité' }}</h3>
            <p class="mt-2 text-sm text-white/70">
              {{ progressService.profile()?.teamName ? 'Équipe: ' + progressService.profile()?.teamName : 'Aucune équipe liée' }}
            </p>
          </div>

          @if (quizService.mode() === 'competition' && quizService.selection(); as currentSelection) {
            <app-timer
              [durationSeconds]="currentSelection.timerSeconds"
              [resetToken]="quizService.currentIndex()"
              [paused]="!!quizService.feedback() || !!quizService.result()"
              (remainingMsChange)="remainingMs.set($event)"
              (expired)="handleExpired()"/>
          }

          <div class="glass-card p-5">
            <p class="text-xs uppercase tracking-[0.18em] text-ink/55">Stats live</p>
            <div class="mt-4 grid gap-3">
              <div class="rounded-[24px] bg-ink/5 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-ink/45">Réponses</p>
                <p class="mt-2 text-2xl font-extrabold text-ink">{{ quizService.answeredCount() }}/{{ quizService.questions().length }}</p>
              </div>
              <div class="rounded-[24px] bg-ink/5 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-ink/45">Score live</p>
                <p class="mt-2 text-2xl font-extrabold text-royal">{{ quizService.liveScore() }}</p>
              </div>
              <div class="rounded-[24px] bg-ink/5 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-ink/45">Niveau actuel</p>
                <p class="mt-2 font-display text-xl text-royal">{{ progressService.profile()?.levelTitle ?? 'Rêveur Novice' }}</p>
              </div>
              <div class="rounded-[24px] bg-ink/5 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-ink/45">Badge</p>
                <p class="mt-2 text-lg font-bold text-gold">{{ progressService.profile()?.badge ?? '🥉 Rêveur' }}</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    }
  `
})
export class QuizEngineComponent {
  readonly quizService = inject(QuizService);
  readonly progressService = inject(ProgressService);
  private readonly router = inject(Router);

  readonly remainingMs = signal(15_000);
  private questionStartedAt = performance.now();
  private pendingAdvance?: number;

  constructor() {
    const currentQuestion = this.quizService.currentQuestion();
    if (currentQuestion) {
      this.questionStartedAt = performance.now();
      this.remainingMs.set((this.quizService.selection()?.timerSeconds ?? 15) * 1_000);
    }
  }

  selectOption(optionKey: string): void {
    if (this.quizService.feedback()) {
      return;
    }

    this.quizService.answerCurrentQuestion(optionKey, Math.round(performance.now() - this.questionStartedAt));
    this.autoAdvanceIfNeeded();
  }

  handleExpired(): void {
    if (this.quizService.feedback()) {
      return;
    }

    const fallbackTime = (this.quizService.selection()?.timerSeconds ?? 15) * 1_000;
    this.quizService.answerCurrentQuestion('', fallbackTime);
    this.autoAdvanceIfNeeded();
  }

  nextQuestion(): void {
    window.clearTimeout(this.pendingAdvance);
    this.quizService.nextQuestion();
    this.questionStartedAt = performance.now();
    this.remainingMs.set((this.quizService.selection()?.timerSeconds ?? 15) * 1_000);
  }

  async resetAndGoHome(): Promise<void> {
    this.quizService.reset();
    await this.router.navigateByUrl('/');
  }

  async retryRecommendation(recommendation: { title: string; description: string; zone: number | null; chapterStart: number | null; chapterEnd: number | null; focus: string }): Promise<void> {
    const selection = this.quizService.buildRecommendationSelection(recommendation);
    if (!selection) {
      return;
    }

    await this.quizService.start(selection);
  }

  optionClass(optionKey: string): string {
    const feedback = this.quizService.feedback();
    if (!feedback) {
      return 'border-ink/10 bg-white/70 hover:border-royal/25 hover:bg-white';
    }

    if (feedback.correctOption === optionKey) {
      return 'border-emerald-300 bg-emerald-100 text-emerald-900';
    }

    const selectedOption = this.quizService.answers()[this.quizService.currentQuestion()!.id]?.selectedOption;
    if (selectedOption === optionKey && selectedOption !== feedback.correctOption) {
      return 'border-rose-300 bg-rose-100 text-rose-900';
    }

    return 'border-ink/10 bg-white/60 text-ink/55';
  }

  private autoAdvanceIfNeeded(): void {
    if (this.quizService.mode() !== 'competition') {
      return;
    }

    this.pendingAdvance = window.setTimeout(() => this.nextQuestion(), 1700);
  }
}
