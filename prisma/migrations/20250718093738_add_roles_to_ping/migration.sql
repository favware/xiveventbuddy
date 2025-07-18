/*
  Warnings:

  - You are about to drop the `verified_servers` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "roles_to_ping" TEXT[];

-- DropTable
DROP TABLE "verified_servers";
