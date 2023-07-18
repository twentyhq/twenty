-- AlterTable
ALTER TABLE "pipeline_progresses" ADD COLUMN     "closeConfidence" INTEGER,
ADD COLUMN     "pointOfContactId" TEXT;

-- AddForeignKey
ALTER TABLE "pipeline_progresses" ADD CONSTRAINT "pipeline_progresses_pointOfContactId_fkey" FOREIGN KEY ("pointOfContactId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;
