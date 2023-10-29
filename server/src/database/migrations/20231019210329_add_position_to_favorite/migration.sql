/*
  Warnings:

  - Added the required column `position` to the `favorites` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "favorites" ADD COLUMN     "position" DOUBLE PRECISION NOT NULL;
