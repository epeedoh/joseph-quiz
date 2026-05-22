import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { environment } from '../../environments/environment';
import { OfflineCacheService } from './offline-cache.service';
import { PendingSyncItem, ProfileSummary, QuizResult } from '../core/models/quiz.models';

const PSEUDO_KEY = 'jq:pseudo';
const LEGACY_PROFILE_KEY = 'jq:profile';
const PROFILE_KEY_PREFIX = 'jq:profile:';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly offlineCache = inject(OfflineCacheService);
  private refreshPromise: Promise<void> | null = null;

  readonly pseudo = signal<string>(localStorage.getItem(PSEUDO_KEY) ?? '');
  readonly profile = signal<ProfileSummary | null>(null);
  readonly loading = signal(false);
  readonly online = signal(navigator.onLine);

  readonly tuniqueProgress = computed(() => {
    const profile = this.profile();
    if (!profile) {
      return 0;
    }

    if (profile.totalXp <= 100) {
      return profile.totalXp;
    }

    if (profile.totalXp <= 300) {
      return ((profile.totalXp - 101) / 199) * 100;
    }

    if (profile.totalXp <= 600) {
      return ((profile.totalXp - 301) / 299) * 100;
    }

    return Math.min(100, ((profile.totalXp - 601) / 500) * 100);
  });

  constructor() {
    window.addEventListener('online', () => this.online.set(true));
    window.addEventListener('offline', () => this.online.set(false));
    window.addEventListener('online', () => void this.refreshProfile());
    window.addEventListener('focus', () => void this.refreshProfile());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        void this.refreshProfile();
      }
    });

    if (this.pseudo()) {
      void this.refreshProfile();
    }
  }

  setPseudo(pseudo: string): void {
    const normalized = pseudo.trim();
    if (!normalized) {
      localStorage.removeItem(PSEUDO_KEY);
      this.pseudo.set('');
      this.profile.set(null);
      return;
    }

    localStorage.setItem(PSEUDO_KEY, normalized);
    this.pseudo.set(normalized);

    const currentProfile = this.profile();
    if (currentProfile?.pseudo.toLowerCase() === normalized.toLowerCase()) {
      this.profile.set({ ...currentProfile, pseudo: normalized });
      return;
    }

    if (!currentProfile) {
      this.profile.set(this.createEmptyProfile(normalized));
      return;
    }

    this.profile.set(this.createEmptyProfile(normalized));
  }

  async loadProfile(): Promise<void> {
    const currentPseudo = this.pseudo().trim();
    if (!currentPseudo) {
      return;
    }

    this.loading.set(true);
    const cacheKey = this.profileKey(currentPseudo);

    try {
      const profile = await this.http
        .get<ProfileSummary>(`${environment.apiBaseUrl}/profile/${encodeURIComponent(currentPseudo)}`)
        .toPromise();

      const resolvedProfile = profile ?? this.createEmptyProfile(currentPseudo);
      this.profile.set(resolvedProfile);
      await this.offlineCache.write(cacheKey, resolvedProfile);
    } catch {
      const cachedProfile = await this.readCachedProfile(currentPseudo);
      if (cachedProfile) {
        this.profile.set(cachedProfile);
      } else {
        const currentProfile = this.profile();
        if (currentProfile?.pseudo.trim().toLowerCase() === currentPseudo.toLowerCase()) {
          this.profile.set(currentProfile);
        } else {
          this.profile.set(this.createEmptyProfile(currentPseudo));
        }
      }
    } finally {
      this.loading.set(false);
    }
  }

  async refreshProfile(): Promise<void> {
    if (!this.pseudo().trim()) {
      return;
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      await this.syncPendingSubmissions();
      await this.loadProfile();
    })();

    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  async applyOptimisticResult(result: QuizResult): Promise<void> {
    const pseudo = this.pseudo().trim();
    if (!pseudo) {
      return;
    }

    const current = this.profile() ?? this.createEmptyProfile(pseudo);
    const normalizedCurrent = current.pseudo.trim().toLowerCase();
    const baseProfile = normalizedCurrent === pseudo.toLowerCase()
      ? current
      : this.createEmptyProfile(pseudo);

    const updated: ProfileSummary = {
      ...baseProfile,
      totalXp: baseProfile.totalXp + result.xpEarned,
      totalScore: baseProfile.totalScore + result.score,
      bestCombo: Math.max(baseProfile.bestCombo, result.maxCombo),
      levelTitle: result.levelTitle,
      badge: result.badge,
      accuracy: result.accuracy,
      recommendations: result.recommendations,
      recentScores: baseProfile.recentScores
    };

    this.profile.set(updated);
    await this.offlineCache.write(this.profileKey(updated.pseudo), updated);
  }

  async syncPendingSubmissions(): Promise<void> {
    await this.offlineCache.drain(async (item: PendingSyncItem) => {
      await this.http.post(`${environment.apiBaseUrl}/${item.endpoint}`, item.payload).toPromise();
    });
  }

  private profileKey(pseudo: string): string {
    return `${PROFILE_KEY_PREFIX}${pseudo.trim().toLowerCase()}`;
  }

  private async readCachedProfile(pseudo: string): Promise<ProfileSummary | null> {
    const profileKey = this.profileKey(pseudo);
    const cachedProfile = await this.offlineCache.read<ProfileSummary>(profileKey);
    if (cachedProfile) {
      return cachedProfile;
    }

    const legacyProfile = await this.offlineCache.read<ProfileSummary>(LEGACY_PROFILE_KEY);
    if (legacyProfile?.pseudo.trim().toLowerCase() === pseudo.trim().toLowerCase()) {
      await this.offlineCache.write(profileKey, legacyProfile);
      return legacyProfile;
    }

    return null;
  }

  private createEmptyProfile(pseudo: string): ProfileSummary {
    return {
      pseudo,
      totalXp: 0,
      totalScore: 0,
      levelTitle: 'Reveur Novice',
      badge: '🥉 Reveur',
      accuracy: 0,
      averageResponseTimeMs: 0,
      bestCombo: 0,
      teamName: null,
      recommendations: [],
      recentScores: []
    };
  }
}
