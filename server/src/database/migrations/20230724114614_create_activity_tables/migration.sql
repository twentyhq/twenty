-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "commentThreadId" DROP NOT NULL;
ALTER TABLE "comments" ADD COLUMN "activityId" TEXT NOT NULL;

-- CreateTable
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

-- CreateTable
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
