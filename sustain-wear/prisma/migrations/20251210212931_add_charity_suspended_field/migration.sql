-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "shippingQrCodeUrl" TEXT;

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false;
