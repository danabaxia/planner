-- AlterTable
ALTER TABLE "User" ADD COLUMN     "selectedNotionDatabases" TEXT[] DEFAULT ARRAY[]::TEXT[];
