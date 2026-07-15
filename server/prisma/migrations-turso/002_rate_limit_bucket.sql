CREATE TABLE IF NOT EXISTS "RateLimitBucket" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "totalHits" INTEGER NOT NULL DEFAULT 0,
    "resetAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS "RateLimitBucket_resetAt_idx"
    ON "RateLimitBucket"("resetAt");
