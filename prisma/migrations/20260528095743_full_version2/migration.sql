/*
  Warnings:

  - You are about to drop the column `avatar` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "avatar",
ADD COLUMN     "post" TEXT;
