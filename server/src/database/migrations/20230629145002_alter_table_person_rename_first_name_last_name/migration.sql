-- AlterTable
ALTER TABLE "people"
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT;

-- Update new columns using old columns
UPDATE "people"
SET "firstName" = "firstname",
    "lastName" = "lastname";

-- Drop old columns
ALTER TABLE "people"
DROP COLUMN "firstname",
DROP COLUMN "lastname";

-- Make new columns NOT NULL
ALTER TABLE "people"
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;
