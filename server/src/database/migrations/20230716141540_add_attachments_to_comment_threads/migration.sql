-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('Image', 'Audio', 'Video', 'TextDocument', 'Spreadsheet', 'Archive', 'Other');

-- CreateTable
CREATE TABLE "CommentThreadAttachment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    "fullPath" TEXT NOT NULL,
    "type" "FileType" NOT NULL,
    "name" TEXT NOT NULL,
    "commentThreadId" TEXT NOT NULL,

    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "CommentThreadAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommentThreadAttachment" ADD CONSTRAINT "CommentThreadAttachment_commentThreadId_fkey" FOREIGN KEY ("commentThreadId") REFERENCES "comment_threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
