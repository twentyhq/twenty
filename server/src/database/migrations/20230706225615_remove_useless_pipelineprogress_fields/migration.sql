/*
  Warnings:

  - You are about to drop the column `probability` on the `pipeline_progresses` table. All the data in the column will be lost.
  - You are about to drop the column `recurring` on the `pipeline_progresses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pipeline_progresses" DROP COLUMN "probability",
DROP COLUMN "recurring";
