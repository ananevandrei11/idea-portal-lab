-- Deduplicate any existing tokenHash rows before the unique index is added.
DELETE FROM "RefreshToken" a
USING "RefreshToken" b
WHERE a."tokenHash" = b."tokenHash" AND a.ctid > b.ctid;

ALTER TABLE "RefreshToken" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "RefreshToken" ADD COLUMN "replacedById" TEXT;

CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE UNIQUE INDEX "RefreshToken_replacedById_key" ON "RefreshToken"("replacedById");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_replacedById_fkey"
  FOREIGN KEY ("replacedById") REFERENCES "RefreshToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;
