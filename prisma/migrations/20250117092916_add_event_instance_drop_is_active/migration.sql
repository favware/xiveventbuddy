/*
  Warnings:

  - You are about to drop the column `is_active` on the `event_instances` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "event_instances" DROP COLUMN "is_active";
