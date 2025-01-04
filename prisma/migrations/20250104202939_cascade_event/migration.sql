-- DropForeignKey
ALTER TABLE "event_instances" DROP CONSTRAINT "event_instances_event_id_fkey";

-- AddForeignKey
ALTER TABLE "event_instances" ADD CONSTRAINT "event_instances_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
