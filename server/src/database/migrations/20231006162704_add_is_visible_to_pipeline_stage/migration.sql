/*
  Warnings:

  - Added the required column `isVisible` to the `pipeline_stages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ViewFilterOperand" ADD VALUE 'IsNotNull';

-- AlterTable
ALTER TABLE "pipeline_stages" ADD COLUMN     "isVisible" BOOLEAN NOT NULL;
