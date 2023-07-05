-- AlterTable
ALTER TABLE "pipeline_progresses" ADD COLUMN     "amount" INTEGER;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "firstName" DROP DEFAULT,
ALTER COLUMN "lastName" DROP DEFAULT;
