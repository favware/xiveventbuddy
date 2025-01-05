-- CreateEnum
CREATE TYPE "event_interval" AS ENUM ('weekly', 'once_every_other_week', 'monthly', 'one_before_last_friday_of_the_month');

-- CreateEnum
CREATE TYPE "roles" AS ENUM ('all_rounder', 'healer', 'melee_dps', 'magic_ranged_dps', 'phys_ranged_dps', 'tank', 'absence', 'bench', 'late', 'tentative');

-- CreateEnum
CREATE TYPE "jobs" AS ENUM ('all_rounder', 'paladin', 'warrior', 'dragoon', 'monk', 'bard', 'black_mage', 'summoner', 'scholar', 'white_mage', 'ninja', 'dark_knight', 'machinist', 'astrologian', 'samurai', 'red_mage', 'blue_mage', 'gunbreaker', 'dancer', 'reaper', 'sage', 'viper', 'pictomancer');

-- CreateTable
CREATE TABLE "event_managers" (
    "id" TEXT NOT NULL,
    "discord_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verified_servers" (
    "id" TEXT NOT NULL,
    "discord_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verified_servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "description" TEXT,
    "interval" "event_interval",
    "leader" TEXT NOT NULL,
    "discord_event_id" TEXT,
    "role_to_ping" TEXT,
    "channel_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_instances" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "message_id" TEXT,
    "date_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "role" "roles" NOT NULL,
    "job" "jobs",
    "discord_id" TEXT NOT NULL,
    "signup_order" INTEGER NOT NULL,
    "event_instance_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_managers_discord_id_key" ON "event_managers"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "verified_servers_discord_id_key" ON "verified_servers"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_instances_event_id_key" ON "event_instances"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "participants_discord_id_key" ON "participants"("discord_id");

-- AddForeignKey
ALTER TABLE "event_instances" ADD CONSTRAINT "event_instances_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_event_instance_id_fkey" FOREIGN KEY ("event_instance_id") REFERENCES "event_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
