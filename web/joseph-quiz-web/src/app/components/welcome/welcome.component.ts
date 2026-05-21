import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <article class="overflow-hidden rounded-[36px] bg-hero-glow p-6 text-white shadow-card sm:p-8">
        <p class="gold-chip bg-white/10 text-gold">Bienvenue</p>
        <h1 class="mt-5 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
          Entre ton pseudo pour rejoindre JOSEPH QUIZ.
        </h1>
        <p class="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
          Ton profil est prepare avant meme d'arriver au tableau de bord, pour demarrer plus vite et mieux repartir les chapitres.
        </p>

        <div class="mt-8 grid gap-4 sm:grid-cols-3">
          <div class="rounded-[28px] bg-white/10 p-5">
            <p class="text-xs uppercase tracking-[0.2em] text-gold">1</p>
            <p class="mt-3 font-display text-2xl">Identifie-toi</p>
            <p class="mt-2 text-sm text-white/75">Entre ton pseudo une seule fois sur cet appareil.</p>
          </div>
          <div class="rounded-[28px] bg-white/10 p-5">
            <p class="text-xs uppercase tracking-[0.2em] text-gold">2</p>
            <p class="mt-3 font-display text-2xl">Choisis ta mission</p>
            <p class="mt-2 text-sm text-white/75">Selectionne ton chapitre ou la plage qui t'est confiee.</p>
          </div>
          <div class="rounded-[28px] bg-white/10 p-5">
            <p class="text-xs uppercase tracking-[0.2em] text-gold">3</p>
            <p class="mt-3 font-display text-2xl">Lance le quiz</p>
            <p class="mt-2 text-sm text-white/75">Revision, competition et progression live sont deja prets.</p>
          </div>
        </div>
      </article>

      <aside class="glass-card p-6 sm:p-8">
        <p class="gold-chip">Acces joueur</p>
        <h2 class="mt-4 font-display text-3xl text-royal">Commencer</h2>
        <p class="mt-3 text-sm text-ink/65">
          Renseigne ton pseudo pour acceder au tableau de bord avec ton profil precharge.
        </p>

        <form class="mt-6 space-y-4" (ngSubmit)="continue()">
          <label class="block space-y-2 text-sm font-semibold text-ink/70">
            Pseudo
            <input
              [(ngModel)]="pseudo"
              name="pseudo"
              autocomplete="nickname"
              maxlength="40"
              class="w-full rounded-2xl border-0 bg-ink/5"
              placeholder="Ex. Epe"
            />
          </label>

          <button
            type="submit"
            class="w-full rounded-2xl bg-royal px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-ink">
            Entrer dans le dashboard
          </button>
        </form>

        @if (message) {
          <p class="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {{ message }}
          </p>
        }
      </aside>
    </section>
  `
})
export class WelcomeComponent {
  private readonly progressService = inject(ProgressService);
  private readonly router = inject(Router);

  pseudo = this.progressService.pseudo();
  message = '';

  constructor() {
    if (this.progressService.pseudo()) {
      void this.router.navigateByUrl('/dashboard');
    }
  }

  async continue(): Promise<void> {
    const normalizedPseudo = this.pseudo.trim();
    if (!normalizedPseudo) {
      this.message = 'Entre ton pseudo pour continuer.';
      return;
    }

    this.message = '';
    this.progressService.setPseudo(normalizedPseudo);
    await this.progressService.loadProfile();
    await this.router.navigateByUrl('/dashboard');
  }
}
