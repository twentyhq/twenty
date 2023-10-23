-- CreateTable
CREATE TABLE "hooks" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "hooks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "hooks" ADD CONSTRAINT "hooks_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
