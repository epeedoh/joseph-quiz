import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { QuizSelection, ZONE_CATALOG } from '../../core/models/quiz.models';

@Component({
  selector: 'app-chapter-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="glass-card space-y-6 p-5 sm:p-7">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="gold-chip">Selection intelligente</p>
          <h3 class="mt-3 text-xl font-display text-royal">Choisis ton terrain d'entrainement</h3>
        </div>
        <p class="hidden max-w-xs text-sm text-ink/60 sm:block">
          Zone, chapitre, plage, questions ratees ou non jouees: tout est pret pour une revision ciblee.
        </p>
      </div>

      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        @for (zone of zones; track zone.id) {
          <button
            type="button"
            (click)="update({ zone: zone.id, chapter: null, chapterStart: null, chapterEnd: null }, true)"
            class="rounded-[24px] border p-4 text-left transition"
            [ngClass]="selection.zone === zone.id ? 'border-royal bg-royal text-white' : 'border-ink/10 bg-white/70'">
            <p class="text-2xl">{{ zone.icon }}</p>
            <p class="mt-3 font-display text-lg">{{ zone.title }}</p>
            <p class="text-sm opacity-80">{{ zone.subtitle }}</p>
            <p class="mt-2 text-xs uppercase tracking-[0.18em] opacity-70">{{ zone.chapters }}</p>
          </button>
        }
      </div>

      <div class="rounded-[30px] border border-gold/20 bg-gradient-to-r from-gold/10 via-white to-white p-5 shadow-[0_18px_50px_rgba(198,157,38,0.08)]">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="max-w-2xl">
            <p class="text-xs font-bold uppercase tracking-[0.22em] text-gold">Chapitre cible</p>
            <h4 class="mt-3 font-display text-2xl text-royal">Choisis ici un chapitre unique ou une plage de revision</h4>
            <p class="mt-2 text-sm text-ink/65">
              Cette zone definit exactement sur quoi le quiz doit porter. Si tu saisis un chapitre ou une plage ici, la zone biblique au-dessus devient secondaire.
            </p>
          </div>

          <div class="rounded-[22px] border border-royal/10 bg-white/80 px-4 py-3 text-sm text-ink/70">
            <p class="font-semibold text-royal">Selection active</p>
            <p class="mt-1">{{ selectionSummary() }}</p>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-2">
          @for (chapter of chapterOptions; track chapter) {
            <button
              type="button"
              (click)="selectSingleChapter(chapter)"
              class="rounded-full px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] transition"
              [ngClass]="selection.chapter === chapter ? 'bg-royal text-white shadow-md' : 'bg-white text-royal ring-1 ring-royal/15 hover:bg-royal/5'">
              Chap. {{ chapter }}
            </button>
          }
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-3">
          <label class="rounded-[24px] bg-white/80 p-4 shadow-sm ring-1 ring-ink/5">
            <span class="block text-sm font-semibold text-ink/70">Chapitre unique</span>
            <span class="mt-1 block text-xs text-ink/55">Exemple: 40 pour travailler uniquement Genese 40.</span>
            <input
              type="number"
              min="37"
              max="50"
              class="mt-3 w-full rounded-2xl border-0 bg-ink/5"
              [ngModel]="selection.chapter"
              (ngModelChange)="update({ chapter: $event ? +$event : null, zone: null, chapterStart: null, chapterEnd: null }, true)" />
          </label>

          <label class="rounded-[24px] bg-white/80 p-4 shadow-sm ring-1 ring-ink/5">
            <span class="block text-sm font-semibold text-ink/70">Debut de plage</span>
            <span class="mt-1 block text-xs text-ink/55">Exemple: 42 pour demarrer la plage sur Genese 42.</span>
            <input
              type="number"
              min="37"
              max="50"
              class="mt-3 w-full rounded-2xl border-0 bg-ink/5"
              [ngModel]="selection.chapterStart"
              (ngModelChange)="update({ chapterStart: $event ? +$event : null, chapter: null, zone: null }, true)" />
          </label>

          <label class="rounded-[24px] bg-white/80 p-4 shadow-sm ring-1 ring-ink/5">
            <span class="block text-sm font-semibold text-ink/70">Fin de plage</span>
            <span class="mt-1 block text-xs text-ink/55">Exemple: 45 pour terminer la plage sur Genese 45.</span>
            <input
              type="number"
              min="37"
              max="50"
              class="mt-3 w-full rounded-2xl border-0 bg-ink/5"
              [ngModel]="selection.chapterEnd"
              (ngModelChange)="update({ chapterEnd: $event ? +$event : null, chapter: null, zone: null }, true)" />
          </label>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
        <label class="flex items-center justify-between rounded-[24px] bg-ink/5 px-4 py-3">
          <span>
            <span class="block text-sm font-semibold text-ink">Rejouer mes erreurs</span>
            <span class="text-xs text-ink/60">Priorise les points faibles frequents</span>
          </span>
          <input type="checkbox" class="rounded text-royal" [ngModel]="selection.includeErrors" (ngModelChange)="update({ includeErrors: !!$event })" />
        </label>

        <label class="flex items-center justify-between rounded-[24px] bg-ink/5 px-4 py-3">
          <span>
            <span class="block text-sm font-semibold text-ink">Questions non jouees</span>
            <span class="text-xs text-ink/60">Varie les angles de revision</span>
          </span>
          <input type="checkbox" class="rounded text-royal" [ngModel]="selection.includeUnplayed" (ngModelChange)="update({ includeUnplayed: !!$event })" />
        </label>

        <label class="space-y-2 rounded-[24px] bg-ink/5 px-4 py-3 text-sm font-semibold text-ink/70">
          Nombre de questions
          <input type="range" min="5" max="20" step="1" class="w-full accent-royal" [ngModel]="selection.limit" (ngModelChange)="update({ limit: +$event })" />
          <div class="flex items-center justify-between text-xs uppercase tracking-[0.18em]">
            <span>5</span>
            <span>{{ selection.limit }} questions</span>
            <span>20</span>
          </div>
        </label>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-semibold text-ink/60">Timer competition</span>
        @for (timer of [10, 15, 20]; track timer) {
          <button
            type="button"
            (click)="update({ timerSeconds: timer })"
            class="rounded-full px-4 py-2 text-sm font-semibold transition"
            [class.bg-wine]="selection.timerSeconds === timer"
            [class.text-white]="selection.timerSeconds === timer"
            [class.bg-white]="selection.timerSeconds !== timer">
            {{ timer }}s
          </button>
        }
      </div>
    </section>
  `
})
export class ChapterSelectorComponent {
  @Input({ required: true }) selection!: QuizSelection;
  @Output() readonly selectionChange = new EventEmitter<QuizSelection>();
  @Output() readonly launchPromptRequested = new EventEmitter<void>();

  readonly zones = ZONE_CATALOG;
  readonly chapterOptions = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

  selectionSummary(): string {
    if (this.selection.chapter) {
      return `Chapitre ${this.selection.chapter}`;
    }

    if (this.selection.chapterStart && this.selection.chapterEnd) {
      return `Plage ${this.selection.chapterStart} a ${this.selection.chapterEnd}`;
    }

    if (this.selection.zone) {
      const zone = this.zones.find((item) => item.id === this.selection.zone);
      return zone ? `${zone.title} - ${zone.chapters}` : 'Zone selectionnee';
    }

    return 'Aucune cible precisee pour le moment';
  }

  selectSingleChapter(chapter: number): void {
    this.update(
      {
        chapter,
        chapterStart: null,
        chapterEnd: null,
        zone: null
      },
      true
    );
  }

  update(partial: Partial<QuizSelection>, triggerLaunchPrompt = false): void {
    this.selectionChange.emit({
      ...this.selection,
      ...partial
    });

    if (triggerLaunchPrompt) {
      this.launchPromptRequested.emit();
    }
  }
}
