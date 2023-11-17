/*
  Warnings:

  - You are about to drop the column `userId` on the `user_settings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_settings" DROP CONSTRAINT "user_settings_userId_fkey";

-- AlterTable
ALTER TABLE "user_settings" DROP COLUMN "userId";
