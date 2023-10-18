/*
  Warnings:

  - You are about to drop the column `assigneeId` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `accountOwnerId` on the `companies` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_authorId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_accountOwnerId_fkey";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "assigneeId",
DROP COLUMN "authorId";

-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "authorId";

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "authorId";

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "accountOwnerId";
