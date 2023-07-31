-- AlterTable
ALTER TABLE "users" ADD COLUMN     "canImpersonate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "workspace_members" ADD COLUMN     "allowImpersonation" BOOLEAN NOT NULL DEFAULT true;
