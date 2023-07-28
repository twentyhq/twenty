-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "commentThreadId" DROP NOT NULL;
ALTER TABLE "comments" ADD COLUMN "activityId" TEXT NOT NULL;

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
    "personId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_targets_pkey" PRIMARY KEY ("id")
);
