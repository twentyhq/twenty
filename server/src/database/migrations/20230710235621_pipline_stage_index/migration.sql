-- AlterTable
ALTER TABLE "pipeline_stages" ADD COLUMN     "index" INTEGER;

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "inviteHash" TEXT;
