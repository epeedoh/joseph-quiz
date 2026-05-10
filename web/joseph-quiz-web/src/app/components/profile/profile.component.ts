import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (!progressService.profile()) {
      <section class="glass-card space-y-5 p-8 text-center">
        <p class="gold-chip">Profil vide</p>
        <h1 class="section-title">Aucun historique pour le moment</h1>
        <p class="text-sm text-ink/70">Lance un premier quiz pour voir apparaître ton niveau, tes badges et tes recommandations.</p>
        <a routerLink="/" class="mx-auto inline-flex rounded-full bg-royal px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white">Démarrer</a>
      </section>
    } @else {
      <section class="space-y-6">
        <div class="grid gap-6 xl:grid-cols-[0.62fr_0.38fr]">
          <article class="glass-card p-6 sm:p-8">
            <p class="gold-chip">Profil joueur</p>
            <h1 class="mt-4 section-title">{{ progressService.profile()?.pseudo }}</h1>
            <p class="mt-3 text-sm text-ink/70">
              {{ progressService.profile()?.badge }} · {{ progressService.profile()?.levelTitle }}
            </p>

            <div class="mt-6 h-5 overflow-hidden rounded-full bg-ink/10">
              <div class="tunique-bar h-full animate-shimmer rounded-full" [style.width.%]="progressService.tuniqueProgress()"></div>
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div class="rounded-[24px] bg-ink/5 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-ink/45">XP total</p>
                <p class="mt-2 text-2xl font-extrabold text-gold">{{ progressService.profile()?.totalXp }}</p>
              </div>
              <div class="rounded-[24px] bg-ink/5 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-ink/45">Score</p>
                <p class="mt-2 text-2xl font-extrabold text-ink">{{ progressService.profile()?.totalScore }}</p>
              </div>
              <div class="rounded-[24px] bg-ink/5 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-ink/45">Précision</p>
                <p class="mt-2 text-2xl font-extrabold text-ink">{{ ((progressService.profile()?.accuracy ?? 0) * 100) | number:'1.0-0' }}%</p>
              </div>
              <div class="rounded-[24px] bg-ink/5 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-ink/45">Meilleur combo</p>
                <p class="mt-2 text-2xl font-extrabold text-wine">{{ progressService.profile()?.bestCombo }}</p>
              </div>
            </div>
          </article>

          <aside class="glass-card p-6">
            <p class="gold-chip">Synthèse</p>
            <h2 class="mt-4 font-display text-2xl text-royal">Lecture rapide</h2>
            <div class="mt-6 space-y-4 text-sm text-ink/70">
              <p>Équipe actuelle: <span class="font-bold text-ink">{{ progressService.profile()?.teamName || 'Aucune' }}</span></p>
              <p>Temps de réponse moyen: <span class="font-bold text-ink">{{ progressService.profile()?.averageResponseTimeMs | number:'1.0-0' }} ms</span></p>
              <p>Le tunique-o-mètre suit la montée en niveau, la réussite et l'élan compétitif.</p>
            </div>
          </aside>
        </div>

        <section class="grid gap-6 xl:grid-cols-[0.56fr_0.44fr]">
          <article class="glass-card p-6">
            <p class="gold-chip">Révision intelligente</p>
            <h2 class="mt-4 section-title">Recommandations</h2>
            <div class="mt-6 space-y-4">
              @for (recommendation of progressService.profile()?.recommendations ?? []; track recommendation.title) {
                <div class="rounded-[24px] border border-ink/10 bg-white/70 p-5">
                  <p class="text-xs font-bold uppercase tracking-[0.18em] text-gold">{{ recommendation.focus }}</p>
                  <h3 class="mt-2 font-display text-xl text-royal">{{ recommendation.title }}</h3>
                  <p class="mt-2 text-sm text-ink/70">{{ recommendation.description }}</p>
                </div>
              }
            </div>
          </article>

          <article class="glass-card p-6">
            <p class="gold-chip">Historique</p>
            <h2 class="mt-4 section-title">Dernières sessions</h2>
            <div class="mt-6 space-y-4">
              @for (score of progressService.profile()?.recentScores ?? []; track score.id) {
                <div class="rounded-[24px] bg-ink/5 p-4">
                  <div class="flex items-center justify-between gap-4">
                    <p class="font-display text-xl text-royal">{{ score.mode }}</p>
                    <span class="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-ink/60">Zone {{ score.zone ?? 'mixte' }}</span>
                  </div>
                  <div class="mt-3 flex items-center justify-between text-sm text-ink/70">
                    <span>{{ score.correctAnswers }}/{{ score.totalQuestions }} bonnes réponses</span>
                    <span>{{ score.points }} pts</span>
                  </div>
                </div>
              }
            </div>
          </article>
        </section>
      </section>
    }
  `
})
export class ProfileComponent implements OnInit {
  readonly progressService = inject(ProgressService);

  async ngOnInit(): Promise<void> {
    await this.progressService.loadProfile();
  }
}
