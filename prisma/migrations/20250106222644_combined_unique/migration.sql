/*
  Warnings:

  - A unique constraint covering the columns `[event_instance_id,discord_id]` on the table `participants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "participants_event_instance_id_discord_id_key" ON "participants"("event_instance_id", "discord_id");
