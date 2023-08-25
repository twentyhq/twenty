-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "annualRecurringRevenue" INTEGER,
ADD COLUMN     "idealCustomerProfile" BOOLEAN DEFAULT false,
ADD COLUMN     "xUrl" TEXT;
