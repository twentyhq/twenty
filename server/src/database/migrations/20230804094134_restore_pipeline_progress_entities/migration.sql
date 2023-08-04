-- AddForeignKey
ALTER TABLE "pipeline_progresses" ADD CONSTRAINT "pipeline_progresses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_progresses" ADD CONSTRAINT "pipeline_progresses_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;
