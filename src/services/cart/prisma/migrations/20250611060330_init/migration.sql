/*
  Warnings:

  - The primary key for the `Cart` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `idUn` was added to the `Cart` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_pkey",
ADD COLUMN     "idUn" TEXT NOT NULL,
ADD CONSTRAINT "Cart_pkey" PRIMARY KEY ("idUn");
