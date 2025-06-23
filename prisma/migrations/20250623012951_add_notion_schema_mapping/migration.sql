-- CreateTable
CREATE TABLE "NotionSchemaMapping" (
    "id" TEXT NOT NULL,
    "databaseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mappingConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotionSchemaMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotionSchemaMapping_userId_idx" ON "NotionSchemaMapping"("userId");

-- CreateIndex
CREATE INDEX "NotionSchemaMapping_databaseId_idx" ON "NotionSchemaMapping"("databaseId");

-- CreateIndex
CREATE UNIQUE INDEX "NotionSchemaMapping_userId_databaseId_key" ON "NotionSchemaMapping"("userId", "databaseId");

-- AddForeignKey
ALTER TABLE "NotionSchemaMapping" ADD CONSTRAINT "NotionSchemaMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
