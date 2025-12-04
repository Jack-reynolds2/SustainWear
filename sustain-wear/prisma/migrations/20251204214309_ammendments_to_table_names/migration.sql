/*
  Warnings:

  - You are about to drop the column `createdByUserId` on the `CharityApplication` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CharityApplication" DROP CONSTRAINT "CharityApplication_createdByUserId_fkey";

-- AlterTable
ALTER TABLE "CharityApplication" DROP COLUMN "createdByUserId",
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "CharityApplication" ADD CONSTRAINT "CharityApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
