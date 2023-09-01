/*
  Warnings:

  - The primary key for the `viewFields` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `viewFields` table. All the data in the column will be lost.
  - Added the required column `key` to the `viewFields` table without a default value. This is not possible if the table is not empty.
  - Made the column `viewId` on table `viewFields` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "viewFields_workspaceId_viewId_objectName_fieldName_key";

-- AlterTable
ALTER TABLE "viewFields" DROP CONSTRAINT "viewFields_pkey",
DROP COLUMN "id",
ADD COLUMN     "key" TEXT NOT NULL,
ALTER COLUMN "viewId" SET NOT NULL,
ADD CONSTRAINT "viewFields_pkey" PRIMARY KEY ("viewId", "key");
