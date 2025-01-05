-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_event_instance_id_fkey";

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_event_instance_id_fkey" FOREIGN KEY ("event_instance_id") REFERENCES "event_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
