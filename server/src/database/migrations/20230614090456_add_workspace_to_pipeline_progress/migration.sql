/*
  Warnings:

  - Added the required column `workspaceId` to the `pipeline_progresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pipeline_progresses" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "pipeline_progresses" ADD CONSTRAINT "pipeline_progresses_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
