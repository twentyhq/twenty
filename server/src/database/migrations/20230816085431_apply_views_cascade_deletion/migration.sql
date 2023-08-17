-- DropForeignKey
ALTER TABLE "viewFields" DROP CONSTRAINT "viewFields_viewId_fkey";

-- DropForeignKey
ALTER TABLE "viewSorts" DROP CONSTRAINT "viewSorts_viewId_fkey";

-- AddForeignKey
ALTER TABLE "viewSorts" ADD CONSTRAINT "viewSorts_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "views"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewFields" ADD CONSTRAINT "viewFields_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "views"("id") ON DELETE CASCADE ON UPDATE CASCADE;
