/*
  Warnings:

  - You are about to drop the column `commentableId` on the `activity_targets` table. All the data in the column will be lost.
  - You are about to drop the column `commentableType` on the `activity_targets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "activity_targets" DROP COLUMN "commentableId",
DROP COLUMN "commentableType";

-- DropEnum
DROP TYPE "CommentableType";
