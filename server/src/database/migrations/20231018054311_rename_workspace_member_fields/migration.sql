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
ALTER TABLE "activities" DROP CONSTRAINT "activities_workspaceMemberAuthorId_fkey";
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_workspaceMemberAuthorId_fkey";
ALTER TABLE "comments" DROP CONSTRAINT "comments_workspaceMemberAuthorId_fkey";
ALTER TABLE "companies" DROP CONSTRAINT "companies_workspaceMemberAccountOwnerId_fkey";

-- Rename columns instead of dropping
ALTER TABLE "activities" RENAME COLUMN "workspaceMemberAssigneeId" TO "assigneeId";
ALTER TABLE "activities" RENAME COLUMN "workspaceMemberAuthorId" TO "authorId";
ALTER TABLE "attachments" RENAME COLUMN "workspaceMemberAuthorId" TO "authorId";
ALTER TABLE "comments" RENAME COLUMN "workspaceMemberAuthorId" TO "authorId";
ALTER TABLE "companies" RENAME COLUMN "workspaceMemberAccountOwnerId" TO "accountOwnerId";

-- AddForeignKey back with renamed columns
ALTER TABLE "companies" ADD CONSTRAINT "companies_accountOwnerId_fkey" FOREIGN KEY ("accountOwnerId") REFERENCES "workspace_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "activities" ADD CONSTRAINT "activities_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activities" ADD CONSTRAINT "activities_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "workspace_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
