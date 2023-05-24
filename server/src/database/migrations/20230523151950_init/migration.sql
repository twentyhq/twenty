-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_accountOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "people" DROP CONSTRAINT "people_companyId_fkey";

-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "accountOwnerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "people" ALTER COLUMN "companyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_accountOwnerId_fkey" FOREIGN KEY ("accountOwnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
