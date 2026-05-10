import { Injectable } from '@angular/core';
import { del, get, set } from 'idb-keyval';

import { PendingSyncItem } from '../core/models/quiz.models';

@Injectable({ providedIn: 'root' })
export class OfflineCacheService {
  private readonly pendingKey = 'jq:pending-sync';

  async read<T>(key: string): Promise<T | null> {
    return (await get<T>(key)) ?? null;
  }

  async write<T>(key: string, value: T): Promise<void> {
    await set(key, value);
  }

  async remove(key: string): Promise<void> {
    await del(key);
  }

  async enqueue(item: Omit<PendingSyncItem, 'id' | 'createdAt'>): Promise<void> {
    const queue = await this.getPendingItems();
    queue.push({
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    });

    await this.write(this.pendingKey, queue);
  }

  async getPendingItems(): Promise<PendingSyncItem[]> {
    return (await this.read<PendingSyncItem[]>(this.pendingKey)) ?? [];
  }

  async drain(sender: (item: PendingSyncItem) => Promise<void>): Promise<void> {
    const queue = await this.getPendingItems();
    const remaining: PendingSyncItem[] = [];

    for (const item of queue) {
      try {
        await sender(item);
      } catch {
        remaining.push(item);
      }
    }

    await this.write(this.pendingKey, remaining);
  }
}
