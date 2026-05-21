import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { QuizMode, QuizSelection, ZONE_CATALOG } from '../../core/models/quiz.models';
import { ProgressService } from '../../services/progress.service';
import { QuizService } from '../../services/quiz.service';
import { ChapterSelectorComponent } from '../chapter-selector/chapter-selector.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ChapterSelectorComponent],
  template: `
    <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <article class="overflow-hidden rounded-[36px] bg-hero-glow p-6 text-white shadow-card sm:p-8">
        <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-2xl">
            <p class="gold-chip bg-white/10 text-gold">Genese 37 a 50 - Louis Segond 1910</p>
            <h1 class="mt-5 max-w-xl font-display text-4xl leading-tight sm:text-5xl">
              Forme-toi pour te distinguer, mobile et hors ligne.
            </h1>
            <p class="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
              Revision intelligente, mode competition
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                (click)="launch('revision')"
                class="rounded-full bg-white px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-royal transition hover:-translate-y-0.5"
              >
                Lancer une revision
              </button>
              <button
                type="button"
                (click)="launch('competition')"
                class="rounded-full border border-white/30 px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
              >
                Mode competition
              </button>
            </div>
          </div>

          <div class="grid gap-4">
            <div class="glass-card min-w-[280px] overflow-hidden bg-white/15 p-5 text-white">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-xs uppercase tracking-[0.25em] text-gold">Illustration centrale</p>
                  <p class="font-display text-2xl">Joseph</p>
                </div>
                <span class="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                  Reves · Elevation
                </span>
              </div>

              <img
                src="assets/brand/joseph-illustration.svg"
                alt="Illustration de Joseph"
                class="mt-4 h-56 w-full rounded-[28px] bg-white/10 object-cover p-3 shadow-inner shadow-ink/10"
              />

              <p class="mt-4 text-sm text-white/75">
                Du champ a la cour d'Egypte, le parcours de Joseph structure tout le quiz et donne le ton de l'experience.
              </p>
            </div>

            <div class="glass-card bg-white/10 p-5 text-white">
              <p class="text-xs uppercase tracking-[0.25em] text-gold">Tunique-o-metre</p>
              <div class="mt-3 h-4 overflow-hidden rounded-full bg-white/15">
                <div class="tunique-bar h-full animate-shimmer rounded-full" [style.width.%]="progressService.tuniqueProgress()"></div>
              </div>
              <div class="mt-4 flex items-center justify-between text-sm">
                <span>{{ progressService.profile()?.badge ?? '🥉 Reveur' }}</span>
                <span>{{ progressService.profile()?.totalXp ?? 0 }} XP</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <aside class="glass-card p-6">
        <p class="gold-chip">Authentification legere</p>
        <h2 class="mt-4 font-display text-2xl text-royal">Ton profil joueur</h2>
        <p class="mt-2 text-sm text-ink/60">
          Profil actif:
          <span class="font-semibold text-royal">{{ progressService.profile()?.pseudo ?? (progressService.pseudo() || 'aucun') }}</span>
        </p>

        <form class="mt-5 space-y-4" (ngSubmit)="savePseudo()">
          <label class="block space-y-2 text-sm font-semibold text-ink/70">
            Pseudo
            <input
              [(ngModel)]="pseudo"
              name="pseudo"
              autocomplete="nickname"
              maxlength="40"
              class="w-full rounded-2xl border-0 bg-ink/5"
              placeholder="Ex. JosephVisionnaire"
            />
          </label>

          <button
            type="submit"
            [disabled]="progressService.loading()"
            class="w-full rounded-2xl bg-royal px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ progressService.loading() ? 'Synchronisation...' : 'Sauvegarder le pseudo' }}
          </button>

          @if (saveMessage()) {
            <p
              class="rounded-2xl px-4 py-3 text-sm font-medium"
              [class.bg-emerald-50]="saveState() === 'success'"
              [class.text-emerald-700]="saveState() === 'success'"
              [class.bg-red-50]="saveState() === 'error'"
              [class.text-red-700]="saveState() === 'error'"
            >
              {{ saveMessage() }}
            </p>
          }
        </form>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div class="rounded-[24px] bg-ink/5 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-ink/55">Niveau</p>
            <p class="mt-2 font-display text-xl text-royal">{{ progressService.profile()?.levelTitle ?? 'Reveur Novice' }}</p>
          </div>
          <div class="rounded-[24px] bg-ink/5 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-ink/55">Equipe</p>
            <p class="mt-2 font-display text-xl text-royal">{{ progressService.profile()?.teamName ?? 'Aucune' }}</p>
          </div>
          <div class="rounded-[24px] bg-ink/5 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-ink/55">Score total</p>
            <p class="mt-2 text-2xl font-extrabold text-ink">{{ progressService.profile()?.totalScore ?? 0 }}</p>
          </div>
          <div class="rounded-[24px] bg-ink/5 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-ink/55">Precision</p>
            <p class="mt-2 text-2xl font-extrabold text-ink">{{ ((progressService.profile()?.accuracy ?? 0) * 100) | number:'1.0-0' }}%</p>
          </div>
        </div>
      </aside>
    </section>

    <section class="mt-6">
      <app-chapter-selector [selection]="selection()" (selectionChange)="selection.set($event)" />
    </section>

    <section class="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <article class="glass-card p-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="gold-chip">Zones bibliques</p>
            <h2 class="mt-4 section-title">Parcours Joseph</h2>
          </div>
          <a
            routerLink="/leaderboard"
            class="rounded-full bg-ink/5 px-4 py-2 text-sm font-semibold text-royal transition hover:bg-ink hover:text-white"
          >
            Voir les classements
          </a>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          @for (zone of zones; track zone.id) {
            <div class="rounded-[28px] border border-ink/10 bg-white/60 p-5">
              <div class="flex items-center justify-between">
                <span class="text-3xl">{{ zone.icon }}</span>
                <span class="rounded-full bg-royal/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-royal">
                  {{ zone.chapters }}
                </span>
              </div>
              <h3 class="mt-4 font-display text-xl text-royal">{{ zone.title }}</h3>
              <p class="mt-2 text-sm text-ink/70">{{ zone.subtitle }}</p>
            </div>
          }
        </div>
      </article>

      <article class="glass-card p-6">
        <p class="gold-chip">Revision intelligente</p>
        <h2 class="mt-4 section-title">Suggestions adaptatives</h2>
        <div class="mt-6 space-y-4">
          @for (tip of progressService.profile()?.recommendations ?? defaultRecommendations; track tip.title) {
            <button
              type="button"
              (click)="launchRecommendation(tip)"
              class="block w-full rounded-[26px] border border-gold/20 bg-gradient-to-r from-gold/10 to-white p-5 text-left transition hover:-translate-y-0.5 hover:border-royal/20"
            >
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-gold">{{ tip.focus }}</p>
              <h3 class="mt-2 font-display text-xl text-royal">{{ tip.title }}</h3>
              <p class="mt-2 text-sm text-ink/70">{{ tip.description }}</p>
            </button>
          }
        </div>
      </article>
    </section>
  `
})
export class DashboardComponent {
  readonly progressService = inject(ProgressService);
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);

  readonly zones = ZONE_CATALOG;
  readonly selection = signal<QuizSelection>({
    pseudo: this.progressService.pseudo() || '',
    zone: 1,
    chapter: null,
    chapterStart: null,
    chapterEnd: null,
    includeErrors: false,
    includeUnplayed: false,
    limit: 10,
    timerSeconds: 15,
    mode: 'revision'
  });

  pseudo = this.progressService.pseudo();
  readonly saveState = signal<'idle' | 'success' | 'error'>('idle');
  readonly saveMessage = signal('');
  readonly defaultRecommendations = [
    {
      title: 'Demarrer avec la Zone 1',
      description: 'Installe la chronologie des reves et de la trahison avant de monter en intensite.',
      zone: 1,
      chapterStart: 37,
      chapterEnd: 38,
      focus: 'Fondation'
    }
  ];

  constructor() {
    if (!this.progressService.pseudo()) {
      void this.router.navigateByUrl('/');
    }

    effect(() => {
      const pseudo = this.progressService.pseudo();
      if (pseudo) {
        this.pseudo = pseudo;
        this.selection.update((selection) => ({ ...selection, pseudo }));
      } else {
        this.pseudo = '';
        this.selection.update((selection) => ({ ...selection, pseudo: '' }));
      }
    });
  }

  async savePseudo(): Promise<boolean> {
    return this.persistPseudo(true);
  }

  async launch(mode: QuizMode): Promise<void> {
    if (!(await this.persistPseudo(false))) {
      this.saveState.set('error');
      this.saveMessage.set('Saisis d abord ton pseudo avant de lancer le quiz.');
      return;
    }

    const nextSelection = { ...this.selection(), pseudo: this.pseudo.trim(), mode };
    this.selection.set(nextSelection);
    await this.quizService.start(nextSelection);
    await this.router.navigateByUrl('/quiz');
  }

  async launchRecommendation(recommendation: {
    zone: number | null;
    chapterStart: number | null;
    chapterEnd: number | null;
    title: string;
    description: string;
    focus: string;
  }): Promise<void> {
    const baseSelection = this.quizService.buildRecommendationSelection(recommendation);
    if (!baseSelection) {
      return;
    }

    this.selection.set(baseSelection);
    await this.quizService.start(baseSelection);
    await this.router.navigateByUrl('/quiz');
  }

  private async persistPseudo(showFeedback: boolean): Promise<boolean> {
    const normalizedPseudo = this.pseudo.trim();
    if (!normalizedPseudo) {
      if (showFeedback) {
        this.saveState.set('error');
        this.saveMessage.set('Saisis un pseudo avant de continuer.');
      }

      return false;
    }

    this.pseudo = normalizedPseudo;
    this.progressService.setPseudo(normalizedPseudo);
    this.selection.update((selection) => ({ ...selection, pseudo: normalizedPseudo }));

    if (showFeedback) {
      this.saveState.set('success');
      this.saveMessage.set(
        this.progressService.online()
          ? `Pseudo ${normalizedPseudo} sauvegarde sur cet appareil.`
          : `Pseudo ${normalizedPseudo} sauvegarde hors ligne sur cet appareil.`
      );
    }

    await this.progressService.loadProfile();
    return true;
  }
}
