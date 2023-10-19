/*
  Warnings:

  - Made the column `authorId` on table `activities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authorId` on table `attachments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authorId` on table `comments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "activities" ALTER COLUMN "authorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "attachments" ALTER COLUMN "authorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "authorId" SET NOT NULL;
