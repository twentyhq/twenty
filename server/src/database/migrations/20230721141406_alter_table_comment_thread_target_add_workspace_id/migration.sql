/*
  Warnings:

  - Added the required column `workspaceId` to the `comment_thread_targets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comment_thread_targets" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "comment_thread_targets" ADD CONSTRAINT "comment_thread_targets_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
