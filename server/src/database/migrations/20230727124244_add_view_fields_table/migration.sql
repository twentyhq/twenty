-- CreateTable
CREATE TABLE "viewFields" (
    "id" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL,
    "objectName" TEXT NOT NULL,
    "sizeInPx" INTEGER NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "viewFields_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "viewFields" ADD CONSTRAINT "viewFields_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
