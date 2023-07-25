/*
  Warnings:

  - You are about to drop the column `commentThreadId` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the `comment_thread_targets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comment_threads` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `activityId` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_activityId_fkey";

-- DropForeignKey
ALTER TABLE "comment_thread_targets" DROP CONSTRAINT "comment_thread_targets_commentThreadId_fkey";

-- DropForeignKey
ALTER TABLE "comment_threads" DROP CONSTRAINT "comment_threads_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "comment_threads" DROP CONSTRAINT "comment_threads_authorId_fkey";

-- DropForeignKey
ALTER TABLE "comment_threads" DROP CONSTRAINT "comment_threads_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_commentThreadId_fkey";

-- AlterTable
ALTER TABLE "activity_targets" ALTER COLUMN "personId" DROP NOT NULL,
ALTER COLUMN "companyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "commentThreadId",
ADD COLUMN     "activityId" TEXT NOT NULL;

-- DropTable
DROP TABLE "comment_thread_targets";

-- DropTable
DROP TABLE "comment_threads";

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_targets" ADD CONSTRAINT "activity_targets_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_targets" ADD CONSTRAINT "activity_targets_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_targets" ADD CONSTRAINT "activity_targets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_targets" ADD CONSTRAINT "activity_targets_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
