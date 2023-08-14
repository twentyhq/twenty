-- DropForeignKey
ALTER TABLE "activity_targets" DROP CONSTRAINT "activity_targets_companyId_fkey";

-- DropForeignKey
ALTER TABLE "activity_targets" DROP CONSTRAINT "activity_targets_personId_fkey";

-- AddForeignKey
ALTER TABLE "activity_targets" ADD CONSTRAINT "activity_targets_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_targets" ADD CONSTRAINT "activity_targets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_progresses" ADD CONSTRAINT "pipeline_progresses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_progresses" ADD CONSTRAINT "pipeline_progresses_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;
