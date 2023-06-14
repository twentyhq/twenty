/*
  Warnings:

  - You are about to drop the column `associableId` on the `pipeline_progresses` table. All the data in the column will be lost.
  - You are about to drop the column `associableType` on the `pipeline_progresses` table. All the data in the column will be lost.
  - Added the required column `progressableId` to the `pipeline_progresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `progressableType` to the `pipeline_progresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pipeline_progresses" RENAME "associableId" TO "progressableId";
ALTER TABLE "pipeline_progresses" RENAME "associableType" TO "progressableType";

