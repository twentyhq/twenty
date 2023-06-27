-- DropForeignKey
ALTER TABLE "comment_thread_targets" DROP CONSTRAINT "comment_thread_targets_commentThreadId_fkey";

-- AddForeignKey
ALTER TABLE "comment_thread_targets" ADD CONSTRAINT "comment_thread_targets_commentThreadId_fkey" FOREIGN KEY ("commentThreadId") REFERENCES "comment_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
