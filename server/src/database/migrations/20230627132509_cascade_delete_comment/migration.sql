-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_commentThreadId_fkey";

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_commentThreadId_fkey" FOREIGN KEY ("commentThreadId") REFERENCES "comment_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
