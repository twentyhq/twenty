CREATE TABLE `issueLabels` (
	`issueId` text,
	`labelId` text,
	FOREIGN KEY (`issueId`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`labelId`) REFERENCES `labels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `issues` (
	`id` text PRIMARY KEY NOT NULL,
	`externalId` text,
	`title` text,
	`body` text,
	`url` text,
	`createdAt` text,
	`updatedAt` text,
	`closedAt` text,
	`authorId` text,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `labels` (
	`id` text PRIMARY KEY NOT NULL,
	`externalId` text,
	`name` text,
	`color` text,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `pullRequestLabels` (
	`pullRequestExternalId` text,
	`labelId` text,
	FOREIGN KEY (`pullRequestExternalId`) REFERENCES `pullRequests`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`labelId`) REFERENCES `labels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pullRequests` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`body` text,
	`url` text,
	`createdAt` text,
	`updatedAt` text,
	`closedAt` text,
	`mergedAt` text,
	`authorId` text,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`avatarUrl` text,
	`url` text,
	`isEmployee` text
);
