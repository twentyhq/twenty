/*
  Warnings:

  - You are about to drop the column `settingsId` on the `users` table. All the data in the column will be lost.
  - Made the column `settingsId` on table `workspace_members` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_settingsId_fkey";

-- DropForeignKey
ALTER TABLE "workspace_members" DROP CONSTRAINT "workspace_members_settingsId_fkey";

-- DropIndex
DROP INDEX "users_settingsId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "settingsId";

-- AlterTable
ALTER TABLE "workspace_members" ALTER COLUMN "settingsId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "user_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
