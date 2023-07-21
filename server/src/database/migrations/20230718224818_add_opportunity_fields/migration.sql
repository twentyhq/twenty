/*
  Warnings:

  - Made the column `settingsId` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "pipeline_progresses" ADD COLUMN     "pointOfContactId" TEXT,
ADD COLUMN     "probability" INTEGER;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "settingsId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "pipeline_progresses" ADD CONSTRAINT "pipeline_progresses_pointOfContactId_fkey" FOREIGN KEY ("pointOfContactId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;
