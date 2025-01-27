/*
  Warnings:

  - You are about to drop the column `title` on the `Playlist` table. All the data in the column will be lost.
  - Added the required column `name` to the `Playlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "title",
ADD COLUMN     "friday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "monday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "saturday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sunday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "thursday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tuesday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wednesday" BOOLEAN NOT NULL DEFAULT false;
