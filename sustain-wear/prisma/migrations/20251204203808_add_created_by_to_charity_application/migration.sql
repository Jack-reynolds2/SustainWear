-- AlterTable
ALTER TABLE "CharityApplication" ADD COLUMN     "createdByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "CharityApplication" ADD CONSTRAINT "CharityApplication_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
