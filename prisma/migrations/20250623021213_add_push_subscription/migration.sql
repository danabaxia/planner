-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pushSubscription" JSONB;

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
