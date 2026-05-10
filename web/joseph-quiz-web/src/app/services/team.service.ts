import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../environments/environment';
import { TeamLeaderboardEntry, TeamSummary } from '../core/models/quiz.models';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpClient);

  createTeam(pseudo: string, teamName: string) {
    return this.http.post<TeamSummary>(`${environment.apiBaseUrl}/teams/create`, { pseudo, teamName });
  }

  joinTeam(pseudo: string, joinCode: string) {
    return this.http.post<TeamSummary>(`${environment.apiBaseUrl}/teams/join`, { pseudo, joinCode });
  }

  loadLeaderboard() {
    return this.http.get<TeamLeaderboardEntry[]>(`${environment.apiBaseUrl}/teams/leaderboard`);
  }
}
