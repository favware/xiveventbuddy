/*
  Warnings:

  - You are about to drop the column `reminder` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "event_instances" ADD COLUMN     "reminder" INTEGER;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "reminder";
