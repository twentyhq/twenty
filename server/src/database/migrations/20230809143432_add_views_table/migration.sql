/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,viewId,objectName,fieldName]` on the table `viewFields` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ViewType" AS ENUM ('Table', 'Pipeline');

-- AlterTable
ALTER TABLE "viewFields" ADD COLUMN     "viewId" TEXT;

-- CreateTable
CREATE TABLE "views" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "type" "ViewType" NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "views_workspaceId_type_objectId_name_key" ON "views"("workspaceId", "type", "objectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "viewFields_workspaceId_viewId_objectName_fieldName_key" ON "viewFields"("workspaceId", "viewId", "objectName", "fieldName");

-- AddForeignKey
-- ALTER TABLE "pipeline_progresses" ADD CONSTRAINT "pipeline_progresses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
-- ALTER TABLE "pipeline_progresses" ADD CONSTRAINT "pipeline_progresses_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "views" ADD CONSTRAINT "views_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewFields" ADD CONSTRAINT "viewFields_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "views"("id") ON DELETE SET NULL ON UPDATE CASCADE;
