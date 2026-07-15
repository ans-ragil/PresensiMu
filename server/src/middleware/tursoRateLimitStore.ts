import type { IncrementResponse, Options, Store } from 'express-rate-limit';
import prisma from '../config/database';

export class TursoRateLimitStore implements Store {
  readonly localKeys = false;
  readonly prefix: string;
  private windowMs = 60_000;

  constructor(prefix = 'rate-limit:') {
    this.prefix = prefix;
  }

  init(options: Options) {
    this.windowMs = options.windowMs;
  }

  private storageKey(key: string) {
    return `${this.prefix}${key}`;
  }

  async get(key: string): Promise<IncrementResponse | undefined> {
    const bucket = await prisma.rateLimitBucket.findUnique({
      where: { key: this.storageKey(key) }
    });

    if (!bucket || bucket.resetAt <= new Date()) return undefined;
    return { totalHits: bucket.totalHits, resetTime: bucket.resetAt };
  }

  async increment(key: string): Promise<IncrementResponse> {
    const storageKey = this.storageKey(key);

    return prisma.$transaction(async (tx) => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + this.windowMs);
      const existing = await tx.rateLimitBucket.findUnique({
        where: { key: storageKey }
      });

      const bucket = !existing || existing.resetAt <= now
        ? await tx.rateLimitBucket.upsert({
            where: { key: storageKey },
            create: { key: storageKey, totalHits: 1, resetAt },
            update: { totalHits: 1, resetAt }
          })
        : await tx.rateLimitBucket.update({
            where: { key: storageKey },
            data: { totalHits: { increment: 1 } }
          });

      return { totalHits: bucket.totalHits, resetTime: bucket.resetAt };
    });
  }

  async decrement(key: string): Promise<void> {
    const storageKey = this.storageKey(key);
    const bucket = await prisma.rateLimitBucket.findUnique({
      where: { key: storageKey }
    });

    if (bucket && bucket.totalHits > 0) {
      await prisma.rateLimitBucket.update({
        where: { key: storageKey },
        data: { totalHits: { decrement: 1 } }
      });
    }
  }

  async resetKey(key: string): Promise<void> {
    await prisma.rateLimitBucket.deleteMany({
      where: { key: this.storageKey(key) }
    });
  }

  async resetAll(): Promise<void> {
    await prisma.rateLimitBucket.deleteMany({
      where: { key: { startsWith: this.prefix } }
    });
  }
}
