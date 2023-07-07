-- AlterTable
ALTER TABLE "comment_threads" ADD COLUMN     "body" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "authorId" TEXT;


-- Update field with a random user if some rows already exist...
UPDATE "comment_threads" 
SET "authorId" = (SELECT id FROM users LIMIT 1);


ALTER TABLE "comment_threads" 
ALTER COLUMN "authorId" SET NOT NULL;

ALTER TABLE "comment_threads" ADD CONSTRAINT "comment_threads_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
