-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NowPlaying" (
    "roomId" INTEGER NOT NULL,
    "videoLink" TEXT NOT NULL,
    "lastUpdateAt" TIMESTAMP(3) NOT NULL,
    "position" INTEGER NOT NULL,
    "paused" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "NowPlaying_roomId_key" ON "NowPlaying"("roomId");

-- AddForeignKey
ALTER TABLE "NowPlaying" ADD CONSTRAINT "NowPlaying_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
