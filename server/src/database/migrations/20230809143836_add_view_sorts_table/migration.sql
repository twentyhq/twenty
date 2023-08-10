-- CreateEnum
CREATE TYPE "ViewSortDirection" AS ENUM ('asc', 'desc');

-- CreateTable
CREATE TABLE "viewSorts" (
    "direction" "ViewSortDirection" NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "viewSorts_pkey" PRIMARY KEY ("viewId","key")
);

-- AddForeignKey
ALTER TABLE "viewSorts" ADD CONSTRAINT "viewSorts_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "views"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewSorts" ADD CONSTRAINT "viewSorts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
