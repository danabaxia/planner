/*
  Warnings:

  - You are about to drop the column `mappingConfig` on the `NotionSchemaMapping` table. All the data in the column will be lost.
  - You are about to drop the column `lastSynced` on the `NotionSync` table. All the data in the column will be lost.
  - Added the required column `defaultMappings` to the `NotionSchemaMapping` table without a default value. This is not possible if the table is not empty.
  - Added the required column `properties` to the `NotionSchemaMapping` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "NotionSchemaMapping" DROP CONSTRAINT "NotionSchemaMapping_userId_fkey";

-- DropForeignKey
ALTER TABLE "NotionSync" DROP CONSTRAINT "NotionSync_userId_fkey";

-- AlterTable
ALTER TABLE "NotionSchemaMapping" DROP COLUMN "mappingConfig",
ADD COLUMN     "customMappings" JSONB,
ADD COLUMN     "defaultMappings" JSONB NOT NULL,
ADD COLUMN     "properties" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "NotionSync" DROP COLUMN "lastSynced",
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "error" TEXT,
ADD COLUMN     "lastSyncResult" JSONB,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "nextSyncAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "syncInterval" INTEGER;

-- CreateIndex
CREATE INDEX "NotionSync_status_idx" ON "NotionSync"("status");

-- CreateIndex
CREATE INDEX "NotionSync_enabled_idx" ON "NotionSync"("enabled");

-- AddForeignKey
ALTER TABLE "NotionSchemaMapping" ADD CONSTRAINT "NotionSchemaMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotionSync" ADD CONSTRAINT "NotionSync_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
