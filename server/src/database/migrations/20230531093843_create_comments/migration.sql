-- CreateEnum
CREATE TYPE "CommentableType" AS ENUM ('Person', 'Company');

-- CreateTable
CREATE TABLE "comment_threads" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "comment_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "body" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "commentThreadId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_thread_targets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "commentThreadId" TEXT NOT NULL,
    "commentableType" "CommentableType" NOT NULL,
    "commentableId" TEXT NOT NULL,

    CONSTRAINT "comment_thread_targets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comment_threads" ADD CONSTRAINT "comment_threads_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_commentThreadId_fkey" FOREIGN KEY ("commentThreadId") REFERENCES "comment_threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_thread_targets" ADD CONSTRAINT "comment_thread_targets_commentThreadId_fkey" FOREIGN KEY ("commentThreadId") REFERENCES "comment_threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
