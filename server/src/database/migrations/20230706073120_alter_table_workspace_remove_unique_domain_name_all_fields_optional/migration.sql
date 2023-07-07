-- DropIndex
DROP INDEX "workspaces_domainName_key";

-- AlterTable
ALTER TABLE "workspaces" ALTER COLUMN "domainName" DROP NOT NULL,
ALTER COLUMN "displayName" DROP NOT NULL;
