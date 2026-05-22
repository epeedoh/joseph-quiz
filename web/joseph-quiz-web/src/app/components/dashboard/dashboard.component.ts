import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
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
              Exerce-toi pour te distinguer
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
              <p class="text-xs uppercase tracking-[0.25em] text-gold">Tableau express</p>
              <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div class="rounded-2xl bg-white/10 p-4">
                  <p class="text-white/65">Score total</p>
                  <p class="mt-2 text-2xl font-extrabold">{{ progressService.profile()?.totalScore ?? 0 }}</p>
                </div>
                <div class="rounded-2xl bg-white/10 p-4">
                  <p class="text-white/65">Precision</p>
                  <p class="mt-2 text-2xl font-extrabold">{{ ((progressService.profile()?.accuracy ?? 0) * 100) | number:'1.0-0' }}%</p>
                </div>
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
            <p class="text-xs uppercase tracking-[0.18em] text-ink/55">Mode actif</p>
            <p class="mt-2 font-display text-xl text-royal">{{ selection().mode === 'competition' ? 'Competition' : 'Revision' }}</p>
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
      <app-chapter-selector
        [selection]="selection()"
        (selectionChange)="selection.set($event)"
        (launchPromptRequested)="openLaunchHelp()" />
    </section>

    @if (launchHelpOpen()) {
      <div class="fixed inset-0 z-[70] bg-ink/45 backdrop-blur-sm" (click)="closeLaunchHelp()">
        <div class="flex min-h-screen items-center justify-center p-4 sm:p-6">
          <article
            class="w-full max-w-3xl rounded-[34px] border border-gold/20 bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.18)] sm:p-8"
            (click)="$event.stopPropagation()">
            <div class="flex items-start justify-between gap-4">
              <div class="max-w-2xl">
                <p class="gold-chip">Etape suivante</p>
                <h2 class="mt-4 font-display text-3xl text-royal sm:text-4xl">Ta selection est prete: lance maintenant le quiz</h2>
                <p class="mt-3 text-sm text-ink/65 sm:text-base">
                  Apres avoir choisi la zone, le chapitre ou la plage, clique sur l'un des boutons ci-dessous pour demarrer ta session.
                </p>
              </div>

              <button
                type="button"
                (click)="closeLaunchHelp()"
                class="rounded-full border border-ink/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.16em] text-ink/55 transition hover:border-royal/20 hover:text-royal">
                Fermer
              </button>
            </div>

            <div class="mt-6 grid gap-4 rounded-[28px] border border-gold/15 bg-gradient-to-r from-gold/10 via-white to-white p-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.2em] text-gold">Selection active</p>
                <p class="mt-3 font-display text-2xl text-royal">{{ currentSelectionSummary() }}</p>
                <p class="mt-2 text-sm text-ink/65">
                  Revision pour t'entrainer sereinement ou competition pour jouer avec chrono et pression.
                </p>
              </div>

              <div class="flex flex-col gap-3">
                <button
                  type="button"
                  (click)="launch('revision')"
                  class="rounded-full bg-royal px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white transition hover:bg-ink"
                >
                  Lancer une revision
                </button>
                <button
                  type="button"
                  (click)="launch('competition')"
                  class="rounded-full border border-royal/20 bg-white px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-royal transition hover:bg-royal hover:text-white"
                >
                  Mode competition
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    }

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
export class DashboardComponent implements OnInit {
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
  readonly launchHelpOpen = signal(false);
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

  async ngOnInit(): Promise<void> {
    await this.progressService.refreshProfile();
  }

  async savePseudo(): Promise<boolean> {
    return this.persistPseudo(true);
  }

  openLaunchHelp(): void {
    this.launchHelpOpen.set(true);
  }

  closeLaunchHelp(): void {
    this.launchHelpOpen.set(false);
  }

  currentSelectionSummary(): string {
    const selection = this.selection();

    if (selection.chapter) {
      return `Chapitre ${selection.chapter}`;
    }

    if (selection.chapterStart && selection.chapterEnd) {
      return `Plage ${selection.chapterStart} a ${selection.chapterEnd}`;
    }

    if (selection.zone) {
      const zone = this.zones.find((item) => item.id === selection.zone);
      return zone ? `${zone.title} - ${zone.chapters}` : 'Selection en cours';
    }

    return 'Selection en cours';
  }

  async launch(mode: QuizMode): Promise<void> {
    if (!(await this.persistPseudo(false))) {
      this.saveState.set('error');
      this.saveMessage.set('Saisis d abord ton pseudo avant de lancer le quiz.');
      return;
    }

    const nextSelection = { ...this.selection(), pseudo: this.pseudo.trim(), mode };
    this.selection.set(nextSelection);
    this.closeLaunchHelp();
    const started = await this.quizService.start(nextSelection);
    if (!started) {
      this.saveState.set('error');
      this.saveMessage.set("Aucune question n'a ete trouvee pour cette selection. Ajuste le chapitre ou la plage puis relance.");
      return;
    }
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
    const started = await this.quizService.start(baseSelection);
    if (!started) {
      this.saveState.set('error');
      this.saveMessage.set("Aucune question n'a ete trouvee pour cette recommandation.");
      return;
    }
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

    await this.progressService.refreshProfile();
    return true;
  }
}
