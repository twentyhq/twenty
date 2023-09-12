/*
  Warnings:

  - Made the column `idealCustomerProfile` on table `companies` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "workspaceMemberAssigneeId" TEXT,
ADD COLUMN     "workspaceMemberAuthorId" TEXT;

-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "workspaceMemberAuthorId" TEXT;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "workspaceMemberAuthorId" TEXT;

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "workspaceMemberAccountOwnerId" TEXT,
ALTER COLUMN "idealCustomerProfile" SET NOT NULL;

-- AlterTable
ALTER TABLE "workspace_members" ADD COLUMN     "settingsId" TEXT;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "user_settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_workspaceMemberAccountOwnerId_fkey" FOREIGN KEY ("workspaceMemberAccountOwnerId") REFERENCES "workspace_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_workspaceMemberAuthorId_fkey" FOREIGN KEY ("workspaceMemberAuthorId") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_workspaceMemberAssigneeId_fkey" FOREIGN KEY ("workspaceMemberAssigneeId") REFERENCES "workspace_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_workspaceMemberAuthorId_fkey" FOREIGN KEY ("workspaceMemberAuthorId") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_workspaceMemberAuthorId_fkey" FOREIGN KEY ("workspaceMemberAuthorId") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
