/*
  Warnings:

  - A unique constraint covering the columns `[notionId]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Task_projectId_idx";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "category" TEXT,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "notionDatabaseId" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSyncedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Task_notionId_key" ON "Task"("notionId");

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- CreateIndex
CREATE INDEX "Task_notionId_idx" ON "Task"("notionId");

-- CreateIndex
CREATE INDEX "Task_notionDatabaseId_idx" ON "Task"("notionDatabaseId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
