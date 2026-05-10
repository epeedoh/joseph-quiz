import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LeaderboardService } from '../../services/leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="space-y-6">
      <div class="glass-card p-6 sm:p-8">
        <p class="gold-chip">Compétitif & collaboratif</p>
        <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="section-title">Classements</h1>
            <p class="mt-2 max-w-2xl text-sm text-ink/70">
              Compare les joueurs, mesure la progression des équipes et alimente l'esprit de saine compétition.
            </p>
          </div>

          <div class="flex gap-2 rounded-full bg-ink/5 p-1">
            <button type="button" (click)="tab.set('players')" class="rounded-full px-4 py-2 text-sm font-semibold transition" [class.bg-royal]="tab() === 'players'" [class.text-white]="tab() === 'players'">Joueurs</button>
            <button type="button" (click)="tab.set('teams')" class="rounded-full px-4 py-2 text-sm font-semibold transition" [class.bg-royal]="tab() === 'teams'" [class.text-white]="tab() === 'teams'">Équipes</button>
          </div>
        </div>
      </div>

      @if (leaderboardService.loading()) {
        <div class="glass-card p-10 text-center">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gold/30 border-t-royal"></div>
          <p class="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-royal">Mise à jour des scores...</p>
        </div>
      } @else if (tab() === 'players') {
        <div class="grid gap-4">
          @for (entry of leaderboardService.individual(); track entry.rank) {
            <article class="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-4">
                <div class="flex h-14 w-14 items-center justify-center rounded-full bg-royal text-xl font-extrabold text-white">#{{ entry.rank }}</div>
                <div>
                  <h2 class="font-display text-2xl text-royal">{{ entry.pseudo }}</h2>
                  <p class="text-sm text-ink/60">{{ entry.teamName || 'Sans équipe' }}</p>
                </div>
              </div>
              <div class="grid gap-2 sm:grid-cols-3 sm:gap-6">
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-ink/45">Score</p>
                  <p class="text-xl font-extrabold text-ink">{{ entry.totalScore }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-ink/45">XP</p>
                  <p class="text-xl font-extrabold text-gold">{{ entry.totalXp }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-ink/45">Combo</p>
                  <p class="text-xl font-extrabold text-wine">{{ entry.bestCombo }}</p>
                </div>
              </div>
            </article>
          }
        </div>
      } @else {
        <div class="grid gap-4 md:grid-cols-2">
          @for (team of leaderboardService.teams(); track team.rank) {
            <article class="glass-card p-5">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-gold">#{{ team.rank }}</p>
                  <h2 class="mt-2 font-display text-2xl text-royal">{{ team.teamName }}</h2>
                  <p class="mt-1 text-sm text-ink/60">Code d'accès: <span class="font-bold text-ink">{{ team.joinCode }}</span></p>
                </div>
                <span class="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold">{{ team.memberCount }} membres</span>
              </div>
              <div class="mt-5 grid grid-cols-2 gap-3">
                <div class="rounded-[20px] bg-ink/5 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-ink/45">Score collectif</p>
                  <p class="mt-2 text-2xl font-extrabold text-ink">{{ team.totalScore }}</p>
                </div>
                <div class="rounded-[20px] bg-ink/5 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-ink/45">XP collectif</p>
                  <p class="mt-2 text-2xl font-extrabold text-gold">{{ team.totalXp }}</p>
                </div>
              </div>
            </article>
          }
        </div>
      }

      <div class="flex justify-end">
        <a routerLink="/team" class="rounded-full bg-royal px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white">Gérer mon équipe</a>
      </div>
    </section>
  `
})
export class LeaderboardComponent implements OnInit {
  readonly leaderboardService = inject(LeaderboardService);
  readonly tab = signal<'players' | 'teams'>('players');

  async ngOnInit(): Promise<void> {
    await this.leaderboardService.loadAll();
  }
}
