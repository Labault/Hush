-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_playerId_fkey";

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
