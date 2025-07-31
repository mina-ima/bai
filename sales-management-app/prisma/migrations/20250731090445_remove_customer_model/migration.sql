/*
  Warnings:

  - You are about to drop the column `customerId` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Delivery" DROP CONSTRAINT "Delivery_customerId_fkey";

-- AlterTable
ALTER TABLE "public"."Delivery" DROP COLUMN "customerId";

-- DropTable
DROP TABLE "public"."Customer";
