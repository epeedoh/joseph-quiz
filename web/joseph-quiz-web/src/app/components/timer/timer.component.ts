import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, computed, signal } from '@angular/core';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-2 rounded-[24px] border border-white/20 bg-white/10 p-4 text-white backdrop-blur-lg">
      <div class="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/70">
        <span>Chrono</span>
        <span>{{ remainingSeconds() }}s</span>
      </div>
      <div class="h-3 overflow-hidden rounded-full bg-white/15">
        <div class="h-full rounded-full transition-all duration-150" [style.width.%]="progress()" [style.background]="barColor()"></div>
      </div>
    </div>
  `
})
export class TimerComponent implements OnChanges, OnDestroy {
  @Input() durationSeconds = 15;
  @Input() resetToken = 0;
  @Input() paused = false;
  @Output() readonly expired = new EventEmitter<void>();
  @Output() readonly remainingMsChange = new EventEmitter<number>();

  readonly remainingMs = signal(this.durationSeconds * 1_000);
  readonly progress = computed(() => (this.remainingMs() / (this.durationSeconds * 1_000)) * 100);
  readonly remainingSeconds = computed(() => Math.max(0, Math.ceil(this.remainingMs() / 1_000)));
  readonly barColor = computed(() => {
    const ratio = this.progress();

    if (ratio > 55) {
      return 'linear-gradient(90deg, #48bb78 0%, #d8b23f 100%)';
    }

    if (ratio > 25) {
      return 'linear-gradient(90deg, #d8b23f 0%, #f97316 100%)';
    }

    return 'linear-gradient(90deg, #f97316 0%, #dc2626 100%)';
  });

  private intervalId?: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetToken'] || changes['durationSeconds']) {
      this.restart(true);
      return;
    }

    if (changes['paused']) {
      if (this.paused) {
        this.stop();
      } else {
        this.restart(false);
      }
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private restart(resetValue: boolean): void {
    this.stop();

    if (resetValue) {
      this.remainingMs.set(this.durationSeconds * 1_000);
      this.remainingMsChange.emit(this.remainingMs());
    }

    if (this.paused) {
      return;
    }

    this.intervalId = window.setInterval(() => {
      if (this.paused) {
        return;
      }

      const nextValue = Math.max(0, this.remainingMs() - 100);
      this.remainingMs.set(nextValue);
      this.remainingMsChange.emit(nextValue);

      if (nextValue === 0) {
        this.stop();
        this.expired.emit();
      }
    }, 100);
  }

  private stop(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
