CREATE TABLE IF NOT EXISTS "githubStars" (
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"numberOfStars" integer
);
