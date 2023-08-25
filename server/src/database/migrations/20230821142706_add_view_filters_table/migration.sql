-- CreateEnum
CREATE TYPE "ViewFilterOperand" AS ENUM ('Contains', 'DoesNotContain', 'GreaterThan', 'LessThan', 'Is', 'IsNot');

-- CreateTable
CREATE TABLE "viewFilters" (
    "displayValue" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "operand" "ViewFilterOperand" NOT NULL,
    "value" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "viewFilters_pkey" PRIMARY KEY ("viewId","key")
);

-- AddForeignKey
ALTER TABLE "viewFilters" ADD CONSTRAINT "viewFilters_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "views"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewFilters" ADD CONSTRAINT "viewFilters_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
