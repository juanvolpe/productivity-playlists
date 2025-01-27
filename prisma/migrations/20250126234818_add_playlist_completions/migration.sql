/*
  Warnings:

  - You are about to drop the column `friday` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `monday` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `saturday` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `sunday` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `thursday` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `tuesday` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `wednesday` on the `Playlist` table. All the data in the column will be lost.
  - Added the required column `title` to the `Playlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "friday",
DROP COLUMN "monday",
DROP COLUMN "name",
DROP COLUMN "saturday",
DROP COLUMN "sunday",
DROP COLUMN "thursday",
DROP COLUMN "tuesday",
DROP COLUMN "wednesday",
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PlaylistCompletion" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlaylistCompletion_playlistId_idx" ON "PlaylistCompletion"("playlistId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistCompletion_playlistId_date_key" ON "PlaylistCompletion"("playlistId", "date");

-- AddForeignKey
ALTER TABLE "PlaylistCompletion" ADD CONSTRAINT "PlaylistCompletion_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
