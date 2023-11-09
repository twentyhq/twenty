/*
  Warnings:

  - You are about to drop the `hooks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "hooks" DROP CONSTRAINT "hooks_workspaceId_fkey";

-- DropTable
DROP TABLE "hooks";

-- CreateTable
CREATE TABLE "web_hooks" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "web_hooks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "web_hooks" ADD CONSTRAINT "web_hooks_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
