import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { environment } from '../../environments/environment';
import { LeaderboardEntry, TeamLeaderboardEntry } from '../core/models/quiz.models';
import { OfflineCacheService } from './offline-cache.service';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly http = inject(HttpClient);
  private readonly offlineCache = inject(OfflineCacheService);

  readonly loading = signal(false);
  readonly individual = signal<LeaderboardEntry[]>([]);
  readonly teams = signal<TeamLeaderboardEntry[]>([]);

  async loadAll(): Promise<void> {
    this.loading.set(true);

    try {
      const [individual, teams] = await Promise.all([
        this.http.get<LeaderboardEntry[]>(`${environment.apiBaseUrl}/leaderboard`).toPromise(),
        this.http.get<TeamLeaderboardEntry[]>(`${environment.apiBaseUrl}/teams/leaderboard`).toPromise()
      ]);

      this.individual.set(individual ?? []);
      this.teams.set(teams ?? []);

      await this.offlineCache.write('jq:leaderboard:individual', this.individual());
      await this.offlineCache.write('jq:leaderboard:teams', this.teams());
    } catch {
      this.individual.set((await this.offlineCache.read<LeaderboardEntry[]>('jq:leaderboard:individual')) ?? []);
      this.teams.set((await this.offlineCache.read<TeamLeaderboardEntry[]>('jq:leaderboard:teams')) ?? []);
    } finally {
      this.loading.set(false);
    }
  }
}
