/*
  Warnings:

  - You are about to drop the column `key` on the `api_keys` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "api_keys_key_key";

-- AlterTable
ALTER TABLE "api_keys" DROP COLUMN "key",
ADD COLUMN     "revokedAt" TIMESTAMP(3);
