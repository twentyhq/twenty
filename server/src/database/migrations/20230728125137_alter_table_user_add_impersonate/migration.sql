-- AlterTable
ALTER TABLE "users" ADD COLUMN     "allowImpersonation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canImpersonate" BOOLEAN NOT NULL DEFAULT false;
