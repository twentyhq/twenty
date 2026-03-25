CREATE TABLE IF NOT EXISTS "githubReleases" (
	"tagName" text PRIMARY KEY NOT NULL,
	"publishedAt" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "githubStars" (
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"numberOfStars" integer
);
