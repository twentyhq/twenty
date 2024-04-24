CREATE TABLE IF NOT EXISTS "issueLabels" (
	"issueId" text,
	"labelId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issues" (
	"id" text PRIMARY KEY NOT NULL,
	"externalId" text,
	"title" text,
	"body" text,
	"url" text,
	"createdAt" text,
	"updatedAt" text,
	"closedAt" text,
	"authorId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "labels" (
	"id" text PRIMARY KEY NOT NULL,
	"externalId" text,
	"name" text,
	"color" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pullRequestLabels" (
	"pullRequestExternalId" text,
	"labelId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pullRequests" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"body" text,
	"url" text,
	"createdAt" text,
	"updatedAt" text,
	"closedAt" text,
	"mergedAt" text,
	"authorId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"avatarUrl" text,
	"url" text,
	"isEmployee" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issueLabels" ADD CONSTRAINT "issueLabels_issueId_issues_id_fk" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issueLabels" ADD CONSTRAINT "issueLabels_labelId_labels_id_fk" FOREIGN KEY ("labelId") REFERENCES "labels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues" ADD CONSTRAINT "issues_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pullRequestLabels" ADD CONSTRAINT "pullRequestLabels_pullRequestExternalId_pullRequests_id_fk" FOREIGN KEY ("pullRequestExternalId") REFERENCES "pullRequests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pullRequestLabels" ADD CONSTRAINT "pullRequestLabels_labelId_labels_id_fk" FOREIGN KEY ("labelId") REFERENCES "labels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pullRequests" ADD CONSTRAINT "pullRequests_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;