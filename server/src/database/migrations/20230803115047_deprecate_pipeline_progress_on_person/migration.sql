-- AlterTable
ALTER TABLE "pipeline_progresses" ADD COLUMN     "deprecatedPointOfContactId" TEXT;

-- AddForeignKey
ALTER TABLE "pipeline_progresses" ADD CONSTRAINT "pipeline_progresses_deprecatedPointOfContactId_fkey" FOREIGN KEY ("deprecatedPointOfContactId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;
