/*
  Warnings:

  - You are about to drop the column `completedAt` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `lastSyncedAt` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `notionDatabaseId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `notionUrl` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Task` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Task_notionDatabaseId_idx";

-- DropIndex
DROP INDEX "Task_notionId_key";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "completedAt",
DROP COLUMN "lastSyncedAt",
DROP COLUMN "notionDatabaseId",
DROP COLUMN "notionUrl",
DROP COLUMN "startDate",
ADD COLUMN     "assignee" TEXT,
ADD COLUMN     "duration" INTEGER,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "priority" DROP DEFAULT;

-- CreateTable
CREATE TABLE "NotionSync" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "databaseId" TEXT NOT NULL,
    "lastSynced" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotionSync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotionSync_userId_idx" ON "NotionSync"("userId");

-- CreateIndex
CREATE INDEX "NotionSync_databaseId_idx" ON "NotionSync"("databaseId");

-- CreateIndex
CREATE UNIQUE INDEX "NotionSync_userId_databaseId_key" ON "NotionSync"("userId", "databaseId");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- AddForeignKey
ALTER TABLE "NotionSync" ADD CONSTRAINT "NotionSync_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
