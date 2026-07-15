import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  rateLimitBucket: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn()
  },
  $transaction: vi.fn()
}));

vi.mock('../config/database', () => ({ default: prismaMock }));

import { TursoRateLimitStore } from './tursoRateLimitStore';

describe('TursoRateLimitStore', () => {
  const store = new TursoRateLimitStore('test:');

  beforeEach(() => {
    vi.clearAllMocks();
    store.init({ windowMs: 60_000 } as any);
    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
  });

  it('creates a new bucket on the first request', async () => {
    prismaMock.rateLimitBucket.findUnique.mockResolvedValue(null);
    prismaMock.rateLimitBucket.upsert.mockResolvedValue({
      key: 'test:127.0.0.1',
      totalHits: 1,
      resetAt: new Date(Date.now() + 60_000)
    });

    const result = await store.increment('127.0.0.1');

    expect(result.totalHits).toBe(1);
    expect(prismaMock.rateLimitBucket.upsert).toHaveBeenCalledOnce();
  });

  it('increments an active bucket', async () => {
    const resetAt = new Date(Date.now() + 30_000);
    prismaMock.rateLimitBucket.findUnique.mockResolvedValue({
      key: 'test:user', totalHits: 2, resetAt
    });
    prismaMock.rateLimitBucket.update.mockResolvedValue({
      key: 'test:user', totalHits: 3, resetAt
    });

    const result = await store.increment('user');

    expect(result.totalHits).toBe(3);
    expect(prismaMock.rateLimitBucket.update).toHaveBeenCalledWith({
      where: { key: 'test:user' },
      data: { totalHits: { increment: 1 } }
    });
  });

  it('resets an expired bucket', async () => {
    prismaMock.rateLimitBucket.findUnique.mockResolvedValue({
      key: 'test:user', totalHits: 20, resetAt: new Date(Date.now() - 1_000)
    });
    prismaMock.rateLimitBucket.upsert.mockResolvedValue({
      key: 'test:user', totalHits: 1, resetAt: new Date(Date.now() + 60_000)
    });

    const result = await store.increment('user');

    expect(result.totalHits).toBe(1);
    expect(prismaMock.rateLimitBucket.upsert).toHaveBeenCalledOnce();
  });

  it('decrements and deletes scoped keys', async () => {
    prismaMock.rateLimitBucket.findUnique.mockResolvedValue({
      key: 'test:user', totalHits: 2, resetAt: new Date(Date.now() + 30_000)
    });

    await store.decrement('user');
    await store.resetKey('user');
    await store.resetAll();

    expect(prismaMock.rateLimitBucket.update).toHaveBeenCalledWith({
      where: { key: 'test:user' },
      data: { totalHits: { decrement: 1 } }
    });
    expect(prismaMock.rateLimitBucket.deleteMany).toHaveBeenNthCalledWith(1, {
      where: { key: 'test:user' }
    });
    expect(prismaMock.rateLimitBucket.deleteMany).toHaveBeenNthCalledWith(2, {
      where: { key: { startsWith: 'test:' } }
    });
  });
});
