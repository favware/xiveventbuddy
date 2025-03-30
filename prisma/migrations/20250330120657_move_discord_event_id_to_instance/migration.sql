/*
  Warnings:

  - You are about to drop the column `discord_event_id` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "event_instances" ADD COLUMN     "discord_event_id" TEXT;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "discord_event_id";
