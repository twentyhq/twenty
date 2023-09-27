-- Step 1: Add the new column
ALTER TABLE "refresh_tokens" ADD COLUMN "revokedAt" TIMESTAMP(3);

-- Step 2: Update the new column based on the isRevoked column value
UPDATE "refresh_tokens" SET "revokedAt" = NOW() - INTERVAL '1 day' WHERE "isRevoked" = TRUE;

-- Step 3: Drop the isRevoked column
ALTER TABLE "refresh_tokens" DROP COLUMN "isRevoked";
