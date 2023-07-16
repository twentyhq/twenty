-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('Note', 'Task');

-- AlterTable
ALTER TABLE "comment_threads" ADD COLUMN     "assigneeId" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "dueAt" TIMESTAMP(3),
ADD COLUMN     "reminderAt" TIMESTAMP(3),
ADD COLUMN     "type" "ActivityType" NOT NULL DEFAULT 'Note';

-- AddForeignKey
ALTER TABLE "comment_threads" ADD CONSTRAINT "comment_threads_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
