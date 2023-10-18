/*
  Warnings:

  - You are about to drop the column `workspaceMemberAssigneeId` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceMemberAuthorId` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceMemberAuthorId` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceMemberAuthorId` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceMemberAccountOwnerId` on the `companies` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_workspaceMemberAssigneeId_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_workspaceMemberAuthorId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_workspaceMemberAuthorId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_workspaceMemberAuthorId_fkey";

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_workspaceMemberAccountOwnerId_fkey";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "workspaceMemberAssigneeId",
DROP COLUMN "workspaceMemberAuthorId",
ADD COLUMN     "assigneeId" TEXT,
ADD COLUMN     "authorId" TEXT;

-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "workspaceMemberAuthorId",
ADD COLUMN     "authorId" TEXT;

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "workspaceMemberAuthorId",
ADD COLUMN     "authorId" TEXT;

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "workspaceMemberAccountOwnerId",
ADD COLUMN     "accountOwnerId" TEXT;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_accountOwnerId_fkey" FOREIGN KEY ("accountOwnerId") REFERENCES "workspace_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "workspace_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
