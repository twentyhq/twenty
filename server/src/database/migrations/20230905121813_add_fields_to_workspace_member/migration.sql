/*
  Warnings:

  - Made the column `idealCustomerProfile` on table `companies` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "workspaceAssigneeId" TEXT,
ADD COLUMN     "workspaceAuthorId" TEXT;

-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "workspaceAuthorId" TEXT;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "workspaceAuthorId" TEXT;

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "workSpaceAccountOwnerId" TEXT,
ALTER COLUMN "idealCustomerProfile" SET NOT NULL;

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "workspaceUserId" TEXT;

-- AlterTable
ALTER TABLE "workspace_members" ADD COLUMN     "settingsId" TEXT;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "user_settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_workSpaceAccountOwnerId_fkey" FOREIGN KEY ("workSpaceAccountOwnerId") REFERENCES "workspace_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_workspaceUserId_fkey" FOREIGN KEY ("workspaceUserId") REFERENCES "workspace_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_workspaceAuthorId_fkey" FOREIGN KEY ("workspaceAuthorId") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_workspaceAssigneeId_fkey" FOREIGN KEY ("workspaceAssigneeId") REFERENCES "workspace_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_workspaceAuthorId_fkey" FOREIGN KEY ("workspaceAuthorId") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_workspaceAuthorId_fkey" FOREIGN KEY ("workspaceAuthorId") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
