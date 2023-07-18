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

-- Applying constraints and indexes
ALTER TABLE "users" ALTER COLUMN "settingsId" SET NOT NULL;
CREATE UNIQUE INDEX "users_settingsId_key" ON "users"("settingsId");
ALTER TABLE "users" ADD CONSTRAINT "users_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "user_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

