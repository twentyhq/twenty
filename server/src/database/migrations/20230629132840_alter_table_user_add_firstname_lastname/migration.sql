-- AlterTable
ALTER TABLE "users" ADD COLUMN     "firstname" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lastname" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "displayName" DROP NOT NULL;
