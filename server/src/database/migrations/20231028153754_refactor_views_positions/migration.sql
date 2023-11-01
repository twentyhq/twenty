/*
  Warnings:

  - You are about to drop the column `index` on the `pipeline_stages` table. All the data in the column will be lost.
  - You are about to drop the `viewFields` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `viewFilters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `viewSorts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `views` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "viewFields" DROP CONSTRAINT "viewFields_viewId_fkey";

-- DropForeignKey
ALTER TABLE "viewFields" DROP CONSTRAINT "viewFields_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "viewFilters" DROP CONSTRAINT "viewFilters_viewId_fkey";

-- DropForeignKey
ALTER TABLE "viewFilters" DROP CONSTRAINT "viewFilters_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "viewSorts" DROP CONSTRAINT "viewSorts_viewId_fkey";

-- DropForeignKey
ALTER TABLE "viewSorts" DROP CONSTRAINT "viewSorts_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "views" DROP CONSTRAINT "views_workspaceId_fkey";

-- AlterTable
ALTER TABLE "pipeline_stages" DROP COLUMN "index",
ADD COLUMN     "position" INTEGER;

-- DropTable
DROP TABLE "viewFields";

-- DropTable
DROP TABLE "viewFilters";

-- DropTable
DROP TABLE "viewSorts";

-- DropTable
DROP TABLE "views";

-- DropEnum
DROP TYPE "ViewFilterOperand";

-- DropEnum
DROP TYPE "ViewSortDirection";
