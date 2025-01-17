/*
  Warnings:

  - You are about to drop the column `bannerImage` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "bannerImage",
ADD COLUMN     "banner_image" TEXT;
