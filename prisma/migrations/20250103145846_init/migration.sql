-- CreateEnum
CREATE TYPE "interval" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "roles" AS ENUM ('all_rounder', 'healer', 'melee_dps', 'magic_ranged_dps', 'phys_ranged_dps', 'tank', 'absence', 'bench', 'late', 'tentative');

-- CreateEnum
CREATE TYPE "jobs" AS ENUM ('all_rounder', 'paladin', 'warrior', 'dragoon', 'monk', 'bard', 'black_mage', 'summoner', 'scholar', 'white_mage', 'ninja', 'dark_knight', 'machinist', 'astrologian', 'samurai', 'red_mage', 'blue_mage', 'gunbreaker', 'dancer', 'reaper', 'sage', 'viper', 'pictomancer');

-- CreateTable
CREATE TABLE "event_managers" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verified_servers" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verified_servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "interval" "interval",
    "leader" TEXT NOT NULL,
    "role_to_ping" TEXT,
    "channel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_instances" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "date_time" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "role" "roles" NOT NULL,
    "job" "jobs" NOT NULL,
    "discordId" TEXT NOT NULL,
    "signupOrder" INTEGER NOT NULL,
    "event_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_managers_discordId_key" ON "event_managers"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "verified_servers_discordId_key" ON "verified_servers"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "event_instances_event_id_key" ON "event_instances"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "participants_discordId_key" ON "participants"("discordId");

-- AddForeignKey
ALTER TABLE "event_instances" ADD CONSTRAINT "event_instances_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
