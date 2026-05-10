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
          <p class="gold-chip">Sélection intelligente</p>
          <h3 class="mt-3 text-xl font-display text-royal">Choisis ton terrain d'entraînement</h3>
        </div>
        <p class="hidden max-w-xs text-sm text-ink/60 sm:block">
          Zone, chapitre, plage, questions ratées ou non jouées: tout est prêt pour une révision ciblée.
        </p>
      </div>

      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        @for (zone of zones; track zone.id) {
          <button
            type="button"
            (click)="update({ zone: zone.id, chapter: null, chapterStart: null, chapterEnd: null })"
            class="rounded-[24px] border p-4 text-left transition"
            [ngClass]="selection.zone === zone.id ? 'border-royal bg-royal text-white' : 'border-ink/10 bg-white/70'">
            <p class="text-2xl">{{ zone.icon }}</p>
            <p class="mt-3 font-display text-lg">{{ zone.title }}</p>
            <p class="text-sm opacity-80">{{ zone.subtitle }}</p>
            <p class="mt-2 text-xs uppercase tracking-[0.18em] opacity-70">{{ zone.chapters }}</p>
          </button>
        }
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <label class="space-y-2 text-sm font-semibold text-ink/70">
          Chapitre unique
          <input type="number" min="37" max="50" class="w-full rounded-2xl border-0 bg-white/80" [ngModel]="selection.chapter" (ngModelChange)="update({ chapter: $event ? +$event : null, zone: null, chapterStart: null, chapterEnd: null })" />
        </label>

        <label class="space-y-2 text-sm font-semibold text-ink/70">
          Début de plage
          <input type="number" min="37" max="50" class="w-full rounded-2xl border-0 bg-white/80" [ngModel]="selection.chapterStart" (ngModelChange)="update({ chapterStart: $event ? +$event : null, chapter: null, zone: null })" />
        </label>

        <label class="space-y-2 text-sm font-semibold text-ink/70">
          Fin de plage
          <input type="number" min="37" max="50" class="w-full rounded-2xl border-0 bg-white/80" [ngModel]="selection.chapterEnd" (ngModelChange)="update({ chapterEnd: $event ? +$event : null, chapter: null, zone: null })" />
        </label>
      </div>

      <div class="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
        <label class="flex items-center justify-between rounded-[24px] bg-ink/5 px-4 py-3">
          <span>
            <span class="block text-sm font-semibold text-ink">Rejouer mes erreurs</span>
            <span class="text-xs text-ink/60">Priorise les points faibles fréquents</span>
          </span>
          <input type="checkbox" class="rounded text-royal" [ngModel]="selection.includeErrors" (ngModelChange)="update({ includeErrors: !!$event })" />
        </label>

        <label class="flex items-center justify-between rounded-[24px] bg-ink/5 px-4 py-3">
          <span>
            <span class="block text-sm font-semibold text-ink">Questions non jouées</span>
            <span class="text-xs text-ink/60">Varie les angles de révision</span>
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
        <span class="text-sm font-semibold text-ink/60">Timer compétition</span>
        @for (timer of [10, 15, 20]; track timer) {
          <button type="button" (click)="update({ timerSeconds: timer })" class="rounded-full px-4 py-2 text-sm font-semibold transition" [class.bg-wine]="selection.timerSeconds === timer" [class.text-white]="selection.timerSeconds === timer" [class.bg-white]="selection.timerSeconds !== timer">
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

  readonly zones = ZONE_CATALOG;

  update(partial: Partial<QuizSelection>): void {
    this.selectionChange.emit({
      ...this.selection,
      ...partial
    });
  }
}
