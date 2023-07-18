-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('Image', 'Audio', 'Video', 'TextDocument', 'Spreadsheet', 'Archive', 'Other');

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "fullPath" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "name" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "comment_threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
