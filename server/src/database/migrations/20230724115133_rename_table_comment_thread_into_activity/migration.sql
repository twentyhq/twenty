-- Create the new tables first, without any foreign key constraints
-- Activities Table
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "body" TEXT,
    "title" TEXT,
    "type" "ActivityType" NOT NULL DEFAULT 'Note',
    "reminderAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "workspaceId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- Activity Targets Table
CREATE TABLE "activity_targets" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "commentableType" "CommentableType" NOT NULL,
    "commentableId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_targets_pkey" PRIMARY KEY ("id")
);

-- Copy data from old tables to new ones
-- From `comment_threads` to `activities`
INSERT INTO "activities" 
    ("id", "createdAt", "updatedAt", "deletedAt", "workspaceId", "body", "title", "authorId", "assigneeId", "completedAt", "dueAt", "reminderAt", "type") 
SELECT 
    "id", "createdAt", "updatedAt", "deletedAt", "workspaceId", "body", "title", "authorId", "assigneeId", "completedAt", "dueAt", "reminderAt", "type" 
FROM "comment_threads";

-- From `comment_thread_targets` to `activity_targets`
INSERT INTO "activity_targets" 
    ("id", "activityId", "commentableType", "commentableId", "deletedAt", "createdAt", "updatedAt") 
SELECT 
    "id", "commentThreadId", "commentableType", "commentableId", "deletedAt", "createdAt", "updatedAt" 
FROM "comment_thread_targets";


-- Add foreign key constraints after data has been copied
ALTER TABLE "activities" ADD CONSTRAINT "activities_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "activities" ADD CONSTRAINT "activities_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "activities" ADD CONSTRAINT "activities_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "activity_targets" ADD CONSTRAINT "activity_targets_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update the comments table to replace commentThreadId with activityId
ALTER TABLE "comments" RENAME COLUMN "commentThreadId" TO "activityId";

-- Add foreign key constraint on comments table
ALTER TABLE "comments" DROP CONSTRAINT "comments_commentThreadId_fkey";
ALTER TABLE "comments" ADD CONSTRAINT "comments_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update the attachments table to replace activityId foreign key reference
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_activityId_fkey";
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old foreign key constraints
ALTER TABLE "comment_thread_targets" DROP CONSTRAINT "comment_thread_targets_commentThreadId_fkey";
ALTER TABLE "comment_threads" DROP CONSTRAINT "comment_threads_assigneeId_fkey";
ALTER TABLE "comment_threads" DROP CONSTRAINT "comment_threads_authorId_fkey";
ALTER TABLE "comment_threads" DROP CONSTRAINT "comment_threads_workspaceId_fkey";

-- Drop old tables
DROP TABLE "comment_thread_targets";
DROP TABLE "comment_threads";
