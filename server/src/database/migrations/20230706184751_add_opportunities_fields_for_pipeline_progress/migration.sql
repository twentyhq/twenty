-- AlterTable
ALTER TABLE "pipeline_progresses" ADD COLUMN     "closeDate" TIMESTAMP(3),
ADD COLUMN     "probability" TEXT,
ADD COLUMN     "recurring" TEXT;
