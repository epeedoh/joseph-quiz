import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TEAM_SUGGESTIONS, TeamLeaderboardEntry } from '../../core/models/quiz.models';
import { ProgressService } from '../../services/progress.service';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
      <article class="glass-card p-6 sm:p-8">
        <p class="gold-chip">Système d'équipes</p>
        <h1 class="mt-4 section-title">Créer ou rejoindre une équipe</h1>
        <p class="mt-3 max-w-2xl text-sm text-ink/70">
          Chaque réponse impacte le score individuel et le score collectif. Choisis ton camp et fais monter l'équipe.
        </p>

        <div class="mt-8 grid gap-5 lg:grid-cols-2">
          <form class="rounded-[28px] bg-ink/5 p-5" (ngSubmit)="createTeam()">
            <h2 class="font-display text-2xl text-royal">Créer une équipe</h2>
            <label class="mt-4 block space-y-2 text-sm font-semibold text-ink/70">
              Nom d'équipe
              <input [(ngModel)]="teamName" name="teamName" class="w-full rounded-2xl border-0 bg-white/85" />
            </label>

            <div class="mt-4 flex flex-wrap gap-2">
              @for (suggestion of teamSuggestions; track suggestion) {
                <button type="button" (click)="teamName = suggestion" class="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-royal transition hover:bg-royal hover:text-white">
                  {{ suggestion }}
                </button>
              }
            </div>

            <button type="submit" class="mt-5 w-full rounded-2xl bg-royal px-4 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white">
              Créer l'équipe
            </button>
          </form>

          <form class="rounded-[28px] bg-gold/10 p-5" (ngSubmit)="joinTeam()">
            <h2 class="font-display text-2xl text-royal">Rejoindre une équipe</h2>
            <label class="mt-4 block space-y-2 text-sm font-semibold text-ink/70">
              Code d'accès
              <input [(ngModel)]="joinCode" name="joinCode" class="w-full rounded-2xl border-0 bg-white/85 uppercase" maxlength="6" />
            </label>

            <button type="submit" class="mt-5 w-full rounded-2xl bg-wine px-4 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white">
              Rejoindre
            </button>
          </form>
        </div>

        @if (message()) {
          <div class="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            {{ message() }}
          </div>
        }

        @if (error()) {
          <div class="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            {{ error() }}
          </div>
        }
      </article>

      <aside class="glass-card p-6">
        <p class="gold-chip">Mon statut</p>
        <h2 class="mt-4 font-display text-2xl text-royal">{{ progressService.profile()?.teamName ?? 'Pas encore d’équipe' }}</h2>
        <p class="mt-3 text-sm text-ink/70">
          Le profil {{ progressService.pseudo() || 'local' }} cumule ses points dès qu'une équipe est associée.
        </p>
        <a routerLink="/leaderboard" class="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white">Voir le classement</a>
      </aside>
    </section>

    <section class="mt-6">
      <div class="glass-card p-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="gold-chip">Leaderboard équipes</p>
            <h2 class="mt-4 section-title">Les collectifs en tête</h2>
          </div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          @for (team of leaderboard(); track team.rank) {
            <article class="rounded-[26px] border border-ink/10 bg-white/70 p-5">
              <p class="text-xs uppercase tracking-[0.18em] text-gold">#{{ team.rank }}</p>
              <h3 class="mt-2 font-display text-2xl text-royal">{{ team.teamName }}</h3>
              <p class="mt-1 text-sm text-ink/60">{{ team.memberCount }} membres</p>
              <div class="mt-4 grid grid-cols-2 gap-3">
                <div class="rounded-[18px] bg-ink/5 p-3">
                  <p class="text-[10px] uppercase tracking-[0.18em] text-ink/45">Score</p>
                  <p class="mt-1 text-lg font-extrabold text-ink">{{ team.totalScore }}</p>
                </div>
                <div class="rounded-[18px] bg-ink/5 p-3">
                  <p class="text-[10px] uppercase tracking-[0.18em] text-ink/45">XP</p>
                  <p class="mt-1 text-lg font-extrabold text-gold">{{ team.totalXp }}</p>
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `
})
export class TeamComponent implements OnInit {
  readonly progressService = inject(ProgressService);
  private readonly teamService = inject(TeamService);

  readonly teamSuggestions = TEAM_SUGGESTIONS;
  readonly message = signal('');
  readonly error = signal('');
  readonly leaderboard = signal<TeamLeaderboardEntry[]>([]);

  teamName = TEAM_SUGGESTIONS[0];
  joinCode = '';

  async ngOnInit(): Promise<void> {
    await this.loadLeaderboard();
  }

  async createTeam(): Promise<void> {
    this.error.set('');
    this.message.set('');

    try {
      const response = await this.teamService.createTeam(this.progressService.pseudo(), this.teamName).toPromise();
      this.message.set(`Équipe ${response?.name} créée. Code d'accès: ${response?.joinCode}`);
      await this.progressService.loadProfile();
      await this.loadLeaderboard();
    } catch (error: unknown) {
      this.error.set(this.resolveError(error));
    }
  }

  async joinTeam(): Promise<void> {
    this.error.set('');
    this.message.set('');

    try {
      const response = await this.teamService.joinTeam(this.progressService.pseudo(), this.joinCode.toUpperCase()).toPromise();
      this.message.set(`Tu as rejoint l'équipe ${response?.name}.`);
      await this.progressService.loadProfile();
      await this.loadLeaderboard();
    } catch (error: unknown) {
      this.error.set(this.resolveError(error));
    }
  }

  private async loadLeaderboard(): Promise<void> {
    this.leaderboard.set((await this.teamService.loadLeaderboard().toPromise()) ?? []);
  }

  private resolveError(error: unknown): string {
    const maybeError = error as { error?: { title?: string; message?: string } };
    return maybeError?.error?.title ?? maybeError?.error?.message ?? 'Une erreur est survenue.';
  }
}
