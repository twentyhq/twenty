-- Temporarily rename 'locale' to 'old_locale' to keep its values
ALTER TABLE "users" RENAME COLUMN "locale" TO "old_locale";

-- Adding 'settingsId' to 'users' table without NOT NULL constraint initially
ALTER TABLE "users" ADD COLUMN "settingsId" TEXT;

-- Creating 'user_settings' table
CREATE TYPE "ColorScheme" AS ENUM ('Light', 'Dark', 'System');
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "colorScheme" "ColorScheme" NOT NULL DEFAULT 'System',
    "locale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- Use a PL/pgSQL block to process each user one by one
DO
$$
DECLARE
  row users%rowtype;
BEGIN
   FOR row IN SELECT * FROM users
  LOOP
      -- Insert a new row into `user_settings` and capture the generated id
      WITH new_setting AS (
        INSERT INTO "user_settings"("id", "locale", "updatedAt")
        VALUES((gen_random_uuid()::TEXT), row.old_locale, CURRENT_TIMESTAMP)
        RETURNING "id"
      )
      -- Update the `settingsId` field in `users` table with the generated id
      UPDATE "users"
      SET "settingsId" = (SELECT "id" FROM new_setting)
      WHERE "id" = row.id;
  END LOOP;
END
$$;

-- Applying constraints and indexes
ALTER TABLE "users" ALTER COLUMN "settingsId" SET NOT NULL;
CREATE UNIQUE INDEX "users_settingsId_key" ON "users"("settingsId");
ALTER TABLE "users" ADD CONSTRAINT "users_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "user_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Finally, dropping 'old_locale'
ALTER TABLE "users" DROP COLUMN "old_locale";
