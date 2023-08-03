/*
  Warnings:

  - You are about to drop the column `deprecatedPointOfContactId` on the `pipeline_progresses` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "pipeline_progresses" DROP CONSTRAINT "pipeline_progresses_deprecatedPointOfContactId_fkey";

-- AlterTable
ALTER TABLE "pipeline_progresses" DROP COLUMN "deprecatedPointOfContactId";
