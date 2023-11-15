-- DropForeignKey
ALTER TABLE "workspace_members" DROP CONSTRAINT "workspace_members_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "defaultWorkspaceId" TEXT;
