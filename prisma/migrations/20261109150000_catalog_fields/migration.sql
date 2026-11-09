-- AlterEnum
ALTER TYPE "AgeBand" ADD VALUE 'TEEN';

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "ageLabel" TEXT,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "shortName" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "code" TEXT,
ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "needsReview" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");
